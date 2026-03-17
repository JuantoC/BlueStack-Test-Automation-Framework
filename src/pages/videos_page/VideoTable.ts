import { By, Key, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { retry } from "../../core/wrappers/retry.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { writeToStandard } from "../../core/helpers/write.js";
import { sleep } from "../../core/utils/backOff.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { step } from "allure-js-commons";

export class VideoTable {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly VIDEO_TABLE: Locator = By.css('div#multimedia-table-body')
  private static readonly VIDEO_INPUT_FILE: Locator = By.css('input#image-file[type="file"]')
  private static readonly BACKGROUND_UPDATE_BTN: Locator = By.css('div.second-section')
  private static readonly CHECK_BOX: Locator = By.css('mat-icon.icon-check')

  public readonly OLD_SUFFIX = " | Subido por BlueStack_Test_Automation_Framework";
  public readonly NEW_SUFFIX = " | Titulo modificado inline por BlueStack_Test_Automation_Framework";

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "VideoTable") }
  }


  /**
   * Busca en los primeros 10 videos hasta encontrar el título deseado.
   * Retorna el WebElement del video (Container), no del título, para que puedas seguir operando con él.
  */
  async getVideoContainerByTitle(title: string): Promise<WebElement> {
    const limit = 10;
    if (!title || title.trim() === "") {
      throw new Error("El título no puede estar vacío para buscar el contenedor del video.");
    }
    try {
      logger.debug("Buscando y revisando si la tabla de videos existe y es visible...", { label: this.config.label })
      await this.waitUntilIsReady(VideoTable.VIDEO_TABLE);
      logger.debug("Tabla lista para interactuar.", { label: this.config.label })

      return await retry(async () => {
        for (let i = 0; i < limit; i++) {
          // 1. Obtenemos el contenedor padre
          const container = await this.getVideoContainerByIndex(i)
            .catch(() => {
              logger.debug("No se encontró el contenedor del video con índice " + i, { label: this.config.label });
              return null;
            });
          // Si no existe el video i, continuamos o paramos
          if (!container) continue;

          // 2. Búsqueda Escalonada:
          logger.debug(`Contenedor de video ${i} encontrado, buscando título dentro de este...`, { label: this.config.label });
          const titleElement = await container.findElement(By.css(`div#title-video-${i}`));
          const currentTitle = await titleElement.getText();
          logger.debug("Texto del elemento conseguido con exito.", { label: this.config.label })

          if (currentTitle.includes(title)) {
            logger.debug(`Video encontrada en índice ${i}: "${currentTitle}"`, { label: this.config.label });
            return container; // Retornamos el contenedor del video donde se encontró el título
          } else {
            logger.debug(`Titulo no encontrado en el contenedor ${i}...`, { label: this.config.label })
          }
        }
        throw new Error(`No se encontró el video con título parcial "${title}" tras escanear ${limit} videos.`);
      }, { ...this.config, retries: 2 })
    } catch (error: any) {
      logger.error(`Error en búsqueda de video: ${error.message}`, { label: this.config.label, error: error.message });
      throw new Error(`Error en búsqueda de video: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Modifica el título dinámicamente. Levanta el texto actual y reemplaza el sufijo del framework.
   * Orquesta la lógica llamando a los helpers específicos.
  */
  async changeVideoTitle(videoContainer: WebElement): Promise<void> {
    try {
      return await retry(async () => {

        await this.waitUntilIsReady(VideoTable.VIDEO_TABLE);
        logger.debug("Iniciando orquestación de cambio de título...", { label: this.config.label });

        // 1. Extraer texto actual y calcular el nuevo
        const currentTitle = await this.extractCurrentTitle(videoContainer);
        const newTitle = currentTitle.replace(this.OLD_SUFFIX, this.NEW_SUFFIX);

        if (currentTitle === newTitle) {
          logger.warn(`El título actual no contenía el sufijo esperado. Título extraído: "${currentTitle}"`, { label: this.config.label });
        }

        // 2. Garantizar estado del DOM (Activar Textarea si hace falta)
        await this.activateEditModeIfNeeded(videoContainer);

        // 3. Escribir y validar el nuevo valor
        await this.writeAndValidateTitle(newTitle);

      }, this.config);
    } catch (error: any) {
      logger.error(`Error al cambiar titulo de video: ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }

  async selectVideo(videoContainer: WebElement): Promise<void> {
    try {
      logger.debug('Revisando que el video no este seleccionado...', { label: this.config.label });
      const checkBox = await videoContainer.findElements(VideoTable.CHECK_BOX);
      if (checkBox.length > 0) {
        logger.debug('El video ya se encuentra seleccionado...', { label: this.config.label })
        return
      }
      logger.debug('Seleccionando video...', { label: this.config.label });
      await clickSafe(this.driver, videoContainer, this.config);
    } catch (error: any) {
      logger.error(`Error al seleccionar el video deseado. Error:${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }

  async skipInlineTitleEdit() {
    await step('Sacando la edicion inline automatica al subir un nuevo video', async (stepContext) => {
      try {
        logger.debug('Esperando y sacando la edicion inline automatica al subir un nuevo video...', { label: this.config.label })
        const actualVideo = await this.getVideoContainerByIndex(0);

        await this.driver.wait(async () => {
          const textarea = await actualVideo.findElements(By.css(`textarea.cdk-textarea-autosize`));
          return textarea.length > 0
        }, this.config.timeoutMs)

        const textarea = await actualVideo.findElement(By.css(`textarea.cdk-textarea-autosize`))
        await textarea.sendKeys(Key.ESCAPE);
        logger.debug('Key de escape enviada. Edicion inline sacada', { label: this.config.label })

      } catch (error: any) {
        logger.error(`Ocurrio un error intentando quitar la edicion inline del video: ${error.message}`, { label: this.config.label, error: error.message })
        throw error;
      }
    })
  }

  async waitForNewVideoAtIndex0(expectedTitle: string, timeoutMs = 30000): Promise<void> {
    try {
      logger.debug(`Esperando que el nuevo video aparezca en index 0. Título esperado: "${expectedTitle}"`, { label: this.config.label });

      await this.driver.wait(async () => {
        try {
          const container = await this.getVideoContainerByIndex(0);
          const titleEl = await container.findElement(By.css('textarea.cdk-textarea-autosize'));
          const currentTitle = await titleEl.getAttribute('value');
          logger.debug(`Título actual en index 0: "${currentTitle}"`, { label: this.config.label });
          return currentTitle.includes(expectedTitle);
        } catch (error: any) {
          logger.debug(`El DOM todavía está actualizándose, reintentamos... ${error.message}`, { label: this.config.label });
          // Esperamos 500ms para que el DOM se actualice
          await sleep(500)
          return false;
        }
      }, timeoutMs, `Timeout: El nuevo video "${expectedTitle}" nunca apareció en index 0 de la tabla.`);

      logger.debug('Nuevo video detectado en index 0. Tabla actualizada.', { label: this.config.label });
    } catch (error: any) {
      logger.error(`Error en waitForNewVideoAtIndex0: ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }

  // =========================================================================
  //                    MÉTODOS HELPERS
  // =========================================================================

  /**
   * Encuentra el WebElement del contenedor de la nota basado en su índice.
   * NO devuelve un Locator, devuelve el Elemento listo para usarse.
   */
  async getVideoContainerByIndex(index: number): Promise<WebElement> {
    try {
      // Aquí sí construimos el locator del padre porque es el punto de entrada
      const rowLocator = By.css(`div[id = "video-selector-${index}"]`);
      logger.debug(`Buscando contenedor de nota en índice ${index} con locator: ${rowLocator.value}`, { label: this.config.label });
      return await waitFind(this.driver, rowLocator, { ...this.config, supressRetry: true });
    } catch (error: any) {
      logger.error(`Ocurrio un error encontrando el contenedor del video por ID: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }

  private async extractCurrentTitle(videoContainer: WebElement): Promise<string> {
    try {
      logger.debug("Intentando leer el texto del label...", { label: this.config.label });
      try {
        const labels = await videoContainer.findElements(By.css(`div.title-video`));
        if (labels.length > 0 && await labels[0].isDisplayed()) {
          return await labels[0].getText();
        }
      } catch (e) {
        logger.debug(`Error al evaluar el label, ignorando: ${e}`, { label: this.config.label });
      }

      logger.debug("Label no visible o con error, intentando leer del textarea...", { label: this.config.label });
      try {
        const textarea = await videoContainer.findElements(By.css(`textarea.cdk-textarea-autosize`));
        if (textarea.length > 0 && await textarea[0].isDisplayed()) {
          return await textarea[0].getAttribute('value');
        }
      } catch (e) {
        logger.debug(`Error al evaluar el textarea, ignorando: ${e}`, { label: this.config.label });
      }

      throw new Error("No hay Label ni textarea visible para extraer el texto.");
    } catch (error: any) {
      logger.debug(`Interrupción al leer texto (posible reflow de Angular): ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }

  private async activateEditModeIfNeeded(videoContainer: WebElement): Promise<void> {

    let isTextareaVisible = false;
    logger.debug('Buscando textarea en el DOM...', { label: this.config.label })
    const inputs = await videoContainer.findElements(By.css(`textarea.cdk-textarea-autosize`));

    if (inputs.length > 0) {
      try {
        isTextareaVisible = await inputs[0].isDisplayed();
      } catch (e) {
        isTextareaVisible = false; // El elemento mutó justo al consultarlo
      }
    }

    if (!isTextareaVisible) {
      logger.debug("Textarea oculto. Buscando label fresco para clickear...", { label: this.config.label });
      // Buscamos fresco porque si usamos el de extractCurrentTitle podría estar stale
      const titleElement = await videoContainer.findElement(By.css(`div.title-video`));
      await clickSafe(this.driver, titleElement, { ...this.config, supressRetry: true });
    } else {
      logger.debug("Textarea ya visible. Skip click.", { label: this.config.label });
    }
  }

  private async writeAndValidateTitle(newTitle: string): Promise<void> {

    logger.debug("Esperando presencia del Textarea en el DOM...", { label: this.config.label });
    // fresh lookup es obligatorio aquí porque el DOM acaba de transicionar de Label a Textarea
    const freshTextarea = await waitFind(this.driver, By.css('textarea.cdk-textarea-autosize'), this.config);

    logger.debug("Escribiendo texto...", { label: this.config.label });
    await writeToStandard(freshTextarea, newTitle, this.config.label);

    logger.debug("Pre-validando mutación del DOM...", { label: this.config.label });
    await this.driver.wait(async () => {
      try {
        const currentValue = await freshTextarea.getAttribute('value');
        return currentValue === newTitle;
      } catch (e) {
        return false; // Evitamos que un stale momentáneo rompa el wait
      }
    }, 3000, `El Textarea nunca registró el texto: "${newTitle}"`);

    await sleep(200); // Respiro de 200ms para el Event Loop de Angular

    logger.debug("Texto validado. Enviando ENTER.", { label: this.config.label });
    await freshTextarea.sendKeys(Key.ENTER);
    await sleep(500);
  }

  private async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    logger.debug(`Esperando a que el elemento ${JSON.stringify(locator)} este listo`, { label: this.config.label })

    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)

    return element
  }
}