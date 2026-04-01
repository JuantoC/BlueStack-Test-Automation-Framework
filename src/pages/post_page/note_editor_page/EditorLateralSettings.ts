import { Locator, By, WebDriver, WebElement } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
import { step } from "allure-js-commons";
import { waitFind } from "../../../core/actions/waitFind.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

/**
 * Maneja el panel lateral de configuración de la nota (Settings).
 * Incluye la gestión de secciones y metadatos laterales.
 */
export class EditorLateralSettings {
  private driver: WebDriver;
  private config: RetryOptions;

  // ========== LOCATORS ==========
  private static readonly SETTINGS_TOGGLE_BTN: Locator = By.css("a.btn-toggle button.btn-dropdown");
  private static readonly SECTION_COMBO: Locator = By.css('div#general-card mat-select[data-testid="section-options"]');
  private static readonly SECTION_OPT: Locator = By.css("div[role='listbox'] mat-option[role='option']");

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "EditorLateralSettings")
  }

  // ========== MÉTODOS ==========

  /**
   * Abre el combo de secciones y selecciona la opción en el índice indicado.
   * Si el dropdown ya está abierto, omite el click de apertura. Luego localiza
   * la opción por índice mediante `matchSectionOption` y hace click sobre ella.
   *
   * @param index - Índice de la opción de sección a seleccionar (base 0). Por defecto 0.
   */
  async selectSectionOption(index: number = 0): Promise<void> {
    await step(`Seleccionando opción de sección en index ${index}`, async () => {
      try {
        await this.clickOnSectionOption();
        const elementToClick = await this.matchSectionOption(index);

        logger.debug(`Intentando hacer click en la opción "${index}"...`, { label: this.config.label });
        await clickSafe(this.driver, elementToClick, this.config);
      } catch (error: unknown) {
        logger.error(`Error en selectSectionOption con index ${index}: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Retorna el WebElement de la opción de sección en la posición indicada del listbox activo.
   *
   * @param index - Posición de la opción en la lista desplegada (base 0).
   * @returns {Promise<WebElement>} El WebElement de la opción a clickear.
   */
  async matchSectionOption(index: number): Promise<WebElement> {
    try {
      const elements = await this.driver.findElements(EditorLateralSettings.SECTION_OPT);
      if (elements.length === 0) {
        throw new Error(`No se encontro ningun elemento en el selector: ${EditorLateralSettings.SECTION_OPT}`);
      }
      return elements[index];
    } catch (error: unknown) {
      throw new Error(`No se encontró la opción "${index}" en el menú.`);
    }

  }

  /**
   * Abre el combo de secciones si aún no está expandido.
   * Verifica el atributo `aria-expanded` del elemento antes de hacer click.
   */
  async clickOnSectionOption(): Promise<void> {
    const isVisible = await this.isDropdownVisible();

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de secciones...", { label: this.config.label });
      await clickSafe(this.driver, EditorLateralSettings.SECTION_COMBO, this.config);
    } else {
      logger.debug("El dropdown de secciones ya estaba abierto.", { label: this.config.label });
    }
  }

  /**
   * Verifica si el combo de secciones está actualmente expandido consultando `aria-expanded`.
   *
   * @returns {Promise<boolean>} `true` si el dropdown está abierto, `false` si está cerrado.
   */
  async isDropdownVisible(): Promise<boolean> {
    const element = await waitFind(this.driver, EditorLateralSettings.SECTION_COMBO, this.config);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }

  /**
   * Abre o cierra el panel lateral de configuraciones.
   */
  async toggleSettingsPanel(): Promise<void> {
    await step("Cambiando estado del panel lateral de configuración", async (stepContext) => {
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        logger.debug("Cambiando estado del panel lateral de configuración", { label: this.config.label });
        await clickSafe(this.driver, EditorLateralSettings.SETTINGS_TOGGLE_BTN, this.config);
      } catch (error: unknown) {
        logger.error(`Error en toggleSettingsPanel: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }
}
