import { AuthPage } from "../pages/auth/authPage.js";
import { DefaultConfig } from "../core/config/default.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import logger from "../core/utils/logger.js";
/**
 * Orquestador de negocio para realizar el flujo completo de autenticación.
 * * @param driver - Instancia de WebDriver.
 * @param credentials - Credenciales de acceso (Username/Password).
 * @param opts - Opciones extendidas (timeoutMs, retries, label).
 */
export async function passLogin(driver, credentials, opts = {}) {
    // 1. Unificamos configuración y refinamos el label.
    // Evitamos incluir el username en el label de stack si esto puede generar logs muy pesados,
    // pero lo mantenemos en la metadata del log para trazabilidad.
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "passLogin")
    };
    const page = new AuthPage(driver);
    try {
        // 2. Log de hito de negocio (INFO).
        logger.info(`Iniciando proceso de autenticación para el usuario: ${credentials.username}`, {
            label: config.label
        });
        // 3. Delegación al Page Object.
        await page.passAuth(credentials, config);
        logger.debug(`Autenticación completada exitosamente para ${credentials.username}`, {
            label: config.label
        });
    }
    catch (error) {
        // 4. Log de error con contexto forense.
        logger.error(`Fallo en el proceso de Login: ${error.message}`, {
            label: config.label,
            user: credentials.username,
            timeoutMs: config.timeoutMs
        });
        throw error;
    }
}
//# sourceMappingURL=manageAuth.js.map