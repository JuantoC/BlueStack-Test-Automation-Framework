import { By, Locator, WebDriver } from 'selenium-webdriver';
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";

/**
 * Componente para gestionar la pagina de Doble Autenticación (2FA).
 * En este flujo actual, se encarga de descartar el modal para continuar.
 */
export class TwoFASection {
  private readonly TWOFA_DISMISS_BTN: Locator = By.css('[data-testid="btn-next"]');
  private driver: WebDriver;
  private config: RetryOptions

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "TwoFASection") }
  }

  /**
   * Omite el modal de 2FA haciendo clic en el botón de continuar/descartar.
   * @param opts - Opciones de reintento y trazabilidad (incluye timeoutMs).
   */
  async passTwoFA(): Promise<void> {
    try {
      logger.debug('Intentando omitir pagina de 2FA (con btn "I will do it later")', {
        label: this.config.label
      });

      // Delegamos en clickSafe la espera, el scroll y el reintento.
      await clickSafe(this.driver, this.TWOFA_DISMISS_BTN, this.config);

      logger.debug("Modal de 2FA gestionado correctamente", {
        label: this.config.label
      });

    } catch (error: any) {
      throw error;
    }
  }
}