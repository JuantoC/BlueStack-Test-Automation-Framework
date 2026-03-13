import { By, Key, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";

export class MainImagePage {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "VideoTable") }
  }
}