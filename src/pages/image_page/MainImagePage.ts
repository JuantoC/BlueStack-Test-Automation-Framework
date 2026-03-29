import { By, Key, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";

/**
 * Page Object Maestro para la sección de Imágenes del CMS.
 * Punto de entrada para flujos futuros de pruebas sobre la galería de imágenes.
 * Actualmente en construcción; la arquitectura sigue el patrón Facade de la capa `src/pages/`.
 */
export class MainImagePage {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "VideoTable") }
  }
}