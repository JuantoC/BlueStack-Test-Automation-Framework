import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { step } from "allure-js-commons";
import { CKEditorImageSelector } from "../../modals/CKEditorImageSelector.js";

export class EditorImageSection {
  private driver: WebDriver
  private config: RetryOptions;

  private readonly CKEditorSelector: CKEditorImageSelector;

  // ========== LOCATORS (Private & Readonly) ==========
  private static readonly MAIN_IMAGE_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] div[data-testid="img-prev-add"]');
  private static readonly MAIN_IMAGE_DESCRIPTION_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] textarea.input_description');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorImageSection") }

    this.CKEditorSelector = new CKEditorImageSelector(driver, opts);
  }

  async selectAndWriteMainImage(index: number = 0): Promise<void> {
    await step(`Adjuntar imagen principal en index ${index}`, async () => {
      try {
        logger.debug(`Agregando imagen ${index} como principal`, { label: this.config.label });
        await this.clickOnImageInput();

        await this.CKEditorSelector.selectImage(index);

        await this.writeOnMainImageDescription();
      } catch (error: any) {
        logger.error(`Error en selectAndWriteMainImage: ${error.message}`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  async writeOnMainImageDescription(): Promise<void> {
    await writeSafe(this.driver, EditorImageSection.MAIN_IMAGE_DESCRIPTION_LOCATOR, "Auto Generated Description by BlueStack_Test_Automation_Framework", this.config);
    logger.debug(`Descripción de la imagen agregada exitosamente`, { label: this.config.label });
  }

  // ==============
  //    HELPERS
  // ==============

  async clickOnImageInput(): Promise<void> {
    await clickSafe(this.driver, EditorImageSection.MAIN_IMAGE_LOCATOR, this.config);
  }
}
