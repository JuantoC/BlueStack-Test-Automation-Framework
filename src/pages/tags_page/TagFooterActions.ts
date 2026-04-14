import { By, Locator, WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

export type TagFooterActionType = keyof typeof TagFooterActions.FOOTER_ACTIONS;

/**
 * Page Object que representa el área de acciones masivas del footer en la tabla de tags.
 * Expone las acciones de aprobación (`APPROVE`), desaprobación (`DISAPPROVE`) y eliminación
 * (`DELETE`) disponibles al seleccionar uno o más tags en la tabla.
 * Verifica que el footer esté habilitado antes de ejecutar cualquier acción.
 * Utilizado por `MainTagsPage.selectAndExecuteFooterAction`.
 *
 * @example
 * const footer = new TagFooterActions(driver, opts);
 * await footer.clickFooterAction('APPROVE');
 */
export class TagFooterActions {
  private readonly config: RetryOptions;

  private static readonly APPROVE_BTN: Locator = By.css('button[data-testid="dropdown-action"]');
  private static readonly DISAPPROVE_DROPDOWN_TOGGLE: Locator = By.css('button[data-testid="dropdown-actions"]');
  private static readonly DISAPPROVE_ITEM: Locator = By.css('div[id="option-dropdown-1"][data-testid="dropdown-item"]');
  private static readonly DELETE_BTN: Locator = By.css('button#deleteIcon');

  public static readonly FOOTER_ACTIONS = {
    APPROVE: TagFooterActions.APPROVE_BTN,
    DISAPPROVE: TagFooterActions.DISAPPROVE_DROPDOWN_TOGGLE,
    DELETE: TagFooterActions.DELETE_BTN,
  } as const;

  constructor(private readonly driver: WebDriver, opts: RetryOptions) {
    this.config = resolveRetryConfig(opts, "TagFooterActions");
  }

  /**
   * Ejecuta la acción del footer indicada sobre los tags previamente seleccionados en la tabla.
   * Valida primero que el footer esté habilitado (al menos un tag seleccionado).
   * Para DISAPPROVE abre el dropdown secundario antes de clickear la opción.
   *
   * @param action - Tipo de acción del footer a ejecutar (APPROVE, DISAPPROVE o DELETE).
   */
  async clickFooterAction(action: TagFooterActionType): Promise<void> {
    const isEnabled = await this.isFooterEnabled();
    if (!isEnabled) {
      throw new Error(`El footer de acciones está deshabilitado. Verificar que haya tags seleccionados antes de ejecutar "${action}".`);
    }

    try {
      logger.debug(`Ejecutando acción de footer: "${action}"`, { label: this.config.label });

      switch (action) {
        case 'APPROVE':
          await clickSafe(this.driver, TagFooterActions.APPROVE_BTN, this.config);
          await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
          break;

        case 'DISAPPROVE':
          await clickSafe(this.driver, TagFooterActions.DISAPPROVE_DROPDOWN_TOGGLE, this.config);
          await clickSafe(this.driver, TagFooterActions.DISAPPROVE_ITEM, this.config);
          await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
          break;

        case 'DELETE':
          await clickSafe(this.driver, TagFooterActions.DELETE_BTN, this.config);
          await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
          break;
      }

      logger.debug(`Acción de footer "${action}" ejecutada.`, { label: this.config.label });
    } catch (error: unknown) {
      logger.error(`Error ejecutando acción de footer "${action}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Verifica si el botón principal de acción del footer está habilitado.
   * Consulta el atributo `disabled` del elemento: si es `null` el botón está activo.
   * El footer se habilita automáticamente cuando hay al menos un tag seleccionado.
   *
   * @returns {Promise<boolean>} `true` si el footer está habilitado, `false` si está deshabilitado.
   */
  async isFooterEnabled(): Promise<boolean> {
    try {
      logger.debug('Verificando si el footer de acciones está habilitado...', { label: this.config.label });
      const approveBtn = await waitFind(this.driver, TagFooterActions.APPROVE_BTN, this.config);
      const disabled = await approveBtn.getAttribute('disabled');
      return disabled === null;
    } catch (error: unknown) {
      logger.error(`El footer se encuentra deshabilitado: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
