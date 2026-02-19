import WebSocket from 'ws';
import logger from "./logger.js";
var NetworkErrorCategory;
(function (NetworkErrorCategory) {
    NetworkErrorCategory["SERVER_ERROR"] = "[SERVER 5xx]";
    NetworkErrorCategory["CLIENT_ERROR"] = "[CLIENT 4xx]";
    NetworkErrorCategory["CONNECTION_FAILED"] = "[CONNECTION FAILED]";
    NetworkErrorCategory["SECURITY_BLOCK"] = "[SECURITY/CORS]";
})(NetworkErrorCategory || (NetworkErrorCategory = {}));
export async function startNetworkMonitoring(driver, label = "NetworkMonitor") {
    try {
        const caps = await driver.getCapabilities();
        let cdpUrl = caps.get('se:cdp');
        // --- LÓGICA DE RESCATE (ACTUALIZADA PARA LOCAL) ---
        if (!cdpUrl) {
            logger.warn("🟡 Capability 'se:cdp' no encontrada. Intentando obtener CDP local...", { label });
            // Buscamos la dirección del debugger local en las capabilities de Chrome
            const chromeOptions = caps.get('goog:chromeOptions');
            if (chromeOptions && chromeOptions.debuggerAddress) {
                try {
                    // El debuggerAddress es algo como "localhost:63660"
                    // Hacemos una petición HTTP a esa dirección para pedirle la URL del WebSocket
                    const response = await fetch(`http://${chromeOptions.debuggerAddress}/json/version`);
                    const data = (await response.json());
                    cdpUrl = data.webSocketDebuggerUrl;
                    logger.info(`🛠️ URL CDP local obtenida con éxito: ${cdpUrl}`, { label });
                }
                catch (fetchError) {
                    logger.error(`❌ Error al consultar la URL de DevTools local: ${fetchError}`, { label });
                    return null;
                }
            }
            else {
                logger.error("❌ No se encontró 'se:cdp' ni 'goog:chromeOptions.debuggerAddress'. Imposible conectar CDP.", { label });
                return null;
            }
        }
        // ----------------------------------
        // Parche de seguridad (igual que antes)
        if (cdpUrl.includes('172.') && cdpUrl.includes(':4444')) {
            cdpUrl = cdpUrl.replace(/172\.\d+\.\d+\.\d+/, 'localhost');
        }
        logger.debug(`🔗 Conectando a WebSocket: ${cdpUrl}`, { label });
        const ws = new WebSocket(cdpUrl);
        let attachedSessionId = null;
        return new Promise((resolve) => {
            ws.on('open', () => {
                logger.debug("Socket Browser abierto. Buscando pestaña...", { label });
                // 1. Buscar Targets
                ws.send(JSON.stringify({ id: 1, method: "Target.getTargets", params: {} }));
            });
            ws.on('message', (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    // --- FASE 1: DESCUBRIMIENTO ---
                    if (msg.id === 1 && msg.result && msg.result.targetInfos) {
                        const pageTarget = msg.result.targetInfos.find((t) => t.type === 'page');
                        if (pageTarget) {
                            // 2. Adjuntar a la pestaña (Attach)
                            ws.send(JSON.stringify({
                                id: 2,
                                method: "Target.attachToTarget",
                                params: { targetId: pageTarget.targetId, flatten: true }
                            }));
                        }
                    }
                    // --- FASE 2: ACTIVACIÓN ---
                    if (msg.id === 2 && msg.result && msg.result.sessionId) {
                        attachedSessionId = msg.result.sessionId;
                        logger.info(`🟢 Monitor CDP activo. SessionID: ${attachedSessionId}`, { label });
                        // 3. Habilitar Red (Usando sessionId)
                        ws.send(JSON.stringify({
                            id: 3,
                            method: "Network.enable",
                            params: { maxTotalBufferSize: 10000000, maxResourceBufferSize: 5000000 },
                            sessionId: attachedSessionId
                        }));
                        // 4. Habilitar Página (Para asegurar ciclo de vida)
                        ws.send(JSON.stringify({
                            id: 4,
                            method: "Page.enable",
                            params: {},
                            sessionId: attachedSessionId
                        }));
                        resolve({
                            stop: async () => {
                                ws.removeAllListeners();
                                ws.close();
                                logger.info("Monitor detenido correctamente.", { label });
                            }
                        });
                    }
                    // --- FASE 3: TRÁFICO ---
                    // Filtramos por sessionId para asegurar que es tráfico de NUESTRA pestaña
                    if (msg.method && (!msg.sessionId || msg.sessionId === attachedSessionId)) {
                        if (msg.method === 'Network.responseReceived') {
                            handleResponse(msg.params, label);
                        }
                        else if (msg.method === 'Network.loadingFailed') {
                            handleFailure(msg.params, label);
                        }
                    }
                }
                catch (e) { }
            });
            ws.on('error', (err) => {
                logger.error(`❌ Error WebSocket CDP: ${err.message}`, { label });
                resolve(null);
            });
        });
    }
    catch (error) {
        logger.warn(`Excepción monitor: ${error?.message}`, { label });
        return null;
    }
}
// --- HELPERS DE NEGOCIO (Limpios) ---
function handleResponse(params, label) {
    const { response, type } = params;
    // Filtro estricto: Solo lo que importa
    if (type !== 'Document' && type !== 'XHR' && type !== 'Fetch')
        return;
    const status = response.status;
    const url = response.url ?? 'unknown';
    // LÓGICA DE VISIBILIDAD:
    // >= 400: ERROR/WARN (Se muestra siempre)
    // < 400:  DEBUG (Solo se ve si configuras logger level a debug, para no ensuciar)
    if (status >= 400) {
        const category = status >= 500 ? NetworkErrorCategory.SERVER_ERROR : NetworkErrorCategory.CLIENT_ERROR;
        logNetworkIssue(category, status, url, label);
    }
    else {
        // Cambiado a debug para producción limpia
        // logger.debug(`[OK ${status}] ${url}`, { label }); 
    }
}
function handleFailure(params, label) {
    const { errorText, canceled, type } = params;
    if (canceled)
        return;
    const category = classifyNetworkError(errorText);
    logger.error(`${category} Type: ${type} | Reason: ${errorText}`, { label });
}
function logNetworkIssue(category, status, url, label) {
    const message = `${category} Status: ${status} | URL: ${url}`;
    if (status >= 500) {
        logger.error(message, { label });
    }
    else {
        logger.warn(message, { label });
    }
}
function classifyNetworkError(errorText) {
    if (errorText.includes('ERR_SSL') || errorText.includes('CORS'))
        return NetworkErrorCategory.SECURITY_BLOCK;
    return NetworkErrorCategory.CONNECTION_FAILED;
}
//# sourceMappingURL=networkMonitor.js.map