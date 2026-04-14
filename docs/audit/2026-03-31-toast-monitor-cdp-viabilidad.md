# Análisis de Viabilidad: Toast Monitor basado en CDP con Soft Assertions

**Fecha:** 2026-03-31  
**Autor:** Claude Code (auditoría de viabilidad arquitectónica)  
**Estado:** Análisis completado — pendiente de decisión de implementación  
**Prerrequisito:** Leer primero `docs/audit/2026-03-31-banners-monitoreo-centralizado.md` para contexto completo del problema.

---

## Resumen ejecutivo

La implementación de un monitor de toasts basado en CDP es **técnicamente viable** mediante la combinación de `Runtime.addBinding` (CDP) y un `MutationObserver` inyectado en el browser. Este enfoque replica con precisión el patrón arquitectónico del `networkMonitor.ts` existente: captura pasiva de eventos durante el test, reporte al final en el bloque `finally`, sin interrumpir el flujo. El mecanismo de hard assertion (validación obligatoria de toast success) puede coexistir como método adicional en el handle del monitor.

**Veredicto de viabilidad:** ✅ Viable — sin dependencias externas nuevas, sin cambios en el ciclo de vida del driver, alineado con la arquitectura existente.

---

## 1. Inventario técnico — base disponible

### 1.1 El patrón del networkMonitor actual

El `networkMonitor.ts` implementa un monitor CDP en 4 fases sobre un WebSocket de bajo nivel:

```
FASE 1: Target.getTargets → identificar la pestaña activa
FASE 2: Target.attachToTarget + Network.enable + Page.enable → activar protocolos
FASE 3: ACK (confirmación de id=4) → resuelve la Promise, libera el driver
FASE 4: Listener continuo → filtra eventos Network.responseReceived y Network.loadingFailed
```

**El handle retornado** expone solo `stop(): Promise<NetworkSummary>`. Su contrato:
1. Cuenta `networkLogs.length`
2. Si hay errores, adjunta un `.txt` a Allure
3. Cierra el WebSocket (`ws.removeAllListeners(); ws.close()`)
4. Retorna `{ errorCount, logs }`

**El testWrapper** llama `stop()` en el bloque `finally`, **después** de que el test pasó o falló, y **antes** de cerrar el driver. Si `errorCount > 0`, lanza un error que falla el test de forma diferida — la causa raíz ya está en el log.

### 1.2 Estado del WebSocket CDP en el proyecto

- La conexión CDP es un WebSocket **puro** (librería `ws`), no la API de alto nivel de Selenium 4
- El `sessionId` adjuntado en FASE 2 es la sesión de Target que habilita enviar y recibir eventos de la pestaña
- El mismo `sessionId` permite habilitar **cualquier dominio CDP adicional** (`Runtime`, `DOM`, etc.) enviando comandos al mismo WebSocket
- **El WebSocket está completamente encapsulado en `networkMonitor.ts`**: no hay objeto `CDPSession` expuesto públicamente en el proyecto

### 1.3 Uso de `executeScript` en el proyecto

El proyecto ya usa `driver.executeScript()` en múltiples puntos:
- `scrollIntoView.ts` — scroll de elementos
- `hoverOverParentContainer.ts` — dispatch de MouseEvent
- `assertValueEquals.ts` — extracción de texto de contentEditable

Todos son scripts **sincrónicos** pasados como string. El patrón es sólido y conocido por el equipo.

### 1.4 Restricción de timing en `executeScript`

`driver.executeScript()` requiere que haya **una página cargada** en el browser. En `initializeDriver()`, después de que el driver se crea, no se navega a ninguna URL — el browser está en `about:blank`. Esto significa que inyectar un `MutationObserver` vía `executeScript` **en el momento de la inicialización no es posible de forma segura**.

Esta restricción condiciona directamente la elección del enfoque técnico.

---

## 2. Tres enfoques para captura de eventos DOM

### Enfoque A — CDP `Runtime.addBinding` + `MutationObserver` (event-driven puro)

**Descripción técnica:**

Se aprovecha la conexión CDP existente (o una nueva, paralela) para habilitar el dominio `Runtime` y registrar un **binding de canal** entre el browser y Node.js. El MutationObserver inyectado en el browser llama al binding cuando detecta toasts. Node.js recibe el evento en tiempo real via WebSocket.

