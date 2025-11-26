import { calcBackoff, sleep } from '../utils/backOff.js';
import { DefaultConfig } from '../config/default.js';
export async function retry(action, { retries = DefaultConfig.retry.retries, initialDelayMs = DefaultConfig.retry.retryDelayMs, maxDelayMs = DefaultConfig.retry.maxRetryDelayMs, backoffFactor = DefaultConfig.retry.backoffFactor, label = "retry" } = {}) {
    let attempt = 1;
    while (attempt <= retries) {
        try {
            return await action();
        }
        catch (err) {
            const canRetry = attempt < retries;
            console.warn(`[${label}] intento ${attempt} falló: ${err.message}`);
            if (!canRetry) {
                console.error(`[${label}] agotó reintentos (${retries}).`);
                throw err;
            }
            const delay = calcBackoff(attempt, initialDelayMs, backoffFactor, maxDelayMs);
            console.log(`[${label}] Esperando ${delay / 1000}s antes del intento ${attempt + 1}...`);
            await sleep(delay);
            attempt++;
        }
    }
    throw new Error("retry agotado");
}
//# sourceMappingURL=retry.js.map