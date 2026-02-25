import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { RetryOptions } from "../../../core/config/default.js";
import { waitFind } from "../../../core/utils/waitFind.js";
import logger from "../../../core/utils/logger.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";

export class PostTable {
  private readonly driver: WebDriver;
  private readonly postTitleInputLocator: Locator = By.css('div[data-testid="div-edit-title"]');
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
    return await waitFind(this.driver, rowLocator, config);
  }

  /**
   * Busca en las primeras 10 filas hasta encontrar el título deseado.
   * Retorna el WebElement de la FILA (Container), no del título, para que puedas seguir operando con ella.
   */
  async getPostContainerByTitle(title: string, config: RetryOptions): Promise<WebElement> {
    const limit = 10;

    try {
      for (let i = 0; i < limit; i++) {
        // 1. Obtenemos el contenedor padre (La fila)
        // Usamos supressRetry porque es una búsqueda iterativa, no queremos esperar 30s por cada fila que no sea la correcta.
        const rowElement = await this.getPostContainerByIndex(i, { ...config, timeoutMs: 1000, supressRetry: true })
          .catch(() => null); // Si no existe la fila i, continuamos o paramos

        if (!rowElement) continue;

        // 2. Búsqueda Escalonada:
        // Esto es mucho más rápido y seguro contra IDs duplicados en otras tablas.
        const titleElement = await rowElement.findElement(this.postTitleInputLocator);
        const currentTitle = await titleElement.getText();

        if (currentTitle.includes(title)) {
          logger.debug(`Nota encontrada en índice ${i}: "${currentTitle}"`, { label: config.label });
          return rowElement;
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
  async changePostTitleToStandard(postContainer: WebElement, config: RetryOptions): Promise<void> {
    try {
      // 1. Buscamos el elemento título DENTRO del contenedor que nos pasaron
      const titleLabel = await postContainer.findElement(this.postTitleInputLocator);
      const currentTitle = await titleLabel.getText();

      const newTitle = currentTitle.replace("BlueStack_Test_Automation Framework", "BTAF Inline");

      await writeSafe(this.driver, titleLabel, newTitle, config);

    } catch (error) {
      throw new Error(`Fallo al cambiar título: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clickea el botón de editar de una fila específica.
   */
  async clickEditorButton(postContainer: WebElement, config: RetryOptions): Promise<void> {
    try {
      // 1. Buscamos el botón ÚNICAMENTE dentro de esta fila
      const btnElement = await postContainer.findElement(this.postEditBtnLocator);

      // 2. Click seguro pasando el Elemento directo.
      await clickSafe(this.driver, btnElement, config);

    } catch (error) {
      throw new Error(`Fallo al clickear botón editar en la fila: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}