Secuencia detallada:

```
1. En startToastMonitoring():
   a. Abrir WebSocket CDP (mismo proceso que networkMonitor.ts)
   b. Target.getTargets → Target.attachToTarget → Runtime.enable
   c. Runtime.addBinding({ name: "bsToastEvent" })
      → Chrome registra window.bsToastEvent() como función que emite eventos CDP
   d. Runtime.evaluate: inyectar MutationObserver en el browser
      → Observer llama window.bsToastEvent(JSON.stringify({ type, title, detail, ts }))
      cuando #toast-container recibe un nodo hijo nuevo
   e. Page.enable → escuchar Page.frameNavigated para re-inyectar el Observer en cada navegación

2. Durante el test:
   → Cuando aparece un toast, el Observer invoca window.bsToastEvent(...)
   → Chrome emite evento CDP: Runtime.bindingCalled { name: "bsToastEvent", payload: "..." }
   → WebSocket listener en Node.js recibe el evento → push a toastLogs[]

3. En stop():
   → ws.removeAllListeners(); ws.close()
   → return { errorCount, warningCount, successCount, events: toastLogs }
```

**Script MutationObserver a inyectar:**

```javascript
(function() {
  if (window.__bsObserverActive__) return; // Idempotente
  window.__bsObserverActive__ = true;
  
  const container = document.querySelector('div#toast-container');
  if (!container) return;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        const type = node.classList.contains('toast-success') ? 'success'
                   : node.classList.contains('toast-error')   ? 'error'
                   : node.classList.contains('toast-warning')  ? 'warning'
                   : null;
        if (!type) return;
        const title  = node.querySelector('.toast-title')?.textContent?.trim() || '';
        const detail = node.querySelector('.toast-error-detail')?.textContent?.trim() || '';
        const route  = node.querySelector('.toast-error-route')?.textContent?.trim() || '';
        window.bsToastEvent(JSON.stringify({ type, title, detail, route, ts: Date.now() }));
      });
    });
  });
  observer.observe(container, { childList: true });
})();
```

**Compatibilidad con la arquitectura actual:** Alta. El patrón de conexión CDP es idéntico a `networkMonitor.ts`. El binding es un mecanismo nativo de CDP, sin dependencias externas.

**Ventajas:**
- Event-driven puro — cero polling, cero latencia artificial
- Funciona con páginas SPA: el binding `Runtime.addBinding` persiste por sesión CDP, no por navegación
- Re-inyección del Observer vía `Page.frameNavigated` cubre el caso de full-reload
- Independiente del ciclo de vida de las clases Banners — no conflictúa con `Banners.checkBanners()`
- Compatible con el mecanismo `waitForSuccess()` (ver sección 4)

**Desventajas:**
- El WebSocket CDP debe abrirse **dos veces** (una para network, otra para toast), o compartirse (mayor complejidad)
- `Runtime.addBinding` es una API de CDP que, aunque estable, no está en el vocabulario actual del proyecto
- Si `#toast-container` no existe cuando se inyecta el Observer (p.ej. antes del primer render), el Observer no se registra — requiere esperar el DOM ready o usar `Page.loadEventFired`

**Intrusividad:** Baja. Crea un nuevo archivo `toastMonitor.ts`. Modifica `driverManager.ts` (añade `toastMonitor`) y `testWrapper.ts` (añade `toastMonitor.stop()` en `finally`).

---

### Enfoque B — `MutationObserver` + `window.__bs_toasts__` + Selenium pull al final (híbrido)

**Descripción técnica:**

El Observer se inyecta vía `driver.executeScript()` después de que la página esté cargada (dentro de `runSession`, antes de la lógica del test, o la primera vez que sea invocado). Los eventos se acumulan en una variable global del browser `window.__bs_toasts__`. Al final del test, `stop()` llama a `executeScript("return window.__bs_toasts__")` para recuperar los datos.

