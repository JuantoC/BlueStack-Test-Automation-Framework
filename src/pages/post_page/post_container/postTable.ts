import { By, Key, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../../core/config/default.js";
import { waitFind } from "../../../core/utils/waitFind.js";
import logger from "../../../core/utils/logger.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { retry } from "../../../core/wrappers/retry.js";
import { writeToStandard } from "../../../core/utils/write.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { waitEnabled } from "../../../core/utils/waitEnabled.js";
import { waitVisible } from "../../../core/utils/waitVisible.js";
import { sleep } from "../../../core/utils/backOff.js";

export class PostTable {
  private readonly driver: WebDriver;
  private readonly postTableBodyLocator: Locator = By.css(`div[id="news-table-body"]`);
  private readonly postTitleLabelLocator: Locator = By.css('div[data-testid="div-edit-title"]');
  private readonly postTitleInputLocator: Locator = By.css('textarea[data-testid="text-title-post"]');
  private readonly postEditBtnLocator: Locator = By.css('button[data-testid="btn-edit-post"]');

  // Constantes para el manejo del string requerido
  public readonly OLD_SUFFIX = " | Creado por BlueStack_Test_Automation Framework";
  public readonly NEW_SUFFIX = " | Titulo modificado inline por BlueStack_Test_Automation Framework";

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  /**
   * Encuentra el WebElement del contenedor de la nota basado en su índice.
   * NO devuelve un Locator, devuelve el Elemento listo para usarse.
   */
  async getPostContainerByIndex(index: number, config: RetryOptions): Promise<WebElement> {
    // Aquí sí construimos el locator del padre porque es el punto de entrada
    const rowLocator = By.css(`div[id = "container-table-body"] div[id = "post-management-${index}"]`);
    logger.debug(`Buscando contenedor de nota en índice ${index} con locator: ${rowLocator.value}`, { label: config.label });
    return await waitFind(this.driver, rowLocator, config);
  }

  /**
   * Busca en las primeras 10 filas hasta encontrar el título deseado.
   * Retorna el WebElement de la FILA (Container), no del título, para que puedas seguir operando con ella.
   */
  async getPostContainerByTitle(title: string, opts: RetryOptions): Promise<WebElement> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, `getPostContainerByTitle`)
    };
    const limit = 10;
    if (!title || title.trim() === "") {
      throw new Error("El título no puede estar vacío para buscar el contenedor de la nota.");
    }
    try {

      const element = await waitFind(this.driver, this.postTableBodyLocator, { ...config, timeoutMs: 7000 });
      await waitEnabled(this.driver, element, { ...config, timeoutMs: 7000 });
      await waitVisible(this.driver, element, { ...config, timeoutMs: 7000 });

      for (let i = 0; i < limit; i++) {
        // 1. Obtenemos el contenedor padre (La fila)
        // Usamos supressRetry porque es una búsqueda iterativa, no queremos esperar 30s por cada fila que no sea la correcta.
        const container = await this.getPostContainerByIndex(i, { ...config, supressRetry: true })
          .catch(() => {
            logger.debug("No se encontró el contenedor de la fila con índice " + i, config); return null;
          }); // Si no existe la fila i, continuamos o paramos

        if (!container) continue;

        // 2. Búsqueda Escalonada:
        // Esto es mucho más rápido y seguro contra IDs duplicados en otras tablas.
        logger.debug(`Contenedor de fila ${i} encontrado, buscando título dentro de esta fila...`, config);
        const titleElement = await container.findElement(this.postTitleLabelLocator);
        logger.debug("El elemento label del titulo encontrado con exito.")
        const currentTitle = await titleElement.getText();
        logger.debug("Texto del elemento conseguido con exito.")

        if (currentTitle.includes(title)) {
          logger.debug(`Nota encontrada en índice ${i}: "${currentTitle}"`, { label: config.label });
          return container; // Retornamos el contenedor de la fila donde se encontró el título
        } else {
          logger.debug(`Titulo no encontrado en el contenedor ${i}...`)
        }
      }
      throw new Error(`No se encontró la nota con título parcial "${title}" tras escanear ${limit} filas.`);
    } catch (error) {
      throw new Error(`Error en búsqueda de nota: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
    * Modifica el título dinámicamente. Levanta el texto actual y reemplaza el sufijo del framework.
    * Orquesta la lógica llamando a los helpers específicos.
    */
  async changePostTitle(postContainer: WebElement, opts: RetryOptions): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "changePostTitle") };

    return await retry(async () => {
      logger.debug("Iniciando orquestación de cambio de título...", config.label);

      // 1. Extraer texto actual y calcular el nuevo
      const currentTitle = await this.extractCurrentTitle(postContainer, config);
      const newTitle = currentTitle.replace(this.OLD_SUFFIX, this.NEW_SUFFIX);

      if (currentTitle === newTitle) {
        logger.warn(`El título actual no contenía el sufijo esperado. Título extraído: "${currentTitle}"`, config);
      }

      // 2. Garantizar estado del DOM (Activar input si hace falta)
      await this.activateEditModeIfNeeded(postContainer, config);

      // 3. Escribir y validar el nuevo valor
      await this.writeAndValidateTitle(postContainer, newTitle, config);

    }, config);
  }

  /**
   * Clickea el botón de editar de una fila específica.
   */
  async clickEditorButton(postContainer: WebElement, opts: RetryOptions): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "clickEditorButton") };

    try {
      logger.debug("Buscando botón de editar en el contenedor...", config.label);
      const btnElement = await postContainer.findElement(this.postEditBtnLocator);
      await clickSafe(this.driver, btnElement, { ...config, timeoutMs: 8000 });
    } catch (error) {
      throw new Error(`Fallo al clickear botón editar en la fila: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // =========================================================================
  // MÉTODOS HELPERS PRIVADOS (Atomización de changePostTitle)
  // =========================================================================

  /**
   * HELPER 1: Lee el texto del Label o del Input intentando evadir StaleElements.
   */
  private async extractCurrentTitle(postContainer: WebElement, opts: RetryOptions): Promise<string> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "extractCurrentTitle") };
    try {
      logger.debug("Intentando leer el texto del label...", config.label);
      const labels = await postContainer.findElements(this.postTitleLabelLocator);
      if (labels.length > 0 && await labels[0].isDisplayed()) {
        return await labels[0].getText();
      }

      logger.debug("Label no visible, intentando leer del input...", config.label);
      const inputs = await postContainer.findElements(this.postTitleInputLocator);
      if (inputs.length > 0 && await inputs[0].isDisplayed()) {
        return await inputs[0].getAttribute('value');
      }

      throw new Error("No hay Label ni Input visible para extraer el texto.");
    } catch (error) {
      logger.debug(`Interrupción al leer texto (posible reflow de Angular): ${error}`, config.label);
      throw error; // Delegamos al retry principal
    }
  }

  /**
   * HELPER 2: Revisa si el input está visible. Si no lo está, hace click en el label.
   */
  private async activateEditModeIfNeeded(postContainer: WebElement, opts: RetryOptions): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "activateEditModeIfNeeded") };

    let isInputVisible = false;
    const inputs = await postContainer.findElements(this.postTitleInputLocator);

    if (inputs.length > 0) {
      try {
        isInputVisible = await inputs[0].isDisplayed();
      } catch (e) {
        isInputVisible = false; // El elemento mutó justo al consultarlo
      }
    }

    if (!isInputVisible) {
      logger.debug("Input oculto. Buscando label fresco para clickear...", config.label);
      // Buscamos fresco porque si usamos el de extractCurrentTitle podría estar stale
      const titleElement = await postContainer.findElement(this.postTitleLabelLocator);
      await clickSafe(this.driver, titleElement, { ...config, supressRetry: true });
    } else {
      logger.debug("Input ya visible. Skip click.", config.label);
    }
  }

  /**
   * HELPER 3: Busca el input activado, escribe, espera la renderización de Angular y confirma.
   */
  private async writeAndValidateTitle(postContainer: WebElement, newTitle: string, opts: RetryOptions): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "writeAndValidateTitle") };


    logger.debug("Esperando presencia del input en el DOM...", config.label);
    // fresh lookup es obligatorio aquí porque el DOM acaba de transicionar de Label a Input
    const freshInput = await waitFind(this.driver, this.postTitleInputLocator, config);

    logger.debug("Escribiendo texto...", config.label);
    await writeToStandard(freshInput, newTitle, config.label);

    logger.debug("Pre-validando mutación del DOM...", config.label);
    await this.driver.wait(async () => {
      try {
        const currentValue = await freshInput.getAttribute('value');
        return currentValue === newTitle;
      } catch (e) {
        return false; // Evitamos que un stale momentáneo rompa el wait
      }
    }, 3000, `El input nunca registró el texto: "${newTitle}"`);

    await sleep(200); // Respiro de 200ms para el Event Loop de Angular

    logger.debug("Texto validado. Enviando ENTER.", config.label);
    await freshInput.sendKeys(Key.ENTER);
    await sleep(500);
  }
}