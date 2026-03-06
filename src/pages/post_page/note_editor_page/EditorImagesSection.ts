import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { step } from "allure-js-commons";
import { waitVisible } from "../../../core/actions/waitVisible.js";

export class EditorImageSection {
  private driver: WebDriver
  private config: RetryOptions;

  // ========== LOCATORS (Private & Readonly) ==========
  private readonly MAIN_IMAGE_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] div[data-testid="img-prev-add"]');
  private readonly CKEDITOR_SELECTOR_IMAGE: Locator = By.css('div#ckeditor-selector')
  private readonly MAIN_IMAGE_DESCRIPTION_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] textarea.input_description');
  private readonly FIRST_IMAGE_CKEDITOR_SELECTOR_LOCATOR: Locator = By.css('div[id="image-selector-0"] img.image');
  private readonly DONE_BTN_CKEDITOR_SELECTOR_LOCATOR: Locator = By.css('app-cmsmedios-button[data-testid="btn-ok-ckeditor"] button[data-testid="btn-calendar-confirm"]');

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorImageSection") }
  }

  async addFirstImage(): Promise<void> {
    await step("Adjuntar imagen principal", async () => {

      try {
        logger.debug(`Agregando primera imagen como Principal`, { label: this.config.label });
        await clickSafe(this.driver, this.MAIN_IMAGE_LOCATOR, this.config);

        // Espera explicita para revisar que el modal ckeditor esta visible
        const selector = await waitFind(this.driver, this.CKEDITOR_SELECTOR_IMAGE, this.config)
        await waitVisible(this.driver, selector, this.config)

        logger.debug(`Esperando a que el selector de CKEditor esté visible`, { label: this.config.label });
        const imageElement = await waitFind(this.driver, this.FIRST_IMAGE_CKEDITOR_SELECTOR_LOCATOR, { ...this.config, initialDelayMs: 3000 });
        await this.driver.executeScript("arguments[0].click();", imageElement);

        await clickSafe(this.driver, this.DONE_BTN_CKEDITOR_SELECTOR_LOCATOR, this.config);
        logger.debug(`Primera imagen agregada exitosamente`, { label: this.config.label });

        await writeSafe(this.driver, this.MAIN_IMAGE_DESCRIPTION_LOCATOR, "Auto Generated Description by BlueStack_Test_Automation Framework", this.config);
        logger.debug(`Descripción de la imagen agregada exitosamente`, { label: this.config.label });
      } catch (error) {
        // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
        throw error;
      }
    });
  }
}