```
1. En runSession() (o en el primer método de un Maestro):
   → driver.executeScript(INJECT_OBSERVER_SCRIPT)
   
2. Durante el test:
   → MutationObserver detecta toasts → push a window.__bs_toasts__[]
   
3. En stop() (o al final de runSession):
   → const events = await driver.executeScript("return window.__bs_toasts__ || []")
   → adjuntar a Allure, retornar summary
```

**Compatibilidad:** Media. No requiere CDP adicional, usa el driver existente.

**Ventajas:**
- Más simple de implementar — sin cambios al WebSocket CDP
- No requiere gestionar un segundo WebSocket
- Usa el patrón `executeScript` ya conocido en el proyecto

**Desventajas:**
- **Problema crítico con SPA navigation:** si el CMS navega a un URL diferente y el browser hace un full-reload (no SPA routing), `window.__bs_toasts__` se pierde. Si es SPA pura, persiste — **pero esto requiere verificación**
- La inyección inicial necesita una página cargada, lo que impide hacerlo en `initializeDriver()`. Necesita un hook post-navegación
- No hay manera de notificar a Node.js en tiempo real — solo pull al final. Esto impide implementar `waitForSuccess()` como mecanismo reactivo
- Si el driver está cerrado por error antes de `stop()`, los datos se pierden

**Intrusividad:** Media. Requiere modificar `testWrapper.ts` para inyectar el script después de la primera navegación (o delegarlo al primer call de página), y agregar un `stop()` en el `finally`.

---

### Enfoque C — Polling Node.js con `setInterval` + Selenium `findElements`

**Descripción técnica:**

Un `setInterval` en Node.js ejecuta `driver.findElements(By.css("div.toast-error, div.toast-warning"))` cada N milisegundos durante el test.

**Compatibilidad:** Baja — **no recomendada.**

**Desventajas críticas:**
- `setInterval` en Node.js es concurrente con el test. Selenium no es thread-safe en este contexto — dos llamadas simultáneas al driver pueden causar race conditions o errores de sesión
- El polling agresivo degrada performance: cada N ms se emite un comando WebDriver, bloqueando potencialmente la acción del test
- Los toasts tienen una vida útil corta (se cierran o desaparecen). El intervalo puede perderlos si es muy grande, o ser muy ruidoso si es pequeño
- No hay forma limpia de limpiar el `setInterval` en caso de error del test

**Veredicto:** Descartado.

---

## 3. Tabla comparativa de enfoques

| Criterio | Enfoque A (CDP Runtime.addBinding) | Enfoque B (MutationObserver + pull) | Enfoque C (Polling) |
|---|---|---|---|
| **Event-driven** | ✅ Sí | ❌ No (pull al final) | ❌ No |
| **Cero polling** | ✅ Sí | ✅ Sí (solo lectura final) | ❌ Polling intensivo |
| **Persistencia en SPA nav** | ✅ Re-inyección via Page.frameNavigated | ⚠️ Depende del tipo de routing | ❌ N/A |
| **Disponible en initializeDriver** | ✅ Sí | ❌ Requiere página cargada | ❌ Requiere driver activo |
| **Soporta waitForSuccess()** | ✅ Sí (eventos en tiempo real) | ⚠️ Solo con polling adicional | ❌ Inestable |
| **Riesgo de race condition** | 🟡 Bajo (mismo thread, eventos async) | 🟡 Bajo | 🔴 Alto |
| **Complejidad de implementación** | 🟡 Media-Alta | 🟢 Media | 🟢 Baja |
| **Alineación con networkMonitor** | ✅ Alta (misma arquitectura) | 🟡 Media | ❌ Baja |
| **Dependencias nuevas** | ❌ Ninguna | ❌ Ninguna | ❌ Ninguna |
| **Pérdida de datos en fallo** | 🟡 Solo si CDP se cierra antes | 🔴 Si driver muere antes de pull | 🔴 Alta |

---

## 4. Diseño del mecanismo de soft y hard assertion

### 4.1 Soft assertion (comportamiento por defecto)

El monitor captura todos los eventos de tipo `error` y `warning` durante el test. Al finalizar (en el bloque `finally` de `runSession`), `stop()` retorna el resumen. El `testWrapper` evalúa los conteos y adjunta el log a Allure.

