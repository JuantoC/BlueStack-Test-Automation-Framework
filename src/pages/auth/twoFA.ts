import { By, Locator, WebDriver } from 'selenium-webdriver';
import { RetryOptions, DefaultConfig } from "../../core/config/default.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";

/**
 * Componente para gestionar el modal de Doble Autenticación (2FA).
 * En este flujo actual, se encarga de descartar el modal para continuar.
 */
export class TwoFAFields {
  private readonly twoFAModalDismissButton: Locator = By.css('[data-testid="btn-next"]');
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  /**
   * Omite el modal de 2FA haciendo clic en el botón de continuar/descartar.
   * @param opts - Opciones de reintento y trazabilidad (incluye timeoutMs).
   */
  async passTwoFA(opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "passTwoFA")
    };

    try {
      logger.debug('Intentando omitir el modal de 2FA ("I will do it later")', {
        label: config.label
      });

      // Delegamos en clickSafe la espera, el scroll y el reintento.
      await clickSafe(this.driver, this.twoFAModalDismissButton, config);

      logger.info("Modal de 2FA gestionado correctamente", {
        label: config.label
      });

    } catch (error: any) {
      // Si falla aquí, clickSafe ya habrá emitido un warn/error detallado.
      // Solo propagamos para que el orquestador decida si el login es fallido.
      throw error;
    }
  }
}