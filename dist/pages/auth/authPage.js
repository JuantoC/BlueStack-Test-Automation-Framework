import { LoginFields } from "./loginFields.js";
import { TwoFAFields } from "./twoFA.js";
import { DefaultConfig } from "../../core/config/default.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
export class AuthPage {
    driver;
    login;
    twoFA;
    constructor(driver) {
        this.driver = driver;
        this.login = new LoginFields(driver);
        this.twoFA = new TwoFAFields(driver);
    }
    /**
     * Coordina el flujo completo de autenticación: Login + 2FA.
     * @param credentials - Objeto con usuario y contraseña (Interfaz AuthCredentials).
     * @param opts - Opciones que incluyen timeoutMs, retries y label.
     */
    async passAuth(credentials, opts = {}) {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, "passAuth")
        };
        try {
            logger.debug("Iniciando componentes de autenticación...", { label: config.label });
            // 1. Fase de Login
            await this.login.fillLogin(credentials.username, credentials.password, config);
            // 2. Fase de Segundo Factor
            await this.twoFA.passTwoFA(config);
            logger.info("Flujo AuthPage completado correctamente", { label: config.label });
        }
        catch (error) {
            // No re-logueamos el error aquí para evitar redundancia, 
            // ya que fillLogin o passTwoFA ya habrán emitido sus propios errores/warns.
            throw error;
        }
    }
}
//# sourceMappingURL=authPage.js.map