**Comportamiento ante la presencia de toasts de error/warning:**
- El test **no falla durante su ejecución** por la presencia de toasts
- El test puede fallar **si el código que lo sigue falla** (causa raíz real)
- Al final, si hay toasts capturados, se adjuntan a Allure como evidencia
- La decisión de si esto falla el test o no es configurable (ver abajo)

**Contrato propuesto para `ToastSummary`:**

```typescript
export interface ToastEvent {
  type: 'success' | 'error' | 'warning';
  title: string;
  detail: string;
  route: string;
  timestamp: number;
}

export interface ToastSummary {
  errorCount: number;
  warningCount: number;
  successCount: number;
  events: ToastEvent[];
}

export interface ToastMonitorHandle {
  stop(): Promise<ToastSummary>;
  waitForSuccess(timeoutMs?: number): Promise<void>;
}
```

**Integración en testWrapper.ts (bloque finally):**

```typescript
// Análogo exacto al networkMonitor
if (session.toastMonitor) {
  const summary = await session.toastMonitor.stop();
  const toastError = summary.errorCount > 0
    ? new Error(`[Toast Warning] Test completó, pero se detectaron ${summary.errorCount} toast(s) de error y ${summary.warningCount} de advertencia.`)
    : null;
  // Adjuntar detalle a Allure ocurre dentro de stop()
  if (toastError) throw toastError; // Soft a hard: decisión del equipo (ver dudas abiertas)
}
```

### 4.2 Hard assertion — `waitForSuccess(timeoutMs)`

El método `waitForSuccess()` en el handle permite esperar activamente un toast de éxito. Es el equivalente al actual `Banners.checkBanners(true)`.

**Mecanismo con Enfoque A (event-driven):**

El handle mantiene una lista de promesas pendientes `successWaiters`. Cuando el WebSocket listener recibe un evento `type: 'success'`, resuelve todos los waiters pendientes.

```typescript
// Dentro del closure de startToastMonitoring():
let successWaiters: Array<{ resolve: () => void; reject: (e: Error) => void; timer: NodeJS.Timeout }> = [];

// En el listener de Runtime.bindingCalled:
if (event.type === 'success') {
  successWaiters.forEach(w => { clearTimeout(w.timer); w.resolve(); });
  successWaiters = [];
}

// Método waitForSuccess expuesto en el handle:
waitForSuccess: (timeoutMs = 5000) => new Promise<void>((resolve, reject) => {
  const timer = setTimeout(() => {
    reject(new Error('waitForSuccess: No se detectó toast de éxito en el tiempo esperado.'));
  }, timeoutMs);
  successWaiters.push({ resolve, reject, timer });
})
```

**Uso en Maestros:**

```typescript
// Reemplaza: await this.banner.checkBanners(true)
await opts.toastMonitor?.waitForSuccess(this.config.timeoutMs);
```

O, si el monitor está disponible como dependencia inyectada en el contexto del test:

```typescript
// Alternativa: exponer en TestContext
export interface TestContext {
  driver: WebDriver;
  session: DriverSession;
  opts: RetryOptions;
  log: typeof logger;
  toastMonitor: ToastMonitorHandle | null; // <-- nuevo
}
```

---

## 5. El riesgo principal: SPA navigation y observer lifecycle

### 5.1 Naturaleza del riesgo

El MutationObserver se inyecta en el contexto JavaScript de una página específica. Si el browser hace un **full-page reload** (navegación que destruye y recrea el contexto JavaScript), el Observer se pierde junto con `window.__bsObserverActive__`. Los toasts que aparezcan en la nueva página no serán capturados hasta que se re-inyecte el Observer.

### 5.2 Escenarios del CMS

| Escenario | Tipo de routing | Impacto |
|---|---|---|
| Angular/React SPA con client-side routing | No recarga página | Observer persiste ✅ |
| MPA (Multi-Page Application) | Recarga en cada navegación | Observer se pierde ❌ |
| SPA con deep links o autenticación | Full reload al login/logout | Observer se pierde en ese punto ❌ |

### 5.3 Mitigación con `Page.frameNavigated` (Enfoque A)

Con el Enfoque A, el listener CDP escucha `Page.frameNavigated`. Cuando se detecta una navegación del frame principal, se re-ejecuta `Runtime.evaluate` con el script de inyección. Como el script es **idempotente** (`if (window.__bsObserverActive__) return;`), en SPA pura no hace nada (el contexto persiste). En MPA, re-inyecta el Observer después de que el nuevo DOM esté disponible.

