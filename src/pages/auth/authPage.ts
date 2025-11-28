import { WebDriver } from "selenium-webdriver";
import { LoginFields } from "./loginFields.js";
import { RetryOptions } from "../../core/wrappers/retry.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { TwoFAFields } from "./twoFA.js";

export class AuthPage {
    public driver: WebDriver;
    public login: LoginFields;
    public twoFA: TwoFAFields;

    constructor(driver: WebDriver) {
        this.driver = driver
        this.login = new LoginFields(driver)
        this.twoFA = new TwoFAFields(driver)
    }

    //NOTA: cambiar el tipo de credenciales armar un enum y formar una interfaz para las credenciales
    async passAuth(credentials: { username: string; password: string }, timeout: number, opts: RetryOptions) {
        const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `[passAuth]`) }

        await this.login.fillLogin(credentials.username, credentials.password, timeout, fullOpts)
        await this.twoFA.passTwoFA(timeout, fullOpts)
    }
}