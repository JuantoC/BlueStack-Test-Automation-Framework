import WebSocket from 'ws';
import { WebDriver } from "selenium-webdriver";
import logger from "../utils/logger.js";
import * as allure from "allure-js-commons";

/**
 * Evento de toast capturado por el monitor CDP.
 * Representa un único toast de notificación disparado por el CMS.
 */
export interface ToastEvent {
  type: 'success' | 'error' | 'warning';
  title: string;
  detail: string;
  route: string;
  timestamp: number;
}

/**
 * Resumen de la actividad de toasts capturada durante una sesión de prueba.
 * Retornado por `ToastMonitorHandle.stop()` al finalizar el monitoreo CDP.
 */
export interface ToastSummary {
  errorCount: number;
  warningCount: number;
  successCount: number;
  events: ToastEvent[];
}

/**
 * Handle de control del monitor de toasts CDP activo durante una sesión de prueba.
 * Permite detener el monitoreo, obtener el resumen de toasts capturados y esperar
 * activamente un toast de éxito con timeout configurable.
 * Retornado por `startToastMonitoring` y usado en el bloque `finally` de `runSession`.
 */
export interface ToastMonitorHandle {
  stop(): Promise<ToastSummary>;
  waitForSuccess(timeoutMs?: number): Promise<void>;
}

// Script del MutationObserver inyectado en cada carga de página.
// Observa el contenedor de toasts y dispara el binding CDP `bsToastEvent` por cada toast añadido.
const OBSERVER_SCRIPT = `
(function() {
  window.__bsToastObserverActive__ = false;
  var container = document.querySelector('div#toast-container');
  if (!container) return;
  window.__bsToastObserverActive__ = true;
  var obs = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (!(node instanceof Element)) return;
        var type = node.classList.contains('toast-success') ? 'success'
                 : node.classList.contains('toast-error')   ? 'error'
                 : node.classList.contains('toast-warning')  ? 'warning'
                 : null;
        if (!type) return;
        var title  = (node.querySelector('.toast-title')        || {}).textContent || '';
        var detail = (node.querySelector('.toast-error-detail') || {}).textContent || '';
        var route  = (node.querySelector('.toast-error-route')  || {}).textContent || '';
        window.bsToastEvent(JSON.stringify({
          type: type,
          title: title.trim(),
          detail: detail.trim(),
          route: route.trim(),
          timestamp: Date.now()
        }));
      });
    });
  });
  obs.observe(container, { childList: true });
})()
`;

/**
 * Inicia el monitoreo de toasts de notificación via CDP (Chrome DevTools Protocol) para la sesión activa.
 * Inyecta un MutationObserver en el DOM que captura eventos de toast de forma pasiva, sin polling.
 * El binding `bsToastEvent` persiste entre navegaciones; el Observer se re-inyecta en cada
 * `Page.loadEventFired` porque el DOM es destruido y recreado en cada navegación.
 * La inicialización es asíncrona y basada en ACK: resuelve solo cuando CDP confirma estar listo.
 *
 * @param driver - Instancia activa de WebDriver con capacidades CDP disponibles.
 * @param label - Identificador de trazabilidad para los logs del monitor. Por defecto `"ToastMonitor"`.
 * @returns {Promise<ToastMonitorHandle | null>} Handle para controlar el monitor, o `null` si CDP no está disponible.
 */