**Timing del re-inject:** Usar `Page.loadEventFired` (DOMContentLoaded equivalente) en lugar de `Page.frameNavigated` garantiza que `#toast-container` existe en el DOM antes de intentar observarlo.

### 5.4 Verificación recomendada antes de implementar

Antes de implementar, verificar con un test manual:

```javascript
// En la consola del browser, navegar entre secciones del CMS y ejecutar:
window._observer_test_ = true;
// Navegar a otra sección del CMS
// Si en la nueva sección: window._observer_test_ === true → SPA pura
// Si undefined → full reload
```

Este dato condiciona si `Page.loadEventFired` es crítico o solo un safety net.

---

## 6. Alineación con el patrón networkMonitor

El Enfoque A replica exactamente el patrón de `networkMonitor.ts` con las siguientes correspondencias:

| networkMonitor.ts | toastMonitor.ts (propuesto) |
|---|---|
| `startNetworkMonitoring(driver, label)` | `startToastMonitoring(driver, label)` |
| `NetworkMonitorHandle` | `ToastMonitorHandle` |
| `NetworkSummary { errorCount, logs }` | `ToastSummary { errorCount, warningCount, successCount, events }` |
| `Network.enable` (protocolo habilitado) | `Runtime.enable` + `Runtime.addBinding` |
| `Network.responseReceived` (evento CDP) | `Runtime.bindingCalled` (evento CDP) |
| `networkLogs: string[]` | `toastEvents: ToastEvent[]` |
| `stop()` cierra WebSocket | `stop()` cierra WebSocket |
| `DriverSession.networkMonitor` | `DriverSession.toastMonitor` |
| `session.networkMonitor.stop()` en finally | `session.toastMonitor.stop()` en finally |

**La única diferencia estructural:** el monitor de red escucha eventos que el browser emite naturalmente (tráfico HTTP). El monitor de toasts necesita **inyectar** el Observer que genera los eventos. Esta diferencia es manejada con `Runtime.addBinding` + `Runtime.evaluate`.

---

## 7. Impacto sobre la clase `Banners` existente

### Relación entre el nuevo monitor y `Banners.ts`

El `ToastMonitor` y la clase `Banners` **pueden coexistir** sin conflicto. Sin embargo, si el monitor se implementa, parte de la responsabilidad de `Banners` queda duplicada:

| Responsabilidad | `Banners.checkBanners(false)` | `ToastMonitor` (pasivo) |
|---|---|---|
| Detectar toast de error/warning | ✅ (polling explícito) | ✅ (automático) |
| Extraer título/detalle del toast | ✅ | ✅ (via binding payload) |
| Adjuntar screenshot en Allure | ✅ | ✅ (opcional, en stop()) |
| Cerrar el toast del DOM | ✅ | ❌ (monitor no interactúa) |
| Bloquear flujo del test | ✅ (explícito en el código) | ❌ (asíncrono, no bloqueante) |
| Hard assertion (esperar éxito) | ✅ (`expectSuccess: true`) | ✅ (`waitForSuccess()`) |

**Consecuencia:** Con el monitor activo, `Banners.checkBanners(false)` se vuelve redundante para captura de evidencia. Sigue siendo necesario para **cerrar el toast del DOM** cuando bloquea una interacción.

**Recomendación de coexistencia:** Mantener `Banners` para cierre de toasts que bloquean interacciones (su responsabilidad actual en `clickSafe.ts`) y para `waitForSuccess()` como alias si el equipo prefiere no cambiar los Maestros. El monitor de toasts añade la capa pasiva sin reemplazar las interacciones activas.

---

## 8. Solución recomendada — Enfoque A

**Implementar `ToastMonitor` basado en CDP `Runtime.addBinding` + `MutationObserver` inyectado.**

