import { By, Key, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { retry } from "../../core/wrappers/retry.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { writeToStandard } from "../../core/helpers/write.js";
import { sleep } from "../../core/utils/backOff.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object que representa la tabla de multimedia de videos del CMS.
 * Centraliza las operaciones sobre las filas de la tabla: búsqueda por título o índice,
 * edición inline del título, selección de videos y espera de nuevos registros.
 * Usado por `MainVideoPage` como capa de acceso a los datos tabulares.
 *
 * @example
 * const table = new VideoTable(driver, opts);
 * const container = await table.getVideoContainerByTitle('Mi video');
 * await table.changeVideoTitle(container);
 */
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
    this.config = resolveRetryConfig(opts, "VideoTable")
  }


  /**
   * Busca en los primeros `limit` videos hasta encontrar el título deseado.
   * Retorna el WebElement del video (Container), no del título, para que puedas seguir operando con él.
   *
   * @param title - Título exacto o fragmento a buscar.
   * @param limit - Cantidad máxima de contenedores a recorrer. Por defecto 10.
   * @returns WebElement del contenedor del video que coincide con el título.
  */
  async getVideoContainerByTitle(title: string, limit = 10): Promise<WebElement> {
    if (!title || title.trim() === "") {
      throw new Error("El título no puede estar vacío para buscar el contenedor del video.");
    }
    try {
      await this.waitUntilIsReady(VideoTable.VIDEO_TABLE);

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
    } catch (error: unknown) {
      logger.error(`Error en búsqueda de video: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw new Error(`Error en búsqueda de video: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Modifica el título dinámicamente. Levanta el texto actual y reemplaza el sufijo del framework.
   * Orquesta la lógica llamando a los helpers específicos.
   *
   * @param videoContainer - Contenedor WebElement del video cuyo título se va a modificar.
  */
  async changeVideoTitle(videoContainer: WebElement): Promise<void> {
    try {
      await retry(async () => {

        await this.waitUntilIsReady(VideoTable.VIDEO_TABLE);
        logger.debug("Iniciando orquestación de cambio de título...", { label: this.config.label });

        // 1. Extraer texto actual y calcular el nuevo
        const currentTitle = await this.readVideoTitle(videoContainer);
        const newTitle = currentTitle.replace(this.OLD_SUFFIX, this.NEW_SUFFIX);

        if (currentTitle === newTitle) {
          logger.warn(`El título actual no contenía el sufijo esperado. Título extraído: "${currentTitle}"`, { label: this.config.label });
        }

        // 2. Garantizar estado del DOM (Activar Textarea si hace falta)
        await this.activateInlineEditMode(videoContainer);

        // 3. Escribir y validar el nuevo valor
        await this.writeInlineTitle(newTitle);

      }, this.config);
      await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
    } catch (error: unknown) {
      logger.error(`Error al cambiar titulo de video: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Selecciona un video en la tabla haciendo click sobre su contenedor si aún no está seleccionado.
   * Verifica la presencia del ícono de check antes de actuar para evitar deselecciones accidentales.
   *
   * @param videoContainer - Contenedor WebElement del video que se desea seleccionar.
   */
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
    } catch (error: unknown) {
      logger.error(`Error al seleccionar el video deseado. Error:${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Cierra el textarea de edición inline que el CMS activa automáticamente al subir un nuevo video.
   * Espera a que el textarea aparezca en el contenedor del primer video y envía la tecla
   * ESCAPE para salir del modo de edición sin modificar el título.
   */
  async skipInlineTitleEdit() {
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

    } catch (error: unknown) {
      logger.error(`Ocurrio un error intentando quitar la edicion inline del video: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) })
      throw error;
    }
  }

  /**
   * Espera a que el nuevo video recién subido aparezca en la primera posición de la tabla.
   * Hace polling mediante `driver.wait` comprobando el atributo `value` del textarea de título
   * hasta que incluya el título esperado o se supere el timeout.
   *
   * @param expectedTitle - Fragmento del título esperado para verificar que el video correcto está en index 0.
   * @param timeoutMs - Tiempo máximo de espera en milisegundos. Por defecto 30 segundos.
   */
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
        } catch (error: unknown) {
          logger.debug(`El DOM todavía está actualizándose, reintentamos... ${getErrorMessage(error)}`, { label: this.config.label });
          // Esperamos 500ms para que el DOM se actualice
          await sleep(500)
          return false;
        }
      }, timeoutMs, `Timeout: El nuevo video "${expectedTitle}" nunca apareció en index 0 de la tabla.`);

      logger.debug('Nuevo video detectado en index 0. Tabla actualizada.', { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error en waitForNewVideoAtIndex0: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  // =========================================================================
  //                    MÉTODOS HELPERS
  // =========================================================================

  /**
   * Encuentra el WebElement del contenedor del video basado en su índice.
   * NO devuelve un Locator, devuelve el Elemento listo para usarse.
   *
   * @param index - Índice (base 0) del video en la tabla.
   * @returns WebElement del contenedor del video en la posición indicada.
   */
  async getVideoContainerByIndex(index: number): Promise<WebElement> {
    try {
      // Aquí sí construimos el locator del padre porque es el punto de entrada
      const rowLocator = By.css(`div[id = "video-selector-${index}"]`);
      logger.debug(`Buscando contenedor de nota en índice ${index} con locator: ${rowLocator.value}`, { label: this.config.label });
      return await waitFind(this.driver, rowLocator, { ...this.config, supressRetry: true });
    } catch (error: unknown) {
      logger.error(`Ocurrio un error encontrando el contenedor del video por ID: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) })
      throw error;
    }
  }

  /**
   * Lee el título visible de un video en la tabla.
   * Intenta primero el label CSS `.title-video` y, si no está visible, el textarea inline.
   *
   * @param videoContainer - WebElement contenedor del video (fila de la tabla).
   * @returns {Promise<string>} Texto del título del video.
   */
  async readVideoTitle(videoContainer: WebElement): Promise<string> {
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
    } catch (error: unknown) {
      logger.debug(`Interrupción al leer texto (posible reflow de Angular): ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Activa el modo de edición inline del título de un video.
   * Si el textarea ya está visible lo deja activo; si no, hace click en el label para disparar la transición.
   *
   * @param videoContainer - WebElement contenedor del video (fila de la tabla).
   */
  async activateInlineEditMode(videoContainer: WebElement): Promise<void> {

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

  /**
   * Escribe un nuevo título en el textarea de edición inline activo.
   * Requiere que `activateInlineEditMode` haya sido llamado previamente.
   *
   * @param newTitle - Nuevo título a ingresar en el campo inline.
   */
  async writeInlineTitle(newTitle: string): Promise<void> {

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
  }

  /**
   * Retorna el WebElement del input de archivo de video de la tabla.
   *
   * @returns {Promise<WebElement>} El elemento localizado.
   */
  public async getVideoInputFile(): Promise<WebElement> {
    try {
      logger.debug("Locating video input file", { label: this.config.label });
      return await waitFind(this.driver, VideoTable.VIDEO_INPUT_FILE, this.config);
    } catch (error: unknown) {
      logger.error(`Error en getVideoInputFile: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Hace click en el botón de actualización de fondo de la tabla de videos.
   */
  public async clickBackgroundUpdateBtn(): Promise<void> {
    try {
      logger.debug("Clicking background update button", { label: this.config.label });
      await clickSafe(this.driver, VideoTable.BACKGROUND_UPDATE_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error en clickBackgroundUpdateBtn: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  private async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    logger.debug(`Esperando a que el elemento ${JSON.stringify(locator)} este listo`, { label: this.config.label })

    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)

    return element
  }
}