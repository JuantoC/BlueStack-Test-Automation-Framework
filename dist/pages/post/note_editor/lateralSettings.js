import { By } from "selenium-webdriver";
import { clickSafe } from "../../../core/actions/clickSafe.js";
export class NoteLateralSettings {
    driver;
    settingsBtn = By.css("a.btn-toggle button.btn-dropdown");
    comboSectionOptions = By.css('mat-select[data-testid="section-options"]');
    firstSectionOption = By.css("div[role='listbox'] mat-option:first-of-type");
    constructor(driver) {
        this.driver = driver;
    }
    async handleSettings(timeout, opts) {
        await clickSafe(this.driver, this.settingsBtn, timeout, opts);
    }
    async selectFirstSectionOption(timeout, opts) {
        await clickSafe(this.driver, this.comboSectionOptions, timeout, opts);
        await clickSafe(this.driver, this.firstSectionOption, timeout, opts);
    }
}
//# sourceMappingURL=lateralSettings.js.map