import { calcBackoff, sleep } from "../utils/backOff.js";
import { DefaultConfig } from "../config/default.js";
export async function retry(action, options = {}) {
    // Mezclamos los valores default con los recibidos
    const { retries, initialDelayMs, maxDelayMs, backoffFactor, label } = { ...DefaultConfig, ...options };
    let attempt = 1;
    while (true) {
        try {
            return await action();
        }
        catch (err) {
            console.warn(`${label}: Intento ${attempt} falló: ${err.message}`);
            if (attempt >= retries) {
                console.error(`${label}: Se agotaron los ${retries} reintentos.`);
                throw err; // Lanza el error al llamador
            }
            const delay = calcBackoff(attempt, initialDelayMs, backoffFactor, maxDelayMs);
            console.log(`${label} Esperando ${delay / 1000}s antes del intento ${attempt + 1}...`);
            await sleep(delay);
            attempt++;
        }
    }
}
//# sourceMappingURL=retry.js.map