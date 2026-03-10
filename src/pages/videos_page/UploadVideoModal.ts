import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import { VideoData } from "../../dataTest/videoData.js";
import logger from "../../core/utils/logger.js";
import { writeSafe } from "../../core/actions/writeSafe.js";
import path from "path";
import { waitFind } from "../../core/actions/waitFind.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import ENV_CONFIG from "../../core/config/envConfig.js";
import { createRequire } from 'module';
import { sleep } from "../../core/utils/backOff.js";
const require = createRequire(import.meta.url);
const remote = require('selenium-webdriver/remote');

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
    [UploadVideoModalFields.FILE_UPLOAD_INPUT]: By.css('input#video-file'),
  };
  private readonly IMAGE_PREVIEW = By.css('div#imgPreview mat-icon');
  private readonly UPLOAD_BTN = By.css('div[align="end"] app-cmsmedios-button[data-testid="btn-ok-upload"]');
  private readonly PROGRESS_BAR = By.css('mat-progress-bar[mode="determinate"]');

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
        value = value + " | Subido por BlueStack_Test_Automation_Framework";
      }

      await writeSafe(this.driver, locator, value, this.config);

      logger.debug(`Campo "${field}" completado y verificado.`, { label: this.config.label });
    } catch (error) {
      throw error;
    }
  }

  async checkProgressBar(timeoutMs = 1000 * 60 * 3) { // 3 minutos por defecto
    const startTime = Date.now();

    try {
      const progressBar = await waitFind(this.driver, this.PROGRESS_BAR, this.config);

      while (!(await this.isProgressBarFull(progressBar))) {
        if (Date.now() - startTime > timeoutMs) {
          throw new Error(`Timeout: La barra de progreso no se completó en ${timeoutMs}ms`);
        }
        await sleep(2000);
      }
    } catch (error) {
      throw error;
    }
  }

  async clickOnUploadBtn() {
    try {
      await clickSafe(this.driver, this.UPLOAD_BTN, this.config)
    } catch (error) {
      throw error;
    }
  }

  async isProgressBarFull(progressBar: WebElement): Promise<boolean> {
    try {
      const progress = await progressBar.getAttribute('aria-valuenow');
      logger.debug(`Progreso actual: ${progress}`, { label: this.config.label });
      return progress === '100';
    } catch (error) {
      throw error;
    }
  }

  async uploadFile(relativePath: string): Promise<void> {
    const cleanRelativePath = relativePath.startsWith('/')
      ? relativePath.substring(1)
      : relativePath;

    const absolutePath = path.resolve(process.cwd(), cleanRelativePath);

    logger.debug(`Ruta final calculada: ${absolutePath}`, { label: this.config.label });

    const fileInput = await waitFind(
      this.driver,
      this.LOCATORS[UploadVideoModalFields.FILE_UPLOAD_INPUT],
      this.config
    );

    // Aplicamos el LocalFileDetector (Usando el bridge require que hicimos)
    if (ENV_CONFIG.grid.useGrid) {
      logger.debug('Modo Grid: Seteando FileDetector', { label: this.config.label });
      try {
        const target = remote.default || remote;
        const DetectorClass = target.FileDetector;

        if (!DetectorClass) {
          throw new Error(`Inconsistencia interna: 'FileDetector' no encontrado en: ${Object.keys(target)}`);
        }

        // Aplicamos el detector al driver
        this.driver.setFileDetector(new DetectorClass());
        logger.debug('FileDetector activado correctamente.', { label: this.config.label });
      } catch (err: any) {
        logger.error(`Error en configuración Grid: ${err.message}`, { label: this.config.label });
        throw err;
      }
    } else {
      // En local desactivamos para que Selenium use el FS directo de WSL
      this.driver.setFileDetector(null as any);
    }

    try {
      // Este comando empaquetará el video desde WSL y lo enviará al contenedor
      await fileInput.sendKeys(absolutePath);
      logger.debug('Archivo enviado al nodo de Chrome en Docker.');
    } catch (error: any) {
      throw new Error(`Error en sendKeys: ${error.message}`);
    }
  }
}