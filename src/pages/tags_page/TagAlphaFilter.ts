import { By, Locator, WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { writeSafe } from "../../core/actions/writeSafe.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object que encapsula el filtro alfabético y el campo de búsqueda de la tabla de tags.
 * Permite filtrar tags por la letra inicial usando los botones A-Z del header de la tabla,
 * y buscar por texto libre usando el input de búsqueda.
 * Consumido por `MainTagsPage` como componente de navegación de la tabla.
 *
 * @example
 * const filter = new TagAlphaFilter(driver, opts);
 * await filter.filterByLetter('A');
 * await filter.searchByText('gaming');
 */
export class TagAlphaFilter {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly SEARCH_INPUT: Locator = By.css('input#smallSearching[data-testid="input-search-simple"]');
  private static readonly ALPHA_BUTTONS: Locator = By.css('div#table-header button.filter-abc');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "TagAlphaFilter");
  }

  /**
   * Hace click en el botón del filtro alfabético correspondiente a la letra indicada.
   * Itera sobre todos los botones `.filter-abc` y hace click en el que coincide con el texto.
   *
   * @param letter - Letra del filtro a activar. Valores válidos: A-Z, Ñ, 123#, * (según el DOM).
   */
  async filterByLetter(letter: string): Promise<void> {
    try {
      logger.debug(`Aplicando filtro alfabético: "${letter}"`, { label: this.config.label });
      const buttons = await this.driver.findElements(TagAlphaFilter.ALPHA_BUTTONS);

      for (const btn of buttons) {
        const text = await btn.getText();
        if (text.trim() === letter.trim()) {
          await clickSafe(this.driver, btn, this.config);
          logger.debug(`Filtro "${letter}" activado.`, { label: this.config.label });
          return;
        }
      }
      throw new Error(`No se encontró el botón de filtro para: "${letter}"`);
    } catch (error: unknown) {
      logger.error(`Error al filtrar por letra "${letter}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Escribe el texto indicado en el campo de búsqueda de la tabla de tags.
   * La espera, limpieza e interacción son gestionadas internamente por `writeSafe`.
   *
   * @param text - Texto a buscar en la tabla de tags.
   */
  async searchByText(text: string): Promise<void> {
    try {
      logger.debug(`Buscando tag por texto: "${text}"`, { label: this.config.label });
      await writeSafe(this.driver, TagAlphaFilter.SEARCH_INPUT, text, this.config);
      logger.debug(`Búsqueda "${text}" ejecutada.`, { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error al buscar por texto "${text}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
