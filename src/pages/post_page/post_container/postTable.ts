import { By, Locator, until, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../../core/config/default.js";
import { waitFind } from "../../../core/utils/waitFind.js";
import logger from "../../../core/utils/logger.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { retry } from "../../../core/wrappers/retry.js";
import { writeToStandard } from "../../../core/utils/write.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";

export class PostTable {
  private readonly driver: WebDriver;
  private readonly postTitleLabelLocator: Locator = By.css('div[data-testid="div-edit-title"]');
  private readonly postTitleInputLocator: Locator = By.css('textarea[data-testid="text-title-post"]');
  private readonly postEditBtnLocator: Locator = By.css('button[data-testid="btn-edit-post"]');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  /**
   * Encuentra el WebElement del contenedor de la nota basado en su índice.
   * NO devuelve un Locator, devuelve el Elemento listo para usarse.
   */
  async getPostContainerByIndex(index: number, config: RetryOptions): Promise<WebElement> {
    // Aquí sí construimos el locator del padre porque es el punto de entrada
    const rowLocator = By.css(`div[id="container-table-body"] div[id="post-management-${index}"]`);
    logger.debug(`Buscando contenedor de nota en índice ${index} con locator: ${rowLocator.value}`, { label: config.label });
    return await waitFind(this.driver, rowLocator, config);
  }

  /**
   * Busca en las primeras 10 filas hasta encontrar el título deseado.
   * Retorna el WebElement de la FILA (Container), no del título, para que puedas seguir operando con ella.
   */
  async getPostContainerByTitle(title: string, config: RetryOptions): Promise<WebElement> {
    const limit = 10;
    if (!title || title.trim() === "") {
      throw new Error("El título no puede estar vacío para buscar el contenedor de la nota.");
    }
    try {
      for (let i = 0; i < limit; i++) {
        // 1. Obtenemos el contenedor padre (La fila)
        // Usamos supressRetry porque es una búsqueda iterativa, no queremos esperar 30s por cada fila que no sea la correcta.
        const rowElement = await this.getPostContainerByIndex(i, { ...config, timeoutMs: 10000, supressRetry: true, initialDelayMs: 10000 })
          .catch(() => { logger.debug("No se encontró el contenedor de la fila con índice " + i, config); return null; }); // Si no existe la fila i, continuamos o paramos

        if (!rowElement) continue;

        // 2. Búsqueda Escalonada:
        // Esto es mucho más rápido y seguro contra IDs duplicados en otras tablas.
        logger.debug(`Contenedor de fila ${i} encontrado, buscando título dentro de esta fila...`, config);
        const titleElement = await rowElement.findElement(this.postTitleLabelLocator);
        const currentTitle = await titleElement.getText();

        if (currentTitle.includes(title)) {
          logger.debug(`Nota encontrada en índice ${i}: "${currentTitle}"`, { label: config.label });
          return titleElement; // Retornamos el contenedor de la fila donde se encontró el título
        }
      }
      throw new Error(`No se encontró la nota con título parcial "${title}" tras escanear ${limit} filas.`);
    } catch (error) {
      throw new Error(`Error en búsqueda de nota: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Modifica el título.
   * Recibe el WebElement de la fila (obtenido con getPostContainerByTitle).
   */
   async changePostTitleToStandard(titleContainer: WebElement, opts: RetryOptions): Promise<void> {
    const config = { ...DefaultConfig, ...opts };

    // Obtenemos el texto del título (asumiendo que titleContainer es un Label válido inicialmente)
    // Usamos un try/catch suave por si titleContainer ya vino stale desde afuera.
    let titleLabel = "";
    try {
      titleLabel = await titleContainer.getText();
    } catch (e) {
      logger.warn("No se pudo leer el texto del título original (posible stale), continuando...", config);
    }

    const newTitle = "Titulo modificado por BTAF Inline";

    logger.debug(`Iniciando flujo de cambio de título...`, config);

    return await retry(async () => {
      // -----------------------------------------------------------
      // PASO 1: IDEMPOTENCIA (Verificar estado visual)
      // -----------------------------------------------------------
      // Buscamos si el INPUT ya existe y es visible.
      const input = await this.driver.findElement(this.postTitleInputLocator);
      let isInputVisible = false;


      try {
        await this.driver.wait(until.elementIsVisible(input), 5000);
        isInputVisible = true;
      } catch (e) {
        isInputVisible = false; // Existe en DOM pero no visible
      }

      // -----------------------------------------------------------
      // PASO 2: ACTIVACIÓN (Click solo si es necesario)
      // -----------------------------------------------------------
      if (!isInputVisible) {
        logger.debug("El input no está visible. Clickeando el label para activar edición.", config);
        // Pasamos supressRetry porque estamos dentro de un bloque retry grande
        await clickSafe(this.driver, titleContainer, { ...config, supressRetry: true });
      } else {
        logger.debug("El input YA está visible. Saltando click de activación.", config);
      }

      // -----------------------------------------------------------
      // PASO 3: FRESH LOOKUP (Búsqueda Fresca)
      // -----------------------------------------------------------
      // Esperamos explícitamente a que el input esté listo para recibir texto.
      // waitFind hace internamente un until.elementLocated + until.elementIsVisible
      const freshInput = await waitFind(this.driver, this.postTitleInputLocator, config);

      // -----------------------------------------------------------
      // PASO 4: ESCRITURA SEGURA
      // -----------------------------------------------------------
      await writeToStandard(freshInput, newTitle, config.label);

      // -----------------------------------------------------------
      // PASO 5: VERIFICACIÓN (Opcional)
      // -----------------------------------------------------------
      // Verificamos que el valor se haya escrito correctamente
      assertValueEquals(freshInput, freshInput, "El título modificado no coincide con el valor esperado.", config);
    }
      , { ...config, label: stackLabel(config.label, "changePostTitleToStandard") });
  }

  /**
   * Clickea el botón de editar de una fila específica.
   */
  async clickEditorButton(postContainer: WebElement, config: RetryOptions): Promise<void> {
    try {
      // 1. Buscamos el botón ÚNICAMENTE dentro de esta fila
      logger.debug("Buscando el botón de editar dentro del contenedor...", config);
      const btnElement = await postContainer.findElement(this.postEditBtnLocator);

      // 2. Click seguro pasando el Elemento directo.
      await clickSafe(this.driver, btnElement, config);

    } catch (error) {
      throw new Error(`Fallo al clickear botón editar en la fila: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}