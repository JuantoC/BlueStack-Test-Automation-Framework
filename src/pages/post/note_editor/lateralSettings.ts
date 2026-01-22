import { Locator, By, WebDriver } from "selenium-webdriver";
import { RetryOptions } from "../../../core/config/default.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";

export class NoteLateralSettings {
  private driver: WebDriver
  public settingsBtn: Locator = By.css("a.btn-toggle button.btn-dropdown");
  public comboSectionOptions: Locator = By.css('mat-select[data-testid="section-options"]');
  public firstSectionOption: Locator = By.css("div[role='listbox'] mat-option:first-of-type");

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async handleSettings(timeout: number, opts: RetryOptions) {
   await clickSafe(this.driver, this.settingsBtn, timeout, opts)
  }    

  async selectFirstSectionOption(timeout: number, opts: RetryOptions) {
    await clickSafe(this.driver, this.comboSectionOptions, timeout, opts)
    await clickSafe(this.driver, this.firstSectionOption, timeout, opts)
  }
}
