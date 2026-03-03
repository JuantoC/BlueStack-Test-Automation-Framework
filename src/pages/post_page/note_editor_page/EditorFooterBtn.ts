import { Locator, By, WebDriver } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";

export class NoteFooterBtn {
  private driver: WebDriver
  private config: RetryOptions;

  private readonly addContentContainer: Locator = By.css("div[id='add-content-id']")
  private readonly addContentBtn: Locator = By.css('div[id="add-content-id"] div[data-testid="add-post-circle-container"]')
  private readonly addListicleItemBtn: Locator = By.css('button[data-testid="add-listicle-item"]');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorFooterBtn") }
  }


}