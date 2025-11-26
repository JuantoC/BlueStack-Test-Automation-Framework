import { WebDriver } from "selenium-webdriver";
import { LoginFields } from "./loginFields";
import { RetryOptions } from '../../core/wrappers/retry';
import { NoteData } from '../../dataTest/noteDataInterface';
import { stackLabel } from '../../core/utils/stackLabel';
import { TwoFAFields } from "./twoFA";
import { adminCredentials } from "../../environments/Dev_SAAS/credentials";

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
        const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `passAuth`) }

        this.login.fillLogin(credentials.username, credentials.password, timeout, fullOpts)
        this.twoFA.passTwoFA(timeout, fullOpts)
    }
}