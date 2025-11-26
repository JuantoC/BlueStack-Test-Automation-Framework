import { LoginFields } from "./loginFields";
import { stackLabel } from '../../core/utils/stackLabel';
import { TwoFAFields } from "./twoFA";
export class AuthPage {
    driver;
    login;
    twoFA;
    constructor(driver) {
        this.driver = driver;
        this.login = new LoginFields(driver);
        this.twoFA = new TwoFAFields(driver);
    }
    //NOTA: cambiar el tipo de credenciales armar un enum y formar una interfaz para las credenciales
    async passAuth(credentials, timeout, opts) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `passAuth`) };
        this.login.fillLogin(credentials.username, credentials.password, timeout, fullOpts);
        this.twoFA.passTwoFA(timeout, fullOpts);
    }
}
//# sourceMappingURL=authPage.js.map