**Justificación:**
1. Es la única alternativa verdaderamente event-driven sin polling. La arquitectura del proyecto rechaza explícitamente `driver.sleep()` y esperas artificiales — el mismo principio aplica al monitoreo pasivo.
2. Replica el patrón de `networkMonitor.ts` con precisión estructural: mismo tipo de handle, mismo punto de integración en `finally`, misma semántica de `stop()`.
3. Soporta `waitForSuccess()` como mecanismo reactivo sin introducir polling en Node.js.
4. La re-inyección vía `Page.loadEventFired` hace el sistema robusto ante cualquier tipo de navegación (SPA o MPA).
5. Cero dependencias externas nuevas.
6. La separación en un archivo `toastMonitor.ts` propio respeta el principio de responsabilidad única del proyecto.

---

## 9. Prompt ejecutable de implementación

```
## Rol
Eres un ingeniero de automatización senior implementando un ToastMonitor no intrusivo
en el framework BlueStack Test Automation. El monitor replica el patrón de
networkMonitor.ts pero para eventos DOM de toast notifications.

---

## Contexto ya auditado (no volver a auditar)

### Arquitectura relevante
- Framework: TypeScript + Selenium WebDriver (ESM, imports .js) + Jest + Allure
- CDP: conexión via WebSocket puro (librería `ws`), NO Selenium CDPSession
- El networkMonitor.ts abre su propio WebSocket con el mismo proceso de handshake:
  Target.getTargets → Target.attachToTarget → Network.enable/Page.enable → ACK → resolve()
- El `stop()` adjunta logs a Allure, cierra WebSocket, retorna summary
- testWrapper.ts llama stop() en el bloque `finally` ANTES de cerrar el driver
- DriverSession en driverManager.ts: { driver, networkMonitor: NetworkMonitorHandle | null }
- El CMS usa toast notifications CSS: div#toast-container, div.toast-success/error/warning

### La restricción crítica
`driver.executeScript()` NO puede llamarse en initializeDriver() porque no hay página cargada.
La inyección del MutationObserver debe hacerse via CDP `Runtime.evaluate` DESPUÉS de que
la página esté lista (usar Page.loadEventFired como trigger).

### Runtime.addBinding — mecanismo clave
CDP permite registrar funciones globales en el browser que emiten eventos al listener Node.js:
- Comando: Runtime.addBinding({ name: "bsToastEvent" })
- Resultado: window.bsToastEvent(payload_string) dispara Runtime.bindingCalled en el WebSocket
- El binding persiste mientras la sesión CDP está activa
- NO necesita re-registrarse en cada navegación (persiste entre page loads)
- El MutationObserver SÍ necesita re-inyectarse en cada page load (ver Page.loadEventFired)

---

## Archivos a crear

### `src/core/config/toastMonitor.ts`

Implementar siguiendo EXACTAMENTE el mismo patrón de networkMonitor.ts:

**Interfaces a exportar:**
```typescript
export interface ToastEvent {
  type: 'success' | 'error' | 'warning';
  title: string;
  detail: string;
  route: string;
  timestamp: number;
}

export interface ToastSummary {
  errorCount: number;
  warningCount: number;
  successCount: number;
  events: ToastEvent[];
}

