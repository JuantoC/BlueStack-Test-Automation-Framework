import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { waitFind } from "../../../core/utils/waitFind.js";

export class EditorImageSection {
  // ========== LOCATORS (Private & Readonly) ==========
  private readonly MAIN_IMAGE_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] div[data-testid="img-prev-add"]');
  private readonly MAIN_IMAGE_DESCRIPTION_LOCATOR: Locator = By.css('div[id="imagenPrevisualizacion-content"] textarea.input_description');
  private readonly FIRST_IMAGE_CKEDITOR_SELECTOR_LOCATOR: Locator = By.css('div[id="image-selector-0"] img.image');
  private readonly DONE_BTN_CKEDITOR_SELECTOR_LOCATOR: Locator = By.css('app-cmsmedios-button[data-testid="btn-ok-ckeditor"] button[data-testid="btn-calendar-confirm"]');

  constructor(private driver: WebDriver) { }

  async addFirstImage(opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "NoteImageSection.addFirstImage")
    };

    try {
      logger.debug(`Agregando primera imagen como Imagen Principal`, { label: config.label });
      await clickSafe(this.driver, this.MAIN_IMAGE_LOCATOR, config);
      logger.debug(`Esperando a que el selector de CKEditor esté visible`, { label: config.label });
      const imageElement = await waitFind(this.driver, this.FIRST_IMAGE_CKEDITOR_SELECTOR_LOCATOR, config);
      await this.driver.executeScript("arguments[0].click();", imageElement);
      await clickSafe(this.driver, this.DONE_BTN_CKEDITOR_SELECTOR_LOCATOR, config);
      logger.debug(`Primera imagen agregada exitosamente`, { label: config.label });
      await writeSafe(this.driver, this.MAIN_IMAGE_DESCRIPTION_LOCATOR, "Auto Generated Description by BlueStack_Test_Automation Framework", config);
      logger.debug(`Descripción de la imagen agregada exitosamente`, { label: config.label });
    } catch (error) {
      // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
      throw error;
    }
  }
}