export async function startToastMonitoring(
  driver: WebDriver,
  label: string = "ToastMonitor"
): Promise<ToastMonitorHandle | null> {
  try {
    const caps = await driver.getCapabilities();
    let cdpUrl = caps.get('se:cdp') as string;

    // --- Lógica de Rescate para Local (WSL/Windows) ---
    if (!cdpUrl) {
      const chromeOptions = caps.get('goog:chromeOptions') as any;
      if (chromeOptions?.debuggerAddress) {
        const response = await fetch(`http://${chromeOptions.debuggerAddress}/json/version`);
        const data = await response.json() as any;
        cdpUrl = data.webSocketDebuggerUrl;
      }
    }

    if (!cdpUrl) return null;

    // Parche para Docker Grid en localhost
    if (cdpUrl.includes('172.') && cdpUrl.includes(':4444')) {
      cdpUrl = cdpUrl.replace(/172\.\d+\.\d+\.\d+/, 'localhost');
    }

    const ws = new WebSocket(cdpUrl);
    let attachedSessionId: string | null = null;
    let toastEvents: ToastEvent[] = [];
    let successWaiters: Array<{
      resolve: () => void;
      reject: (e: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }> = [];
    // Contador para IDs de re-inyección del Observer (empieza en 10 para no colisionar con ids 1-5 de init)
    let reinjectionCounter = 10;

    return new Promise<ToastMonitorHandle | null>((resolve) => {
      ws.on('open', () => ws.send(JSON.stringify({ id: 1, method: "Target.getTargets" })));

      ws.on('message', async (data) => {
        const msg = JSON.parse(data.toString());

        // FASE 1: Descubrimiento y Attach
        if (msg.id === 1 && msg.result?.targetInfos) {
          const page = msg.result.targetInfos.find((t: any) => t.type === 'page');
          if (page) {
            ws.send(JSON.stringify({
              id: 2, method: "Target.attachToTarget",
              params: { targetId: page.targetId, flatten: true }
            }));
          }
        }

        // FASE 2: Activación de Protocolos
        if (msg.id === 2 && msg.result?.sessionId) {
          attachedSessionId = msg.result.sessionId;
          ws.send(JSON.stringify({ id: 3, method: "Runtime.enable", sessionId: attachedSessionId }));
          ws.send(JSON.stringify({
            id: 4, method: "Runtime.addBinding",
            params: { name: "bsToastEvent" }, sessionId: attachedSessionId
          }));
          ws.send(JSON.stringify({ id: 5, method: "Page.enable", sessionId: attachedSessionId }));
        }

        // FASE 3: Confirmación (ACK) — el monitor está listo. Inyectar Observer en la página actual de inmediato.
        if (msg.id === 5 && msg.result) {
          ws.send(JSON.stringify({
            id: 6,
            method: "Runtime.evaluate",
            params: { expression: OBSERVER_SCRIPT },
            sessionId: attachedSessionId
          }));
          logger.debug("CDP Toast Monitoring sincronizado", { label });
          resolve({
            waitForSuccess: (timeoutMs = 5000) => new Promise<void>((res, rej) => {
              // Si ya hay un evento de éxito en el buffer, resolver inmediatamente
              if (toastEvents.some(e => e.type === 'success')) {
                res();
                return;
              }
              const timer = setTimeout(() => {
                rej(new Error(
                  `[ToastMonitor] waitForSuccess: No se detectó toast de éxito en ${timeoutMs}ms.`
                ));
              }, timeoutMs);
              successWaiters.push({ resolve: res, reject: rej, timer });
            }),

            stop: async (): Promise<ToastSummary> => {
              successWaiters.forEach(w => {
                clearTimeout(w.timer);
                w.reject(new Error('[ToastMonitor] Monitor detenido antes de recibir toast de éxito.'));
              });
              successWaiters = [];

              const summary: ToastSummary = {
                errorCount: toastEvents.filter(e => e.type === 'error').length,
                warningCount: toastEvents.filter(e => e.type === 'warning').length,
                successCount: toastEvents.filter(e => e.type === 'success').length,
                events: toastEvents
              };

              if (summary.errorCount + summary.warningCount > 0) {
                logger.warn(
                  `[ToastMonitor] Resumen: ${summary.errorCount} error(s), ` +
                  `${summary.warningCount} advertencia(s), ${summary.successCount} éxito(s)`,
                  { label }
                );
                const text = toastEvents.map(e =>
                  `[${new Date(e.timestamp).toISOString()}] ${e.type.toUpperCase()} | ${e.title} | ${e.detail} | ${e.route}`
                ).join('\n');
                await allure.attachment(
                  `Toast_Events_${label}`,
                  Buffer.from(text, 'utf-8'),
                  'text/plain'
                );
              }

              ws.removeAllListeners();
              ws.close();
              return summary;
            }
          });
        }

        // FASE 4: Listener continuo
        if (msg.sessionId === attachedSessionId) {
          // a) Toast capturado desde el binding del DOM
          if (msg.method === 'Runtime.bindingCalled' && msg.params?.name === 'bsToastEvent') {
            try {
              const event = JSON.parse(msg.params.payload) as ToastEvent;
              toastEvents.push(event);

              if (event.type === 'error' || event.type === 'warning') {
                const logLine = `[ToastMonitor] Toast ${event.type.toUpperCase()} | ${event.title}${event.detail ? ' | ' + event.detail : ''}${event.route ? ' | ' + event.route : ''}`;
                if (event.type === 'error') {
                  logger.error(logLine, { label });
                } else {
                  logger.warn(logLine, { label });
                }
                try {
                  const screenshot = await driver.takeScreenshot();
                  await allure.attachment(
                    `Toast_${event.type.toUpperCase()}_${new Date(event.timestamp).toISOString().replace(/[:.]/g, '-')}`,
                    Buffer.from(screenshot, 'base64'),
                    'image/png'
                  );
                } catch (screenshotErr) {
                  logger.warn(`[ToastMonitor] No se pudo capturar screenshot del toast: ${screenshotErr}`, { label });
                }
              } else {
                logger.debug(`[ToastMonitor] Toast capturado: ${event.type} | ${event.title}`, { label });
              }

              if (event.type === 'success') {
                successWaiters.forEach(w => { clearTimeout(w.timer); w.resolve(); });
                successWaiters = [];
              }
            } catch (e) {
              logger.error(`[ToastMonitor] Error parseando payload del binding: ${e}`, { label });
            }
          }

          // b) Navegación: resetear flag y re-inyectar el Observer en el nuevo DOM
          if (msg.method === 'Page.loadEventFired') {
            const resetId = reinjectionCounter++;
            const injectId = reinjectionCounter++;
            ws.send(JSON.stringify({
              id: resetId,
              method: "Runtime.evaluate",
              params: { expression: "window.__bsToastObserverActive__ = false;" },
              sessionId: attachedSessionId
            }));
            ws.send(JSON.stringify({
              id: injectId,
              method: "Runtime.evaluate",
              params: { expression: OBSERVER_SCRIPT },
              sessionId: attachedSessionId
            }));
          }
        }
      });

      ws.on('error', (err) => {
        logger.error(`Error CDP Toast Monitor: ${err.message}`, { label });
        resolve(null);
      });
    });
  } catch (e) {
    return null;
  }
}
