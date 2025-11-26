import { WebDriver } from "selenium-webdriver";
import { LoginFields } from "./loginFields";
import { RetryOptions } from '../../core/wrappers/retry';
import { NoteData } from '../../dataTest/noteDataInterface';
import { stackLabel } from '../../core/utils/stackLabel';
import { TwoFAFields } from "./twoFA";

export class AuthPage {
    public driver: WebDriver;
    public login: LoginFields;
    public twoFA: TwoFAFields;

    constructor(driver: WebDriver) {
        this.driver = driver
        this.login = new LoginFields(driver)
        this.twoFA = new TwoFAFields()
    }

    
}