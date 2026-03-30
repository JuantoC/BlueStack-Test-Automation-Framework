import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import { VideoData } from "../../interfaces/data.js";
import logger from "../../core/utils/logger.js";
import { writeSafe } from "../../core/actions/writeSafe.js";
import path from "path";
import { waitFind } from "../../core/actions/waitFind.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import ENV_CONFIG from "../../core/config/envConfig.js";
import { createRequire } from 'module';
import { sleep } from "../../core/utils/backOff.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { CKEditorImageModal } from "../modals/CKEditorImageModal.js";
import { Banners } from "../modals/Banners.js";

const require = createRequire(import.meta.url);
const remote = require('selenium-webdriver/remote');

export type UploadVideoModalFields = keyof typeof UploadVideoModal.LOCATORS;

/**
 * Page Object que representa el modal de subida de videos del CMS.
 * Gestiona el relleno dinámico de campos (URL, título, descripción, archivo),
 * la subida de archivos nativos con soporte para entornos Grid (Selenium Grid) y locales,
 * y la verificación de la barra de progreso hasta el cierre del modal.
 * Consumido por `MainVideoPage.uploadNewVideo` como sesión de formulario del modal.
 *
 * @example
 * const modal = new UploadVideoModal(driver, opts);
 * await modal.fillAll(videoData);
 * await modal.clickOnUploadBtn();
 */
export class UploadVideoModal {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;
  private readonly image: CKEditorImageModal
  private readonly banner: Banners;


  public static readonly LOCATORS = {
    URL_YOUTUBE: By.css('div#url-details input[data-testid="url-youtube"]'),
    TITLE_INPUT: By.css('div#title-details textarea[data-testid="title-uploadVideo"]'),
    DESCRIPTION_INPUT: By.css('div#title-details textarea.desc-textarea'),
    FILE_UPLOAD_INPUT: By.css('input#video-file'),
    IFRAME_URL: By.css('div#code textarea'),
  } as const;
  private static readonly IMAGE_PREVIEW = By.css('div#imgPreview mat-icon');
  private static readonly UPLOAD_BTN = By.css('div[align="end"] app-cmsmedios-button[data-testid="btn-ok-upload"]');
  private static readonly PROGRESS_BAR = By.css('mat-progress-bar[mode="determinate"]');
  private static readonly BACKGROUND_PROGRESS_BAR = By.css('div.progress--bar');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "UploadVideoModal") }
    this.image = new CKEditorImageModal(this.driver, this.config)
    this.banner = new Banners(this.driver, this.config);

  }

  /**
   * Rellena automáticamente todos los campos del modal que tengan un valor presente en `data`.
   * Itera sobre un mapa de campos predefinido (título, descripción, URL, ruta de archivo)
   * y delega en `fillField` para cada campo que contenga un valor válido.
   *
   * @param data - Objeto parcial de `VideoData` con los valores a escribir en el formulario.
   */
  async fillAll(data: Partial<VideoData>): Promise<void> {
    await step("Rellenar campos del modal de subida de video", async () => {
      const textMapping: Array<{ key: keyof VideoData; type: UploadVideoModalFields }> = [
        { key: 'url', type: 'URL_YOUTUBE' },
        { key: 'title', type: 'TITLE_INPUT' },
        { key: 'description', type: 'DESCRIPTION_INPUT' },
        { key: 'path', type: 'FILE_UPLOAD_INPUT' },
        { key: 'iframe', type: 'IFRAME_URL' },
      ];

      for (const { key, type } of textMapping) {
        const value = data[key];
        if (typeof value === 'string' && value.trim()) {
          await this.fillField(type, value as string);
        }
      }

      if (data.video_type === 'EMBEDDED') {
        await clickSafe(this.driver, UploadVideoModal.IMAGE_PREVIEW, this.config)
        await this.image.selectImage(0)
      }

    });
  }

  /**
   * Rellena un campo de texto específico y verifica que el contenido sea correcto.
   * Maneja automáticamente la diferencia entre inputs estándar y editores enriquecidos.
   */
  async fillField(field: UploadVideoModalFields, value: string): Promise<void> {
    await step(`Llenar campo ${field}`, async () => {
      if (!value) return;

      const locator = UploadVideoModal.LOCATORS[field];

      try {
        logger.debug(`Escribiendo contenido en el campo: ${field}`, { label: this.config.label });

        if (field === 'FILE_UPLOAD_INPUT') {
          await this.uploadFile(value);
          return;
        }

        if (field === 'TITLE_INPUT') {
          value = value + " | Subido por BlueStack_Test_Automation_Framework";
        }

        await writeSafe(this.driver, locator, value, this.config);

        logger.debug(`Campo "${field}" completado y verificado.`, { label: this.config.label });
      } catch (error: any) {
        logger.error(`Error en fillField: ${error.message}`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  /**
   * Supervisa la barra de progreso de la subida de un video nativo hasta confirmar su completitud.
   * Espera a que el valor de `aria-valuenow` llegue a 100 y luego
   * aguarda el cierre completo del modal de progreso antes de retornar.
   * Lanza un error si cualquiera de las dos condiciones supera el timeout configurado.
   *
   * @param timeoutMs - Tiempo máximo de espera en milisegundos. Por defecto 3 minutos.
   */
  async checkProgressBar(timeoutMs = 1000 * 60 * 3) { // 3 minutos por defecto
    await step("Verificar barra de progreso de subida", async () => {
      const startTime = Date.now();
      const progressBar = await waitFind(this.driver, UploadVideoModal.PROGRESS_BAR, this.config);
      try {
        logger.debug('Esperando a que la barra de progreso aparezca...', { label: this.config.label })
        while (!(await this.isProgressBarFull(progressBar))) {
          if (Date.now() - startTime > timeoutMs) {
            throw new Error(`Timeout: La barra de progreso no se completó en ${timeoutMs}ms`);
          }
          await sleep(200);
        }
      } catch (error: any) {
        logger.error(`Error verificando barra de progreso: ${error.message}`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  /**
   * Localiza y hace click en el botón de confirmación de subida del modal.
   * Punto de invocación final del formulario; desencadena el proceso de subida en el backend.
   */
  async clickOnUploadBtn() {
    await step("Click en botón de subida", async () => {
      try {
        await clickSafe(this.driver, UploadVideoModal.UPLOAD_BTN, this.config)
      } catch (error: any) {
        logger.error(`Error al clickear subir: ${error.message}`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  private async isProgressBarFull(progressBar: WebElement): Promise<boolean> {
    try {
      const progress = await progressBar.getAttribute('aria-valuenow');
      logger.debug(`Progreso actual: ${progress}`, { label: this.config.label });
      if (progress === '100') {
        await this.banner.checkBanners(true);
        return true;
      }
      return false;
    } catch (error: any) {
      logger.error(`Error verificando barra de progreso completa: ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }

  private async uploadFile(relativePath: string): Promise<void> {
    const cleanRelativePath = relativePath.startsWith('/')
      ? relativePath.substring(1)
      : relativePath;

    const absolutePath = path.resolve(process.cwd(), cleanRelativePath);

    logger.debug(`Ruta final calculada: ${absolutePath}`, { label: this.config.label });

    const fileInput = await waitFind(
      this.driver,
      UploadVideoModal.LOCATORS['FILE_UPLOAD_INPUT'],
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
      logger.debug('Archivo enviado al nodo de Chrome en Docker.', { label: this.config.label });
    } catch (error: any) {
      throw new Error(`Error en sendKeys: ${error.message}`);
    }
  }

  private async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)
    return element
  }
}