import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";

export class CKEditorImageSelector {
  private driver: WebDriver;
  private config: RetryOptions;
  private readonly CKEDITOR_SELECTOR_IMAGE: Locator = By.css('div#ckeditor-selector')
  private readonly DONE_BTN_CKEDITOR_SELECTOR_LOCATOR: Locator = By.css('app-cmsmedios-button[data-testid="btn-ok-ckeditor"] button[data-testid="btn-calendar-confirm"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "CKEditorImageSelector") }
  }

  async selectImage(index: number): Promise<void> {
    logger.debug(`Esperando a que el selector de CKEditor esté visible`, { label: this.config.label });
    await this.waitUntilIsReady(this.CKEDITOR_SELECTOR_IMAGE)

    logger.debug(`Seleccionando la imagen ${index}`, { label: this.config.label });
    const imageLocator = this.getLocatorImage(index)
    const imageElement = await this.waitUntilIsReady(imageLocator)
    await this.driver.executeScript("arguments[0].click();", imageElement);

    await clickSafe(this.driver, this.DONE_BTN_CKEDITOR_SELECTOR_LOCATOR, this.config);
    logger.debug(`Primera imagen agregada exitosamente`, { label: this.config.label });
  }

  // =============
  //    HELPERS
  // =============

  getLocatorImage(index: number): Locator {
    return By.css(`div[id="image-selector-${index}"] img.image`);
  }

  async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)
    return element
  }
}