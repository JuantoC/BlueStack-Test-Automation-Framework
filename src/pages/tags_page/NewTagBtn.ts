import { By, Locator, WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object que representa el botón "Nuevo Tag" ubicado en la barra lateral del CMS.
 * Encapsula la lógica de espera y click para abrir el modal de creación de tags.
 * Utilizado por `MainTagsPage` como primer paso del flujo de creación de un tag.
 *
 * @example
 * const btn = new NewTagBtn(driver, opts);
 * await btn.clickNewTag();
 */
export class NewTagBtn {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly NEW_TAG_BTN: Locator = By.css('button.btn-create-note');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "NewTagBtn");
  }

  /**
   * Hace click sobre el botón "Nuevo Tag" del sidebar para abrir el modal de creación.
   * La espera e interacción son gestionadas internamente por `clickSafe`.
   */
  async clickNewTag(): Promise<void> {
    try {
      logger.debug('Clickeando en "Nuevo Tag"...', { label: this.config.label });
      await clickSafe(this.driver, NewTagBtn.NEW_TAG_BTN, this.config);
      logger.debug('Click en "Nuevo Tag" ejecutado.', { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error al clickear "Nuevo Tag": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