export interface ToastMonitorHandle {
  stop(): Promise<ToastSummary>;
  waitForSuccess(timeoutMs?: number): Promise<void>;
}
```

**Función principal:**
```typescript
export async function startToastMonitoring(
  driver: WebDriver,
  label: string = "ToastMonitor"
): Promise<ToastMonitorHandle | null>
```

**Secuencia de inicialización CDP (dentro de la Promise):**

FASE 1 (idéntica a networkMonitor): Target.getTargets → Target.attachToTarget (id: 1, 2)

FASE 2: Al recibir sessionId:
- Runtime.enable (id: 3)
- Runtime.addBinding({ name: "bsToastEvent" }) (id: 4)
- Page.enable (id: 5)

FASE 3: ACK en msg.id === 5 && msg.result → resolve() el handle

FASE 4: Listener continuo — dos tipos de mensajes:
  a) msg.method === 'Runtime.bindingCalled' && msg.params.name === 'bsToastEvent':
     → JSON.parse(msg.params.payload) → push a toastEvents[]
     → Si type === 'success': resolver successWaiters pendientes
  b) msg.method === 'Page.loadEventFired':
     → Re-inyectar el MutationObserver via Runtime.evaluate (el script de inyección)

**Script de inyección del MutationObserver (string literal dentro de toastMonitor.ts):**
```javascript
(function() {
  if (window.__bsToastObserverActive__) return;
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
        var title  = (node.querySelector('.toast-title')       || {}).textContent || '';
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
```

NOTA: En cada Page.loadEventFired, resetear `window.__bsToastObserverActive__` antes de re-inyectar:
enviar Runtime.evaluate con `window.__bsToastObserverActive__ = false;` y LUEGO el script de observer.

**Mecanismo waitForSuccess (closure interno):**
```typescript
let successWaiters: Array<{
  resolve: () => void;
  reject: (e: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}> = [];

// En Runtime.bindingCalled handler, si type === 'success':
successWaiters.forEach(w => { clearTimeout(w.timer); w.resolve(); });
successWaiters = [];

// Expuesto en el handle:
waitForSuccess: (timeoutMs = 5000) => new Promise<void>((resolve, reject) => {
  const timer = setTimeout(() => {
    reject(new Error(`[ToastMonitor] waitForSuccess: No se detectó toast de éxito en ${timeoutMs}ms.`));
  }, timeoutMs);
  successWaiters.push({ resolve, reject, timer });
})
```

**stop() implementation:**
```typescript
stop: async (): Promise<ToastSummary> => {
  // Limpiar waiters pendientes con error
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
    const text = toastEvents.map(e =>
      `[${new Date(e.timestamp).toISOString()}] ${e.type.toUpperCase()} | ${e.title} | ${e.detail} | ${e.route}`
    ).join('\n');
    await allure.attachment(`Toast_Events_${label}`, Buffer.from(text, 'utf-8'), 'text/plain');
  }
  
  ws.removeAllListeners();
  ws.close();
  return summary;
}
```

---

## Archivos a modificar

### `src/core/config/driverManager.ts`

1. Importar `startToastMonitoring, ToastMonitorHandle` de `./toastMonitor.js`
2. Actualizar `DriverSession`:
```typescript
export interface DriverSession {
  driver: WebDriver;
  networkMonitor: NetworkMonitorHandle | null;
  toastMonitor: ToastMonitorHandle | null;  // <-- nuevo campo
}
```
3. En `initializeDriver()`, después de `startNetworkMonitoring`:
```typescript
const toastMonitor = await startToastMonitoring(driver, config.label);
return { driver, networkMonitor, toastMonitor };
```

### `src/core/wrappers/testWrapper.ts`

En el bloque `finally`, después del bloque de network monitor, agregar:

```typescript
let toastWarning = null;
if (session.toastMonitor) {
  const toastSummary = await session.toastMonitor.stop();
  if (toastSummary.errorCount > 0 || toastSummary.warningCount > 0) {
    toastWarning = new Error(
      `[Toast Monitor] Test completó con ${toastSummary.errorCount} toast(s) de error y ${toastSummary.warningCount} de advertencia. Ver adjunto en Allure.`
    );
  }
}
```

Y antes de cerrar el driver, después de `networkError`:
```typescript
if (toastWarning) {
  throw toastWarning;
}
```

NOTA: El orden de los throws es intencional: primero el networkError, luego el toastWarning.
Si ambos existen, el networkError tiene precedencia (más crítico).

### `src/core/wrappers/testWrapper.ts` — TestContext (opcional)

Si el equipo quiere que los Maestros accedan a `waitForSuccess()` directamente:
```typescript
export interface TestContext {
  driver: WebDriver;
  session: DriverSession;
  opts: RetryOptions;
  log: typeof logger;
  toastMonitor: ToastMonitorHandle | null;  // <-- nuevo campo
}
```
Y en la invocación de testLogic:
```typescript
await testLogic({ driver: session.driver, session, opts, log: logger, toastMonitor: session.toastMonitor });
```

---

## Criterios de validación post-implementación

- [ ] `npx tsc --noEmit` sin errores
- [ ] `toastMonitor.ts` exporta `ToastMonitorHandle`, `ToastSummary`, `ToastEvent`, `startToastMonitoring`
- [ ] `DriverSession` en `driverManager.ts` incluye `toastMonitor: ToastMonitorHandle | null`
- [ ] `testWrapper.ts` llama `toastMonitor.stop()` en el bloque `finally` ANTES de cerrar el driver
- [ ] La clase `Banners` existente NO fue modificada
- [ ] `clickSafe.ts` NO fue modificado
- [ ] Ejecutar un test manual con un flujo que genere un toast de error → verificar que el evento aparece en el adjunto Allure `Toast_Events_*`
- [ ] Ejecutar un test con `waitForSuccess()` → verificar que resuelve cuando aparece el toast de éxito
- [ ] Verificar que `waitForSuccess()` lanza error (no silencia) cuando el toast no aparece en el timeout

---

## Puntos de decisión que requieren respuesta del equipo antes de implementar

1. ¿El test debe FALLAR si hay toasts de error/warning (como networkMonitor), o solo ADVERTIR (soft sin throw)?
2. ¿Se expone `toastMonitor` en `TestContext` para que los Maestros puedan llamar `waitForSuccess()` directamente?
3. ¿Se depreca `Banners.checkBanners(true)` a favor de `toastMonitor.waitForSuccess()`, o coexisten?
```

---

## 10. Dudas y puntos de decisión abiertos

### 1. ¿El CMS es SPA o MPA?

**Contexto:** Determina si `Page.loadEventFired` es crítico (MPA) o un safety net (SPA).  
**Impacto:** Si es SPA, el MutationObserver en `#toast-container` persiste automáticamente entre navegaciones de ruta. Si es MPA, la re-inyección via `Page.loadEventFired` es obligatoria.  
**Cómo verificar:** Abrir DevTools > Network en el CMS, navegar entre secciones y observar si hay requests de documento HTML completo o solo XHR/Fetch.

### 2. ¿El `toastWarning` debe fallar el test o solo reportar?

**Contexto:** El `networkMonitor` actual **siempre falla** el test si detecta 4xx/5xx. Para los toasts de error/warning, el comportamiento equivalente sería fallar el test al final.  
**Alternativa:** Solo adjuntar a Allure sin throw, dejando que el resultado del test sea determinado exclusivamente por el flujo funcional.  
**Recomendación tentativa:** Hacer el comportamiento configurable vía `TestMetadata`:
```typescript
interface TestMetadata {
  // ...existentes
  failOnToastError?: boolean; // default: true
}
```

### 3. ¿Coexistencia con `Banners.checkBanners()` o reemplazo progresivo?

**Contexto:** Si el `ToastMonitor` captura automáticamente todos los toasts de error/warning, las llamadas a `Banners.checkBanners(false)` en los Maestros se vuelven redundantes para propósitos de evidencia. Sin embargo, `checkBanners(false)` también **cierra el toast del DOM** cuando bloquea una interacción.  
**Opciones:**
- A) Mantener `Banners` sin cambios. `ToastMonitor` es una capa adicional de evidencia pasiva.
- B) Eliminar `Banners.checkBanners(false)` de los Maestros; mantenerlo solo en `clickSafe.ts` para cierre de toasts bloqueantes.
- C) Deprecar `Banners` completamente y mover el cierre de toasts a `clickSafe.ts` con lógica propia.

### 4. ¿Compartir la conexión WebSocket CDP con el networkMonitor?

**Contexto:** Abrir dos conexiones WebSocket al mismo endpoint CDP es válido técnicamente. Compartirlas reduciría overhead pero aumentaría el acoplamiento entre `networkMonitor.ts` y `toastMonitor.ts`.  
**Recomendación tentativa:** Conexiones separadas para mantener la independencia de módulos. Si el overhead se vuelve observable en entornos con múltiples workers, evaluar un `cdpConnection.ts` compartido.

### 5. ¿`waitForSuccess()` reemplaza `Banners.checkBanners(true)` en los Maestros?

**Contexto:** Actualmente, los Maestros llaman `await this.banner.checkBanners(true)` para validar operaciones críticas (cambio de título, publicación). Si `ToastMonitor` ofrece `waitForSuccess()`, ¿se migra o se mantiene el doble mecanismo?  
**Implicación:** Si se migra, los Maestros necesitan acceso al `toastMonitor` handle — lo que requiere exponerlo en `TestContext` o como dependencia inyectada.
