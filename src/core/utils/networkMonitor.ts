import WebSocket from 'ws';
import { WebDriver } from "selenium-webdriver";
import logger from "./logger.js";
import * as allure from "allure-js-commons";

enum NetworkErrorCategory {
  SERVER_ERROR = "[SERVER 5xx]",
  CLIENT_ERROR = "[CLIENT 4xx]",
  CONNECTION_FAILED = "[CONNECTION FAILED]",
  SECURITY_BLOCK = "[SECURITY/CORS]"
}

export interface NetworkMonitorHandle {
  stop(): Promise<void>;
}

export async function startNetworkMonitoring(
  driver: WebDriver,
  label: string = "NetworkMonitor"
): Promise<NetworkMonitorHandle | null> {
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
    let networkLogs: string[] = [];

    return new Promise((resolve) => {
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
          ws.send(JSON.stringify({ id: 3, method: "Network.enable", sessionId: attachedSessionId }));
          ws.send(JSON.stringify({ id: 4, method: "Page.enable", sessionId: attachedSessionId }));
        }

        // FASE 3: Confirmación (ACK) - Solo aquí el driver está "listo"
        if (msg.id === 4 && msg.result) {
          logger.debug("CDP Network Monitoring sincronizado", { label });
          resolve({
            stop: async () => {
              const errorCount = networkLogs.length;
              if (errorCount > 0) {
                // 1. El adjunto que ya tienes
                await allure.attachment(`Network_Issues_${label}`, networkLogs.join('\n'), "text/plain");
                // 2. Nueva etiqueta para filtrar en el reporte web
                await allure.tag("network-issues");
                // 3. Añadir un mensaje descriptivo al test (opcional)
                await allure.descriptionHtml(`<b>Atención:</b> Se detectaron ${errorCount} errores de red.`);
              }
              ws.removeAllListeners();
              ws.close();

              // IMPORTANTE: Retornamos el conteo para que el test sepa qué pasó
              return { errorCount, logs: networkLogs };
            }
          });
        }

        // FASE 4: Captura de Tráfico
        if (msg.sessionId === attachedSessionId) {
          if (msg.method === 'Network.responseReceived') {
            const { response, type } = msg.params;
            if (['XHR', 'Fetch', 'Document'].includes(type) && response.status >= 400) {
              const category = response.status >= 500 ? NetworkErrorCategory.SERVER_ERROR : NetworkErrorCategory.CLIENT_ERROR;
              const logMsg = `${category} Status: ${response.status} | URL: ${response.url}`;
              networkLogs.push(logMsg);
              logger.warn(logMsg, { label });
            }
          }
          if (msg.method === 'Network.loadingFailed') {
            const { errorText, canceled } = msg.params;
            if (!canceled) {
              const logMsg = `${NetworkErrorCategory.CONNECTION_FAILED} Reason: ${errorText}`;
              networkLogs.push(logMsg);
              logger.error(logMsg, { label });
            }
          }
        }
      });

      ws.on('error', (err) => {
        logger.error(`Error CDP: ${err.message}`, { label });
        resolve(null);
      });
    });
  } catch (e) {
    return null;
  }
}