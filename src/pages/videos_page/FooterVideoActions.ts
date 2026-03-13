import { By, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { clickSafe } from "../../core/actions/clickSafe.js";

export class FooterVideoActions {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private readonly FOOTER_PUBLISH_BTN = By.css('div.cmsmedios-table-content button[data-testid="dropdown-action"]');
  private readonly FOOTER_DROPDOWN_BTN = By.css('div.cmsmedios-table-content button[data-testid="dropdown-actions"]');
  private readonly FOOTER_DROPDOWN_MENU = By.css('div.cmsmedios-table-content div[data-testid="dropdown-menu"]')
  private readonly FOOTER_DROPDOWN_OPTIONS = By.css('div[data-testid="dropdown-item"] mat-icon[role="img"] span')

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "FooterVideoActions") }
  }

  async clickOnPublishBtn(): Promise<void> {
    try {
      logger.debug('Intentando clickar en el boton de publicar del footer...', { label: this.config.label });
      const publishBtn = await waitFind(this.driver, this.FOOTER_PUBLISH_BTN, this.config);
      await this.isPublishBtnEnabled(publishBtn)

      await clickSafe(this.driver, publishBtn, this.config);
      logger.debug('Boton clickado correctamente.', { label: this.config.label })
    } catch (error: any) {
      logger.error(`Error clickeando el boton de publicar: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }

  async isPublishBtnEnabled(publishBtn: WebElement): Promise<boolean> {
    try {
      logger.debug('Revisisando que el boton de publicar en el footer se encuentre habilitado...', { label: this.config.label })
      const isEnabled = await publishBtn.getAttribute('disabled');
      return isEnabled === null;
    } catch (error: any) {
      logger.error(`Error revisando el btn de publicar: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }
}