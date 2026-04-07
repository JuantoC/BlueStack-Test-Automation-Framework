import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { retry } from "../../core/wrappers/retry.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import logger from "../../core/utils/logger.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object que representa la tabla de tags del CMS.
 * Centraliza las operaciones sobre las filas de la tabla: búsqueda por índice,
 * selección de tags y espera de nuevos registros post-creación.
 * Usado por `MainTagsPage` como capa de acceso a los datos tabulares.
 *
 * @example
 * const table = new TagTable(driver, opts);
 * const container = await table.getTagContainerByIndex(0);
 * await table.selectTagByIndex(0);
 */
export class TagTable {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly TAG_TABLE: Locator = By.css('div#tags-table-body');
  private static readonly CHECKBOXES_IN_TABLE: Locator = By.css('div#tags-table-body mat-checkbox.checkbox');
  /**
   * FRAGILE: el elemento con el texto del tag no tiene un identificador estable en el DOM capturado.
   * Verificar y reemplazar este selector en runtime inspeccionando el DOM de la fila.
   */
  private static readonly TAG_TITLE_IN_ROW: Locator = By.css('[data-testid="TODO_tag_title_text"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "TagTable");
  }

  /**
   * Retorna el WebElement del contenedor de acciones (`div#N-dropMenu`) de un tag por su índice.
   * Este contenedor es el punto de referencia para operar sobre la fila con `TagActions`.
   *
   * @param index - Posición del tag en la tabla (base 0).
   * @returns {Promise<WebElement>} El contenedor de acciones de la fila en el índice dado.
   */
  async getTagContainerByIndex(index: number): Promise<WebElement> {
    try {
      const rowLocator = By.css(`div[id="${index}-dropMenu"]`);
      logger.debug(`Buscando contenedor de tag en índice ${index}`, { label: this.config.label });
      return await waitFind(this.driver, rowLocator, { ...this.config, supressRetry: true });
    } catch (error: unknown) {
      logger.error(`Error al obtener el contenedor del tag en índice ${index}: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Busca en los primeros 10 tags hasta encontrar el que contiene el texto indicado.
   * Retorna el WebElement del contenedor de acciones (`div#N-dropMenu`) del tag encontrado.
   * ⚠️ Requiere que `TAG_TITLE_IN_ROW` esté correctamente configurado con el selector real.
   *
   * @param title - Fragmento de texto del nombre del tag a buscar.
   * @returns {Promise<WebElement>} El contenedor de acciones del tag encontrado.
   */
  async getTagContainerByTitle(title: string): Promise<WebElement> {
    const limit = 10;
    if (!title || title.trim() === "") {
      throw new Error("El título no puede estar vacío para buscar el contenedor del tag.");
    }
    try {
      await this.waitUntilTableIsReady();

      return await retry(async () => {
        for (let i = 0; i < limit; i++) {
          const container = await this.getTagContainerByIndex(i).catch(() => null);
          if (!container) continue;

          const titleElements = await container.findElements(TagTable.TAG_TITLE_IN_ROW);
          if (titleElements.length === 0) continue;

          const currentTitle = await titleElements[0].getText();
          if (currentTitle.includes(title)) {
            logger.debug(`Tag encontrado en índice ${i}: "${currentTitle}"`, { label: this.config.label });
            return container;
          }
        }
        throw new Error(`No se encontró el tag con título parcial "${title}" tras escanear ${limit} filas.`);
      }, { ...this.config, retries: 2 });
    } catch (error: unknown) {
      logger.error(`Error en búsqueda de tag por título: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Selecciona un tag en la tabla haciendo click sobre su checkbox en el índice indicado.
   * Verifica que el checkbox no esté ya seleccionado antes de clickear para evitar deselecciones.
   *
   * @param index - Índice del tag a seleccionar en la tabla (base 0).
   */
  async selectTagByIndex(index: number): Promise<void> {
    try {
      await this.waitUntilTableIsReady();
      const checkboxes = await this.driver.findElements(TagTable.CHECKBOXES_IN_TABLE);

      if (index >= checkboxes.length) {
        throw new Error(`No existe checkbox en el índice ${index}. Total encontrados: ${checkboxes.length}`);
      }

      const checkbox = checkboxes[index];
      const classes = await checkbox.getAttribute('class');

      if (classes && classes.includes('mat-mdc-checkbox-checked')) {
        logger.debug(`El tag en índice ${index} ya está seleccionado.`, { label: this.config.label });
        return;
      }

      logger.debug(`Seleccionando tag en índice ${index}...`, { label: this.config.label });
      await clickSafe(this.driver, checkbox, this.config);
    } catch (error: unknown) {
      logger.error(`Error al seleccionar el tag en índice ${index}: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Espera a que un nuevo tag recién creado aparezca en la primera posición de la tabla.
   * ⚠️ Requiere que `TAG_TITLE_IN_ROW` esté correctamente configurado con el selector real.
   *
   * @param expectedTitle - Fragmento del nombre del tag que debe aparecer en la primera fila.
   * @param timeoutMs - Tiempo máximo de espera en milisegundos. Por defecto 15000ms.
   */
  async waitForNewTagAtIndex0(expectedTitle: string, timeoutMs = 15000): Promise<void> {
    try {
      logger.debug(`Esperando que el nuevo tag "${expectedTitle}" aparezca en índice 0.`, { label: this.config.label });

      await this.driver.wait(async () => {
        try {
          const container = await this.getTagContainerByIndex(0);
          const titleElements = await container.findElements(TagTable.TAG_TITLE_IN_ROW);
          if (titleElements.length === 0) return false;
          const text = await titleElements[0].getText();
          return text.includes(expectedTitle);
        } catch {
          return false;
        }
      }, timeoutMs, `Timeout: el tag "${expectedTitle}" no apareció en índice 0.`);

      logger.debug(`Tag "${expectedTitle}" detectado en índice 0.`, { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error en waitForNewTagAtIndex0: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  // =========================================================================
  //                    HELPERS
  // =========================================================================

  private async waitUntilTableIsReady(): Promise<void> {
    const element = await waitFind(this.driver, TagTable.TAG_TABLE, this.config);
    await waitEnabled(this.driver, element, this.config);
    await waitVisible(this.driver, element, this.config);
  }
}
