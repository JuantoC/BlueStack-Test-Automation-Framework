import { By, Key, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { waitFind } from "../../core/actions/waitFind.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { retry } from "../../core/wrappers/retry.js";
import { writeToStandard } from "../../core/helpers/write.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { sleep } from "../../core/utils/backOff.js";
import { hoverOverParentContainer } from "../../core/helpers/hoverOverParentContainer.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Sub-componente que representa la tabla de notas del CMS.
 * Centraliza las operaciones sobre filas de la tabla: búsqueda por título o índice,
 * edición inline del título, selección de posts y espera de nuevos registros.
 * Usado por `MainPostPage` como capa de acceso a los datos tabulares.
 *
 * @example
 * const table = new PostTable(driver, opts);
 * const container = await table.getPostContainerByTitle('Mi nota');
 * await table.clickEditorButton(container);
 */
export class PostTable {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly POST_TABLE_BODY: Locator = By.css(`div[id="news-table-body"]`);
  private static readonly POST_TITLE_LABEL: Locator = By.css('div[data-testid="div-edit-title"]');
  private static readonly POST_TITLE_INPUT: Locator = By.css('textarea[data-testid="text-title-post"]');
  private static readonly POST_EDIT_BTN: Locator = By.css('button[data-testid="btn-edit-post"]');
  private static readonly CHECKBOX: Locator = By.css('mat-checkbox[data-testid="checkbox-notice"]');
  private static readonly LOADING_CONTAINER: Locator = By.css('div.process-fields');

  // Constantes para el manejo del string requerido
  public readonly OLD_SUFFIX = " | Creado por BlueStack_Test_Automation_Framework";
  public readonly NEW_SUFFIX = " | Titulo modificado inline por BlueStack_Test_Automation_Framework";

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "PostTable");
  }
  /**
   * Selecciona el checkbox de un post en la tabla si aún no está marcado.
   * Verifica el atributo `class` del checkbox para evitar deselecciones accidentales
   * sobre posts que ya estuvieran seleccionados.
   *
   * @param postContainer - Contenedor WebElement de la fila del post a seleccionar.
   */
  async selectPost(postContainer: WebElement): Promise<void> {
    try {
      logger.debug('Iniciando seleccion del post', { label: this.config.label })
      const checkbox = await postContainer.findElements(PostTable.CHECKBOX);
      if (checkbox.length > 0) {
        const classAttribute = await checkbox[0].getAttribute('class');

        if (!classAttribute.includes('mdc-checkbox--selected')) {
          logger.debug("El checkbox no esta seleccionado, haciendo click", { label: this.config.label });
          await clickSafe(this.driver, checkbox[0], this.config);
        }
      }
      logger.debug("Checkbox seleccionado", { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error al seleccionar el post: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Busca en las primeras 10 filas hasta encontrar el título deseado.
   * Retorna el WebElement de la FILA (Container), no del título, para que puedas seguir operando con ella.
   * Utiliza búsqueda escalonada (contenedor padre → título interno) para evitar IDs duplicados en el DOM.
   * El flujo completo está envuelto en un `retry` con 2 reintentos ante cambios de DOM de Angular.
   *
   * @param title - Fragmento del título de la nota a buscar (comparación por `includes`).
   * @returns {Promise<WebElement>} Contenedor WebElement de la fila que contiene la nota buscada.
   */
  async getPostContainerByTitle(title: string): Promise<WebElement> {
    const limit = 10;
    if (!title || title.trim() === "") {
      throw new Error("El título no puede estar vacío para buscar el contenedor de la nota.");
    }
    return await retry(async () => {
      try {
        await this.waitUntilIsReady(PostTable.POST_TABLE_BODY)

        for (let i = 0; i < limit; i++) {
          // 1. Obtenemos el contenedor padre (La fila)
          // Usamos supressRetry porque es una búsqueda iterativa, no queremos esperar 30s por cada fila que no sea la correcta.
          const container = await this.getPostContainerByIndex(i)
            .catch(() => {
              logger.debug("No se encontró el contenedor de la fila con índice " + i, { label: this.config.label }); return null;
            }); // Si no existe la fila i, continuamos o paramos

          if (!container) continue;

          // 2. Búsqueda Escalonada:
          // Esto es mucho más rápido y seguro contra IDs duplicados en otras tablas.
          logger.debug(`Contenedor de fila ${i} encontrado, buscando título dentro de esta fila...`, { label: this.config.label });
          const titleElement = await container.findElement(PostTable.POST_TITLE_LABEL);
          logger.debug("El elemento label del titulo encontrado con exito.", { label: this.config.label })
          const currentTitle = await titleElement.getText();
          logger.debug("Texto del elemento conseguido con exito.", { label: this.config.label })

          if (currentTitle.includes(title)) {
            logger.debug(`Nota encontrada en índice ${i}: "${currentTitle}"`, { label: this.config.label });
            return container; // Retornamos el contenedor de la fila donde se encontró el título
          } else {
            logger.debug(`Titulo no encontrado en el contenedor ${i}...`, { label: this.config.label })
          }
        }
        throw new Error(`No se encontró la nota con título parcial "${title}" tras escanear ${limit} filas.`);
      } catch (error: unknown) {
        logger.error(`Error en búsqueda de nota: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    }, { ...this.config, retries: 2 });
  }

  /**
   * Modifica el título inline de una nota reemplazando el sufijo `OLD_SUFFIX` por `NEW_SUFFIX`.
   * Orquesta la lógica en tres pasos: extracción del título actual (`extractCurrentTitle`),
   * activación del modo de edición si el input está oculto (`activateEditModeIfNeeded`)
   * y escritura con validación del nuevo valor (`writeAndValidateTitle`).
   *
   * @param postContainer - Contenedor WebElement de la fila del post a editar.
   */
  async changePostTitle(postContainer: WebElement): Promise<void> {

    await this.waitUntilIsReady(PostTable.POST_TABLE_BODY)

    logger.debug("Iniciando orquestación de cambio de título...", { label: this.config.label });

    // 1. Extraer texto actual y calcular el nuevo
    const currentTitle = await this.extractCurrentTitle(postContainer);
    const newTitle = currentTitle.replace(this.OLD_SUFFIX, this.NEW_SUFFIX);

    if (currentTitle === newTitle) {
      logger.info(`El título actual ya contenía el sufijo esperado. Título extraído: "${currentTitle}"`, { label: this.config.label });
      return;
    }
    // 2. Garantizar estado del DOM (Activar input si hace falta)
    await this.activateEditModeIfNeeded(postContainer);

    // 3. Escribir y validar el nuevo valor
    await this.writeAndValidateTitle(postContainer, newTitle);
  }

  /**
   * Hace hover sobre el contenedor y click en el botón de editar de la nota.
   * El hover es necesario para revelar los botones de acción que se ocultan por defecto en el CSS.
   * Delega en `hoverOverParentContainer` antes de `clickSafe`.
   *
   * @param postContainer - Contenedor WebElement de la fila que contiene el botón de editar.
   */
  async clickEditorButton(postContainer: WebElement): Promise<void> {

    try {
      logger.debug("Buscando botón de editar en el contenedor...", { label: this.config.label });
      const btnElement = await postContainer.findElement(PostTable.POST_EDIT_BTN);
      await hoverOverParentContainer(this.driver, postContainer, this.config);
      await clickSafe(this.driver, btnElement, { ...this.config, timeoutMs: 8000 });
    } catch (error: unknown) {
      logger.error(`Fallo al clickear botón editar en la nota: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  // =========================================================================
  //      MÉTODOS HELPERS PRIVADOS
  // =========================================================================

  /**
   * Obtiene el contenedor WebElement de una nota por su posición en la tabla (base 0).
   * Construye el locator dinámico `post-management-{index}` y lo busca con `supressRetry`
   * para evitar esperas largas en iteraciones donde la fila puede no existir.
   *
   * @param index - Posición de la nota en la tabla (0 = más reciente).
   * @returns {Promise<WebElement>} Contenedor WebElement listo para operar sobre él.
   */
  async getPostContainerByIndex(index: number): Promise<WebElement> {
    await this.waitUntilIsReady(PostTable.POST_TABLE_BODY)
    // Aquí sí construimos el locator del padre porque es el punto de entrada
    const rowLocator = By.css(`div[id = "container-table-body"] div[id = "post-management-${index}"]`);
    logger.debug(`Buscando contenedor de nota en índice ${index} con locator: ${rowLocator.value}`, { label: this.config.label });
    return await waitFind(this.driver, rowLocator, { ...this.config, supressRetry: true });
  }

  /**
   * HELPER 1: Lee el texto del Label o del Input intentando evadir StaleElements.
   */
  private async extractCurrentTitle(postContainer: WebElement): Promise<string> {
    try {
      logger.debug("Intentando leer el texto del label...", { label: this.config.label });
      const labels = await postContainer.findElements(PostTable.POST_TITLE_LABEL);
      if (labels.length > 0 && await labels[0].isDisplayed()) {
        return await labels[0].getText();
      }

      logger.debug("Label no visible, intentando leer del input...", { label: this.config.label });
      const inputs = await postContainer.findElements(PostTable.POST_TITLE_INPUT);
      if (inputs.length > 0 && await inputs[0].isDisplayed()) {
        return await inputs[0].getAttribute('value');
      }

      throw new Error("No hay Label ni Input visible para extraer el texto.");
    } catch (error: unknown) {
      logger.error(`Interrupción al leer texto (posible reflow de Angular): ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error; // Delegamos al retry principal
    }
  }

  /**
   * HELPER 2: Revisa si el input está visible. Si no lo está, hace click en el label.
   */
  private async activateEditModeIfNeeded(postContainer: WebElement): Promise<void> {

    let isInputVisible = false;
    const inputs = await postContainer.findElements(PostTable.POST_TITLE_INPUT);

    if (inputs.length > 0) {
      try {
        isInputVisible = await inputs[0].isDisplayed();
      } catch (e) {
        isInputVisible = false; // El elemento mutó justo al consultarlo
      }
    }

    if (!isInputVisible) {
      logger.debug("Input oculto. Buscando label fresco para clickear...", { label: this.config.label });
      // Buscamos fresco porque si usamos el de extractCurrentTitle podría estar stale
      const titleElement = await postContainer.findElement(PostTable.POST_TITLE_LABEL);
      await clickSafe(this.driver, titleElement, { ...this.config, supressRetry: true });
    } else {
      logger.debug("Input ya visible. Skip click.", { label: this.config.label });
    }
  }

  /**
   * HELPER 3: Busca el input activado, escribe, espera la renderización de Angular y confirma.
   */
  private async writeAndValidateTitle(postContainer: WebElement, newTitle: string): Promise<void> {
    let freshInput: WebElement;

    logger.debug("Esperando presencia del input en el DOM...", { label: this.config.label });
    // Búsqueda segura con contexto local usando polling
    await this.driver.wait(async () => {
      try {
        const inputs = await postContainer.findElements(PostTable.POST_TITLE_INPUT);
        if (inputs.length > 0 && await inputs[0].isDisplayed()) {
          freshInput = inputs[0];
          return true;
        }
        return false;
      } catch (e) {
        return false; // Ignorar errores si el DOM muta mientras buscamos
      }
    }, 5000, "El input nunca apareció dentro del postContainer");

    logger.debug("Escribiendo texto...", { label: this.config.label });
    await writeToStandard(freshInput!, newTitle, this.config.label);

    logger.debug("Pre-validando mutación del DOM...", { label: this.config.label });
    await this.driver.wait(async () => {
      try {
        const currentValue = await freshInput.getAttribute('value');
        return currentValue === newTitle;
      } catch (e) {
        return false; // Evitamos que un stale momentáneo rompa el wait
      }
    }, 3000, `El input nunca registró el texto: "${newTitle}"`);

    logger.debug("Texto validado. Enviando ENTER.", { label: this.config.label });
    await freshInput!.sendKeys(Key.ENTER);
  }

  /**
   * Espera a que el indicador de carga del proceso de guardado desaparezca del DOM.
   * Hace polling sobre `div.process-fields` durante 10 segundos; lanza error si persiste.
   */
  async waitForLoadingContainerDisappear(): Promise<void> {
    logger.debug("Esperando que el contenedor de carga desaparezca...", { label: this.config.label });
    await this.driver.wait(async () => {
      const loadContainer = await this.driver.findElements(PostTable.LOADING_CONTAINER);
      if (loadContainer.length > 0) {
        return false
      }
      return true
    }, 10000, "El contenedor nunca salió del estado de carga");
  }

  private async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    logger.debug(`Esperando a que el elemento ${JSON.stringify(locator)} este listo`, { label: this.config.label })

    const element = await waitFind(this.driver, locator, { ...this.config, timeoutMs: 8000 })
    await waitEnabled(this.driver, element, { ...this.config, timeoutMs: 8000 })
    await waitVisible(this.driver, element, { ...this.config, timeoutMs: 8000 })

    return element
  }

  /**
   * Espera a que la nueva nota recién creada aparezca en la primera posición de la tabla.
   * Hace polling comparando el título del contenedor en índice 0 contra `expectedTitle`.
   * Útil para sincronizar el test después de crear una nota antes de continuar interactuando.
   *
   * @param expectedTitle - Fragmento del título esperado para confirmar que la nota está en índice 0.
   * @param timeoutMs - Tiempo máximo de espera en milisegundos. Por defecto 30 segundos.
   */
  async waitForNewPostAtIndex0(expectedTitle: string, timeoutMs = 30000): Promise<void> {
    try {
      logger.debug(`Esperando que la nueva nota aparezca en index 0. Título esperado: "${expectedTitle}"`, { label: this.config.label });

      await this.driver.wait(async () => {
        try {
          const container = await this.getPostContainerByIndex(0);
          const titleEl = await container.findElement(PostTable.POST_TITLE_LABEL);
          const currentTitle = await titleEl.getText();
          logger.debug(`Título actual en index 0: "${currentTitle}"`, { label: this.config.label });
          return currentTitle.includes(expectedTitle);
        } catch (error: unknown) {
          logger.debug(`El DOM todavía está actualizándose, reintentamos... ${getErrorMessage(error)}`, { label: this.config.label });
          // Esperamos 500ms para que el DOM se actualice
          await sleep(500)
          return false;
        }
      }, timeoutMs, `Timeout: La nueva nota "${expectedTitle}" nunca apareció en index 0 de la tabla.`);

      logger.debug('Nueva nota detectada en index 0. Tabla actualizada.', { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error en waitForNewPostAtIndex0: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}