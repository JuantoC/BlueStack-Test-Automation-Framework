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

export class VideoTable {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private readonly VIDEO_TABLE: Locator = By.css('div#multimedia-table-body')
  private readonly VIDEO_INPUT_FILE: Locator = By.css('input#image-file[type="file"]')
  private readonly DROPDOWN_BTN: Locator = By.css('div#-dropMenu button')
  private readonly VIDEO_CONTAINER: Locator = By.css('div#video-selector-0')
  private readonly VIDEO_TITLE_LABEL: Locator = By.css('div#title-video-0')
  private readonly VIDEO_TITLE_TEXTAREA: Locator = By.css('textarea#textarea-title-video-0')

  public readonly OLD_SUFFIX = " | Subido por BlueStack_Test_Automation_Framework";
  public readonly NEW_SUFFIX = " | Titulo modificado inline por BlueStack_Test_Automation_Framework";

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "VideoTable") }
  }

  /**
   * Clickea el botón de editar de una fila específica.
   */
  async clickEditorButton(postContainer: WebElement): Promise<void> {

    try {


    } catch (error) {
      throw new Error(`Fallo al clickear botón editar en el video: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Busca en las primeras 10 filas hasta encontrar el título deseado.
   * Retorna el WebElement de la FILA (Container), no del título, para que puedas seguir operando con ella.
  */
  async getPostContainerByTitle(title: string): Promise<WebElement> {
    const limit = 10;
    if (!title || title.trim() === "") {
      throw new Error("El título no puede estar vacío para buscar el contenedor de la nota.");
    }
    try {

      logger.debug("Buscando y revisando si la tabla de notas existe y es visible...", { label: this.config.label })
      const element = await waitFind(this.driver, this.VIDEO_TABLE, { ...this.config, timeoutMs: 10000 });
      await waitEnabled(this.driver, element, { ...this.config, timeoutMs: 10000 });
      await waitVisible(this.driver, element, { ...this.config, timeoutMs: 10000 });
      logger.debug("Tabla lista para interactuar.", { label: this.config.label })

      for (let i = 0; i < limit; i++) {
        // 1. Obtenemos el contenedor padre
        // Usamos supressRetry porque es una búsqueda iterativa, no queremos esperar 30s por cada fila que no sea la correcta.
        const container = await this.getPostContainerByIndex(i)
          .catch(() => {
            logger.debug("No se encontró el contenedor de la fila con índice " + i, { label: this.config.label }); return null;
          });
        // Si no existe la fila i, continuamos o paramos
        if (!container) continue;

        // 2. Búsqueda Escalonada:
        logger.debug(`Contenedor de video ${i} encontrado, buscando título dentro de esta fila...`, { label: this.config.label });
        const titleElement = await container.findElement(this.VIDEO_TITLE_LABEL);
        const currentTitle = await titleElement.getText();
        logger.debug("Texto del elemento conseguido con exito.")

        if (currentTitle.includes(title)) {
          logger.debug(`Video encontrada en índice ${i}: "${currentTitle}"`, { label: this.config.label });
          return container; // Retornamos el contenedor del video donde se encontró el título
        } else {
          logger.debug(`Titulo no encontrado en el contenedor ${i}...`)
        }
      }
      throw new Error(`No se encontró el video con título parcial "${title}" tras escanear ${limit} filas.`);
    } catch (error) {
      throw new Error(`Error en búsqueda de video: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Modifica el título dinámicamente. Levanta el texto actual y reemplaza el sufijo del framework.
   * Orquesta la lógica llamando a los helpers específicos.
  */
  async changeVideoTitle(videoContainer: WebElement): Promise<void> {
    return await retry(async () => {
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
      await this.writeAndValidateTitle(videoContainer, newTitle);

    }, this.config);
  }

  /**
   * Encuentra el WebElement del contenedor de la nota basado en su índice.
   * NO devuelve un Locator, devuelve el Elemento listo para usarse.
   */
  async getPostContainerByIndex(index: number): Promise<WebElement> {
    // Aquí sí construimos el locator del padre porque es el punto de entrada
    const rowLocator = By.css(`div[id = "video-selector-${index}"]`);
    logger.debug(`Buscando contenedor de nota en índice ${index} con locator: ${rowLocator.value}`, { label: this.config.label });
    return await waitFind(this.driver, rowLocator, { ...this.config, supressRetry: true });
  }

  // =========================================================================
  // MÉTODOS HELPERS PRIVADOS
  // =========================================================================

  /**
   * HELPER 1: Lee el texto del Label o del textarea intentando evadir StaleElements.
   */
  private async extractCurrentTitle(videoContainer: WebElement): Promise<string> {
    try {
      logger.debug("Intentando leer el texto del label...", { label: this.config.label });
      const labels = await videoContainer.findElements(this.VIDEO_TITLE_LABEL);
      if (labels.length > 0 && await labels[0].isDisplayed()) {
        return await labels[0].getText();
      }

      logger.debug("Label no visible, intentando leer del textarea...", { label: this.config.label });
      const inputs = await videoContainer.findElements(this.VIDEO_TITLE_TEXTAREA);
      if (inputs.length > 0 && await inputs[0].isDisplayed()) {
        return await inputs[0].getAttribute('value');
      }

      throw new Error("No hay Label ni textarea visible para extraer el texto.");
    } catch (error) {
      logger.debug(`Interrupción al leer texto (posible reflow de Angular): ${error}`, { label: this.config.label });
      throw error; // Delegamos al retry principal
    }
  }

  /**
   * HELPER 2: Revisa si el textarea está visible. Si no lo está, hace click en el label.
   */
  private async activateEditModeIfNeeded(videoContainer: WebElement): Promise<void> {

    let isTextareaVisible = false;
    const inputs = await videoContainer.findElements(this.VIDEO_TITLE_TEXTAREA);

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
      const titleElement = await videoContainer.findElement(this.VIDEO_TITLE_LABEL);
      await clickSafe(this.driver, titleElement, { ...this.config, supressRetry: true });
    } else {
      logger.debug("Textarea ya visible. Skip click.", { label: this.config.label });
    }
  }

  /**
   * HELPER 3: Busca el Textarea activado, escribe, espera la renderización de Angular y confirma.
   */
  private async writeAndValidateTitle(videoContainer: WebElement, newTitle: string): Promise<void> {


    logger.debug("Esperando presencia del Textarea en el DOM...", { label: this.config.label });
    // fresh lookup es obligatorio aquí porque el DOM acaba de transicionar de Label a Textarea
    const freshTextarea = await waitFind(this.driver, this.VIDEO_TITLE_TEXTAREA, this.config);

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
}