import { By, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../core/config/defaultConfig.js";
import logger from "../core/utils/logger.js";
import { waitFind } from "../core/actions/waitFind.js";
import { clickSafe } from "../core/actions/clickSafe.js";
import { PublishModal } from "./modals/PublishModal.js";
import { getErrorMessage } from "../core/utils/errorUtils.js";

export type FooterActionType = keyof typeof FooterActions.FOOTER_ACTIONS;

/**
 * Sub-componente compartido que representa el área de acciones del footer en las tablas del CMS.
 * Expone acciones de publicación masiva (publicar inmediato y programar) disponibles al seleccionar
 * uno o más ítems en la tabla. Orquesta la interacción con `PublishModal` y el toast monitor CDP.
 * Utilizado como dependencia de todos los Maestros que gestionan contenido publicable.
 *
 * @example
 * const footer = new FooterActions(driver, opts);
 * await footer.clickFooterAction('PUBLISH_ONLY');
 */
export class FooterActions {
  private readonly config: RetryOptions;
  private readonly publishModal: PublishModal;

  private static readonly FOOTER_PUBLISH_BTN = By.css('div.cmsmedios-table-content button[data-testid="btn-tablepublishtext"]');
  private static readonly FOOTER_DROPDOWN_BTN = By.css('div.cmsmedios-table-content button[data-testid="dropdown-toggle-tablepublishtext"]');
  private static readonly FOOTER_DROPDOWN_SCHEDULE = By.css('div[data-testid="dropdown-item-programar"]');
  private static readonly FOOTER_DROPDOWN_PUBLISH = By.css('div[data-testid="dropdown-item-publicar"]');
  private static readonly FOOTER_DROPDOWN_EXPORT = By.css('div[data-testid="dropdown-item-exportar"]');

  // ========== LOCATORS ( Readonly) ==========
  public static readonly FOOTER_ACTIONS = {
    PUBLISH_ONLY: FooterActions.FOOTER_PUBLISH_BTN,
    SCHEDULE: FooterActions.FOOTER_DROPDOWN_BTN,
    PUBLICAR: FooterActions.FOOTER_DROPDOWN_BTN,
    EXPORT: FooterActions.FOOTER_DROPDOWN_BTN
  }

  constructor(private readonly driver: WebDriver, opts: RetryOptions) {
    this.config = resolveRetryConfig(opts, "FooterActions")

    this.publishModal = new PublishModal(this.driver, this.config)
  }

  /**
   * Ejecuta la acción del footer indicada sobre los ítems previamente seleccionados en la tabla.
   * Valida primero que el botón de publicar esté habilitado y que la acción esté mapeada.
   * Luego orquesta la secuencia específica según el tipo: publicación inmediata o programación.
   * Delega la confirmación en `PublishModal` y la validación de resultado en el toast monitor CDP.
   *
   * @param action - Tipo de acción del footer a ejecutar (PUBLISH_ONLY o SCHEDULE).
   */
  async clickFooterAction(action: FooterActionType): Promise<void> {
    const isEnabled = await this.isPublishBtnEnabled()
    if (!isEnabled) {
      logger.error('Acciones del footer se encuentran deshabilitadas para interactuar con ellas...', { label: this.config.label })
      throw new Error(`Botones del footer deshabilitados: ${action}`);
    }

    const initialLocator = FooterActions.FOOTER_ACTIONS[action];
    if (!initialLocator) {
      logger.error(`La acción del footer no se encuentra mapeada en la clase: ${action}`, { label: this.config.label })
      throw new Error(`Acción del footer no mapeada en el componente: ${action}`);
    }

    try {
      logger.debug('Iniciando secuencia de acciones en el footer...', { label: this.config.label });
      await clickSafe(this.driver, initialLocator, { ...this.config, initialDelayMs: 10000 });

      switch (action) {
        case 'PUBLISH_ONLY':
          await this.publishModal.clickOnPublishBtn();
          await global.activeToastMonitor?.waitForSuccess(10000);
          break;
        case 'SCHEDULE':
          await clickSafe(this.driver, FooterActions.FOOTER_DROPDOWN_SCHEDULE, this.config);
          await this.publishModal.clickOnPublishBtn();
          await global.activeToastMonitor?.waitForSuccess(10000);
          break;
        case 'PUBLICAR':
          await clickSafe(this.driver, FooterActions.FOOTER_DROPDOWN_PUBLISH, this.config);
          await this.publishModal.clickOnPublishBtn();
          await global.activeToastMonitor?.waitForSuccess(10000);
          break;
        case 'EXPORT':
          await clickSafe(this.driver, FooterActions.FOOTER_DROPDOWN_EXPORT, this.config);
          break;

      }
    } catch (error: unknown) {
      logger.error(`Error realizando accion en el footer: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) })
      throw error;
    }
  }

  /**
   * Verifica si el botón de publicar en el footer está habilitado para interacción.
   * Consulta el atributo `disabled` del elemento: si es `null` el botón está activo.
   * Utilizado como guardia antes de ejecutar cualquier acción del footer.
   *
   * @returns {Promise<boolean>} `true` si el botón está habilitado, `false` si está deshabilitado.
   */
  async isPublishBtnEnabled(): Promise<boolean> {
    try {
      logger.debug('Revisisando que el boton de publicar en el footer se encuentre habilitado...', { label: this.config.label })
      const publishBtn = await waitFind(this.driver, FooterActions.FOOTER_PUBLISH_BTN, this.config);
      const isEnabled = await publishBtn.getAttribute('disabled');
      return isEnabled === null;
    } catch (error: unknown) {
      logger.error(`Error revisando el btn de publicar: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) })
      throw error;
    }
  }
}