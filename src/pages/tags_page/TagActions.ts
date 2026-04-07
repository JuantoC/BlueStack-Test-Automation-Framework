import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { hoverOverParentContainer } from "../../core/helpers/hoverOverParentContainer.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

export type TagActionType = keyof typeof TagActions.ACTION_TYPE_MAP;

/**
 * Page Object que encapsula las acciones del menú desplegable (3 puntitos) de un tag en la tabla.
 * Gestiona la apertura del menú mediante hover y click, y la selección de la acción
 * correcta comparando el texto visible contra el mapa `ACTION_TYPE_MAP`.
 * Consumido por `MainTagsPage.clickOnTagAction` como paso de interacción sobre una fila.
 *
 * @example
 * const actions = new TagActions(driver, opts);
 * await actions.clickOnAction(tagContainer, 'EDIT');
 */
export class TagActions {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  public static readonly ACTION_TYPE_MAP = {
    PREVIEW: new Set(['Previsualizar']),
    DELETE: new Set(['Eliminar']),
    EDIT: new Set(['Editar']),
    DISAPPROVE: new Set(['Desaprobar']),
    APPROVE: new Set(['Aprobar']),
  } as const;

  private static readonly DROPDOWN_BTN: Locator = By.css('button#dropdownBasic1.dropdown-toggle');
  private static readonly ACTION_ITEMS: Locator = By.css('button.dropdown-item');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "TagActions");
  }

  /**
   * Abre el menú desplegable de acciones del tag y hace click en la opción indicada.
   * Realiza hover sobre el botón del dropdown para activar su visibilidad, abre el menú
   * si no está expandido, y localiza la acción correcta mediante `findAction`.
   *
   * @param tagContainer - WebElement del contenedor de acciones (`div#N-dropMenu`) del tag.
   * @param action - Tipo de acción a ejecutar (PREVIEW, DELETE, EDIT, DISAPPROVE, APPROVE).
   */
  async clickOnAction(tagContainer: WebElement, action: TagActionType): Promise<void> {
    try {
      logger.debug(`Buscando el botón de "${action}" dentro del tag...`, { label: this.config.label });
      const dropdownBtn = await tagContainer.findElement(TagActions.DROPDOWN_BTN);

      await hoverOverParentContainer(this.driver, dropdownBtn, this.config);

      if (!await this.isMenuOpen(dropdownBtn)) {
        logger.debug(`El menú no está abierto. Abriendo para ejecutar "${action}"...`, { label: this.config.label });
        await clickSafe(this.driver, dropdownBtn, this.config);
      }

      const actionBtn = await this.findAction(tagContainer, action);
      logger.debug(`Botón de "${action}" encontrado. Clickeando...`, { label: this.config.label });
      await clickSafe(this.driver, actionBtn, this.config);
    } catch (error: unknown) {
      logger.error(`Fallo al ejecutar acción "${action}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw new Error(`Fallo al ejecutar acción "${action}": ${getErrorMessage(error)}`);
    }
  }

  private async findAction(tagContainer: WebElement, action: TagActionType): Promise<WebElement> {
    try {
      const items = await tagContainer.findElements(TagActions.ACTION_ITEMS);
      for (const item of items) {
        const text = await item.getText();
        for (const label of TagActions.ACTION_TYPE_MAP[action]) {
          if (text.trim().includes(label)) {
            return item;
          }
        }
      }
      throw new Error(`No se encontró la acción "${action}" en el menú.`);
    } catch (error: unknown) {
      logger.error(`Error en findAction: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  private async isMenuOpen(dropdownBtn: WebElement): Promise<boolean> {
    try {
      const ariaExpanded = await dropdownBtn.getAttribute('aria-expanded');
      return ariaExpanded === 'true';
    } catch (error: unknown) {
      logger.error(`Error en isMenuOpen: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
