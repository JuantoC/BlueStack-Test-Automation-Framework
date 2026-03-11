import { Locator, By, WebDriver } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
import { step } from "allure-js-commons";

/**
 * Maneja el panel lateral de configuración de la nota (Settings).
 * Incluye la gestión de secciones y metadatos laterales.
 */
export class EditorLateralSettings {
  private driver: WebDriver;
  private config: RetryOptions;

  // ========== LOCATORS ==========
  private readonly SETTINGS_TOGGLE_BTN: Locator = By.css("a.btn-toggle button.btn-dropdown");
  private readonly SECTION_COMBO: Locator = By.css('mat-select[data-testid="section-options"]');
  private readonly FIRST_SECTION_OPT: Locator = By.css("div[role='listbox'] mat-option:first-of-type");

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorLateralSettings") }
  }

  // ========== MÉTODOS ==========

  /**
   * Abre o cierra el panel lateral de configuraciones.
   */
  async toggleSettingsPanel(): Promise<void> {
    logger.debug("Cambiando estado del panel lateral de configuración", { label: this.config.label });
    await clickSafe(this.driver, this.SETTINGS_TOGGLE_BTN, this.config);
  }

  /**
   * Orquestador de componente: Abre el selector de secciones y selecciona la primera disponible.
   */
  async selectFirstSectionOption(): Promise<void> {
    await step("Seleccionar primera sección de Settings", async () => {
      try {
        logger.debug("Abriendo combo de selección de secciones", { label: this.config.label });
        await clickSafe(this.driver, this.SECTION_COMBO, this.config);

        logger.debug("Seleccionando la primera opción del listbox", { label: this.config.label });
        await clickSafe(this.driver, this.FIRST_SECTION_OPT, this.config);

        logger.debug("Sección seleccionada exitosamente (primera de la lista)", { label: this.config.label });
      } catch (error) {
        throw error;
      }
    });
  }
}
