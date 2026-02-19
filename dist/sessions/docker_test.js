async function runNoteCreationSession() {
    const sessionLabel = "Docker_Test";
    const opts = {
        ...DefaultConfig,
        label: sessionLabel
    };
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password);
    let session = null;
    try {
        logger.info(`>>> Iniciando Sesión de Prueba: ${sessionLabel} <<<`, { label: sessionLabel });
        // 1. Setup del Entorno
        session = await initializeDriver({ isHeadless: true, useGrid: true }, opts);
        const driver = session.driver;
        // 2. Acceso y Autenticación
        await driver.get(authUrl);
        ;
        await sleep(1000 * 10);
        logger.info(`✅ Prueba ${sessionLabel} finalizada exitosamente.`, { label: sessionLabel });
    }
    catch (error) {
        if (error instanceof Error) {
            let errorMessage = error.message;
            const diff = error?.diff;
            if (diff) {
                errorMessage += `\n>>> DETALLE DEL FALLO DE TEXTO <<<${diff}`;
            }
            logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}`, {
                label: sessionLabel,
                stack: error.stack,
                details: errorMessage
            });
            throw error;
        }
    }
    finally {
        if (session) {
            await checkConsoleErrors(session.driver, sessionLabel);
            logger.info("Limpiando entorno y cerrando sesión...", { label: sessionLabel });
            await quitDriver(session, opts);
        }
    }
}
// Ejecución controlada
runNoteCreationSession().catch(() => {
    process.exit(1);
});
import { DefaultConfig } from "../core/config/default.js";
import { initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import logger from "../core/utils/logger.js";
import { checkConsoleErrors } from "../core/utils/browserLogs.js";
import { sleep } from "../core/utils/backOff.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
//# sourceMappingURL=Docker_Test.js.map