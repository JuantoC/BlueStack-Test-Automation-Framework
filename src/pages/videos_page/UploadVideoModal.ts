import { By, Locator, WebDriver } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import { VideoData } from "../../dataTest/videoData.js";
import logger from "../../core/utils/logger.js";
import { writeSafe } from "../../core/actions/writeSafe.js";
import path from "path";
import { waitFind } from "../../core/actions/waitFind.js";
import { VideoType } from "./UploadVideoBtn.js";
import { clickSafe } from "../../core/actions/clickSafe.js";

export enum UploadVideoModalFields {
  URL_INPUT = 'url-input',
  TITLE_INPUT = 'title-input',
  DESCRIPTION_INPUT = 'description-input',
  FILE_UPLOAD_INPUT = 'file-upload-input',
}

export class UploadVideoModal {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly LOCATORS: Record<UploadVideoModalFields, Locator> = {
    [UploadVideoModalFields.URL_INPUT]: By.css('div#url-details input[data-testid="url-youtube"]'),
    [UploadVideoModalFields.TITLE_INPUT]: By.css('div#title-details textarea[data-testid="title-uploadVideo"]'),
    [UploadVideoModalFields.DESCRIPTION_INPUT]: By.css('div#title-details textarea.desc-textarea'),
    [UploadVideoModalFields.FILE_UPLOAD_INPUT]: By.css('div#video-file'),
  };
  private readonly IMAGE_PREVIEW = By.css('div#imgPreview mat-icon');
  private readonly UPLOAD_BTN = By.css('div[align="end"] app-cmsmedios-button[data-testid="btn-ok-upload"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "UploadVideoModal") }
  }

  async fillAll(data: Partial<VideoData>): Promise<void> {
    await step("Rellenar campos del modal de subida de video", async () => {
      const textMapping: Array<{ key: keyof VideoData; type: UploadVideoModalFields }> = [
        { key: 'title', type: UploadVideoModalFields.TITLE_INPUT },
        { key: 'description', type: UploadVideoModalFields.DESCRIPTION_INPUT },
        { key: 'url', type: UploadVideoModalFields.URL_INPUT },
        { key: 'path', type: UploadVideoModalFields.FILE_UPLOAD_INPUT },
      ];

      for (const { key, type } of textMapping) {
        const value = data[key];
        if (typeof value === 'string' && value.trim()) {
          await this.fillField(type, value as string);
        }
      }
    });
  }

  /**
   * Rellena un campo de texto específico y verifica que el contenido sea correcto.
   * Maneja automáticamente la diferencia entre inputs estándar y editores enriquecidos.
   */
  async fillField(field: UploadVideoModalFields, value: string): Promise<void> {
    if (!value) return;

    const locator = this.LOCATORS[field];

    try {
      logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: this.config.label });

      if (field === UploadVideoModalFields.FILE_UPLOAD_INPUT) {
        await this.uploadFile(value);
        return;
      }

      if (field === UploadVideoModalFields.TITLE_INPUT) {
        value = value + " | Video subido por BlueStack_Test_Automation Framework";
      }

      await writeSafe(this.driver, locator, value, this.config);

      logger.debug(`Campo "${field}" completado y verificado.`, { label: this.config.label });
    } catch (error) {
      // Propagamos el error sin loguear de nuevo (Regla de No Redundancia).
      throw error;
    }
  }

  async uploadFile(pathValue: string) {
    const video = path.resolve(pathValue)
    await (await waitFind(this.driver, this.LOCATORS["file-upload-input"])).sendKeys(video);
  }

  async clickOnUploadBtn() {
    try {
      await clickSafe(this.driver, this.UPLOAD_BTN, this.config)
    } catch (error) {
      throw error;
    }
  }

}