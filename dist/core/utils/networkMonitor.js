import logger from "./logger.js";
/**
 * Clasificación de severidad y tipo de error de red
 */
var NetworkErrorCategory;
(function (NetworkErrorCategory) {
    NetworkErrorCategory["SERVER_ERROR"] = "[SERVER 5xx]";
    NetworkErrorCategory["CLIENT_ERROR"] = "[CLIENT 4xx]";
    NetworkErrorCategory["CONNECTION_FAILED"] = "[CONNECTION FAILED]";
    NetworkErrorCategory["SECURITY_BLOCK"] = "[SECURITY/CORS]";
})(NetworkErrorCategory || (NetworkErrorCategory = {}));
function findCdpEventEmitter(connection) {
    const candidates = ['_client', '_ws', '_connection', 'socket', 'client'];
    for (const key of candidates) {
        if (connection[key] && typeof connection[key].on === 'function')
            return connection[key];
    }
    const keys = Object.getOwnPropertyNames(connection);
    for (const key of keys) {
        const val = connection[key];
        if (val && typeof val.on === 'function' && key !== 'on')
            return val;
    }
    return null;
}
export async function startNetworkMonitoring(driver, label = "NetworkMonitor") {
    try {
        const cdpConnection = await driver.createCDPConnection('page');
        await cdpConnection.execute('Network.enable', {});
        const cdpEmitter = findCdpEventEmitter(cdpConnection);
        if (!cdpEmitter) {
            logger.warn("⚠️ No se pudo localizar el EventEmitter del CDP. Monitoreo desactivado.", { label });
            return null;
        }
        const responseListener = (params) => {
            try {
                const { response, type } = params;
                // 🔹 FILTRO IMPORTANTE
                if (type !== 'Document' && type !== 'XHR' && type !== 'Fetch') {
                    return;
                }
                const status = response.status;
                const rawUrl = response?.url ?? 'unknown';
                const url = rawUrl.length > 100 ? rawUrl.substring(0, 97) + '...' : rawUrl;
                if (status >= 500) {
                    logNetworkIssue(NetworkErrorCategory.SERVER_ERROR, status, url, label);
                }
                else if (status >= 400) {
                    logNetworkIssue(NetworkErrorCategory.CLIENT_ERROR, status, url, label);
                }
            }
            catch (err) { /* Silent fail to not interrupt driver */ }
        };
        const failedListener = (params) => {
            try {
                const { errorText, canceled, type, requestId } = params;
                // Ignoramos peticiones canceladas (común en navegaciones rápidas)
                if (canceled)
                    return null;
                const category = classifyNetworkError(errorText);
                logger.error(`${category} Type: ${type} | Reason: ${errorText}`, { label });
            }
            catch (err) { /* Silent fail */ }
        };
        // --- 1. Captura de Errores HTTP (4xx, 5xx) ---
        cdpEmitter.on('Network.responseReceived', responseListener);
        // --- 2. Captura de Errores de Nivel de Red (DNS, Timeout, Refused) ---
        cdpEmitter.on('Network.loadingFailed', failedListener);
        logger.info("Monitor de red avanzado (CDP) activado.", { label });
        return {
            stop: async () => {
                try {
                    cdpEmitter.off('Network.responseReceived', responseListener);
                    cdpEmitter.off('Network.loadingFailed', failedListener);
                    if (typeof cdpConnection.close === 'function') {
                        await cdpConnection.close();
                    }
                    logger.info("Monitor de red detenido correctamente.", { label });
                }
                catch (err) {
                    logger.warn("Error cerrando monitor de red.", { label });
                }
            }
        };
    }
    catch (error) {
        if (error instanceof Error) {
            logger.warn(`Error iniciando monitor CDP: ${error.message}`, { label });
        }
        else {
            logger.warn(`Error iniciando monitor CDP desconocido`, { label });
        }
        return null;
    }
}
/**
 * Helper para estandarizar el log de red
 */
function logNetworkIssue(category, status, url, label) {
    const message = `${category} Status: ${status} | URL: ${url}`;
    // Si es 5xx lo marcamos como error, si es 4xx como warn (dependiendo de tu política de negocio)
    if (status >= 500) {
        logger.error(message, { label });
    }
    else {
        logger.warn(message, { label });
    }
}
function classifyNetworkError(errorText) {
    if (errorText.startsWith('net::ERR_SSL')) {
        return NetworkErrorCategory.SECURITY_BLOCK;
    }
    if (errorText.includes('CORS')) {
        return NetworkErrorCategory.SECURITY_BLOCK;
    }
    if (errorText.includes('NAME_NOT_RESOLVED') ||
        errorText.includes('CONNECTION_REFUSED') ||
        errorText.includes('TIMED_OUT')) {
        return NetworkErrorCategory.CONNECTION_FAILED;
    }
    return NetworkErrorCategory.CONNECTION_FAILED;
}
//# sourceMappingURL=networkMonitor.js.map