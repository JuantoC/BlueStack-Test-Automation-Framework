import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { hoverOverParentContainer } from "../../core/helpers/hoverOverParentContainer.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

export type ActionType = keyof typeof VideoInlineActions.ACTION_TYPE_MAP;
export type InlineActionType = keyof typeof VideoInlineActions.INLINE_ACTION_TYPE_MAP;

/**
 * Page Object que centraliza todas las acciones ejecutables sobre un video individual.
 * Cubre dos mecanismos de UI presentes en la tabla multimedia:
 *
 * - **Dropdown por hover** (`clickOnAction`): menú clásico activado mediante hover + toggle.
 *   Acciones disponibles: EDIT, DELETE, UNPUBLISH.
 *
 * - **Menú kebab — 3 puntos** (`clickOnKebabAction`): menú inline directamente visible en la
 *   card del video, sin necesidad de hover previo.
 *   Acciones disponibles: EDIT, DELETE, UNPUBLISH, SCHEDULE, PREVIEW.
 *
 * @remarks
 * DELETE y UNPUBLISH son mutuamente excluyentes según el estado del video:
 * - Un video **publicado** expone UNPUBLISH (no DELETE).
 * - Un video **no publicado** expone DELETE (no UNPUBLISH).
 *
 * Consumido por `MainVideoPage` como componente de interacción con las acciones de video.
 *
 * @example
 * const actions = new VideoInlineActions(driver, opts);
 * await actions.clickOnAction(videoContainer, 'EDIT');
 * await actions.clickOnKebabAction(videoContainer, 'SCHEDULE');
 */
export class VideoInlineActions {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  // =========================================================================
  //   HOVER DROPDOWN — mecanismo legacy
  // =========================================================================

  /**
   * Mapa de tipos de acción a sus etiquetas multilinguales para el dropdown por hover.
   * Las opciones DELETE y UNPUBLISH son mutuamente excluyentes por estado del video.
   */
  public static readonly ACTION_TYPE_MAP = {
    EDIT: new Set(['Edit', 'Editar']),
    DELETE: new Set(['Eliminar', 'Remove']),
    UNPUBLISH: new Set(['Unpublish', 'Despublicar']),
  } as const;

  private static readonly DROPDOWN_BTN: Locator = By.css('div#-dropMenu button.dropdown-toggle');
  private static readonly LABELS_OF_ACTIONS: Locator = By.css('div#-dropMenu button.dropdown-item');

  // =========================================================================
  //   MENÚ KEBAB — 3 PUNTOS (mecanismo actual)
  // =========================================================================

  /**
   * Mapa de tipos de acción a sus etiquetas multilinguales para el menú kebab de 3 puntos.
   * Incluye SCHEDULE y PREVIEW adicionales respecto al dropdown legacy.
   */
  public static readonly INLINE_ACTION_TYPE_MAP = {
    EDIT: new Set(['Edit', 'Editar']),
    DELETE: new Set(['Eliminar', 'Remove']),
    UNPUBLISH: new Set(['Unpublish', 'Despublicar']),
    SCHEDULE: new Set(['Schedule', 'Programar']),
    PREVIEW: new Set(['Preview', 'Vista previa', 'Previsualizar']),
  } as const;

  private static readonly KEBAB_BTN: Locator = By.css('[data-testid="TODO_kebab_btn"]');
  private static readonly KEBAB_MENU_ITEMS: Locator = By.css('[data-testid="TODO_kebab_menu_item"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "VideoInlineActions");
  }

  // =========================================================================
  //   MÉTODOS PÚBLICOS
  // =========================================================================

  /**
   * Abre el dropdown de acciones del video mediante hover y ejecuta la acción indicada.
   * Realiza hover sobre el botón toggle para activar su visibilidad, abre el menú si no
   * está expandido, y localiza la opción correcta mediante `ACTION_TYPE_MAP`.
   *
   * @param videoContainer - Contenedor WebElement del video sobre el que se ejecuta la acción.
   * @param action - Acción a ejecutar: EDIT, DELETE o UNPUBLISH.
   * @throws Error si el dropdown no se abre o la acción no se encuentra en el menú.
   */
  /**
   * Hace hover sobre el botón toggle del dropdown de acciones del video para activar su visibilidad.
   * Acción atómica — solo ejecuta el hover, no abre el dropdown.
   *
   * @param videoContainer - Contenedor WebElement del video.
   */
  async hoverActionDropdownToggle(videoContainer: WebElement): Promise<void> {
    try {
      const dropdownBtn = await videoContainer.findElement(VideoInlineActions.DROPDOWN_BTN);
      await hoverOverParentContainer(this.driver, dropdownBtn, this.config);
    } catch (error: unknown) {
      logger.error(`Error en hoverActionDropdownToggle: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Abre el dropdown de acciones del video si no está ya expandido.
   * Acción atómica — solo ejecuta el click de apertura, no hace hover previo.
   *
   * @param videoContainer - Contenedor WebElement del video.
   */
  async openActionDropdown(videoContainer: WebElement): Promise<void> {
    try {
      const dropdownBtn = await videoContainer.findElement(VideoInlineActions.DROPDOWN_BTN);
      if (!await this.isDropdownOpen(dropdownBtn)) {
        logger.debug(`Dropdown cerrado. Abriendo...`, { label: this.config.label });
        await clickSafe(this.driver, dropdownBtn, this.config);
      }
    } catch (error: unknown) {
      logger.error(`Error en openActionDropdown: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Hace click sobre el ítem de acción dentro del dropdown ya abierto.
   * Acción atómica — asume que el dropdown está abierto; no lo abre ni hace hover.
   *
   * @param videoContainer - Contenedor WebElement del video.
   * @param action - Acción a ejecutar: EDIT, DELETE o UNPUBLISH.
   */
  async clickDropdownAction(videoContainer: WebElement, action: ActionType): Promise<void> {
    try {
      const actionBtn = await this.findDropdownAction(videoContainer, action);
      logger.debug(`Botón "${action}" encontrado. Clickeando...`, { label: this.config.label });
      await clickSafe(this.driver, actionBtn, this.config);
    } catch (error: unknown) {
      logger.error(`Error en clickDropdownAction para "${action}": ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Abre el menú kebab (3 puntos) del video si no está ya visible.
   * Acción atómica — solo ejecuta el click de apertura.
   *
   * @param videoContainer - Contenedor WebElement del video.
   */
  async openKebabMenu(videoContainer: WebElement): Promise<void> {
    try {
      const kebabBtn = await videoContainer.findElement(VideoInlineActions.KEBAB_BTN);
      if (!await this.isKebabMenuOpen(videoContainer)) {
        await clickSafe(this.driver, kebabBtn, this.config);
        logger.debug('Menú kebab abierto.', { label: this.config.label });
      }
    } catch (error: unknown) {
      logger.error(`Error en openKebabMenu: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Hace click sobre un ítem específico dentro del menú kebab ya abierto.
   * Acción atómica — asume que el menú está abierto; no lo abre.
   *
   * @param videoContainer - Contenedor WebElement del video.
   * @param action - Acción a ejecutar: EDIT, DELETE, UNPUBLISH, SCHEDULE o PREVIEW.
   */
  async clickKebabMenuItem(videoContainer: WebElement, action: InlineActionType): Promise<void> {
    try {
      const actionBtn = await this.findKebabAction(videoContainer, action);
      logger.debug(`Opción "${action}" encontrada en el menú kebab. Clickeando...`, { label: this.config.label });
      await clickSafe(this.driver, actionBtn, this.config);
    } catch (error: unknown) {
      logger.error(`Error en clickKebabMenuItem para "${action}": ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  async clickOnAction(videoContainer: WebElement, action: ActionType): Promise<void> {
    try {
      logger.debug(`Buscando el botón de "${action}" en el dropdown del video...`, { label: this.config.label });
      await this.hoverActionDropdownToggle(videoContainer);
      await this.openActionDropdown(videoContainer);
      await this.clickDropdownAction(videoContainer, action);
    } catch (error: unknown) {
      logger.error(`Fallo al clickear "${action}" en el dropdown: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw new Error(`Fallo al clickear "${action}" en el dropdown: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Abre el menú kebab (3 puntos) de la card del video y ejecuta la acción indicada.
   * No requiere hover previo; el botón de 3 puntos es directamente visible en la card.
   * Localiza la opción correcta mediante `INLINE_ACTION_TYPE_MAP`.
   *
   * @param videoContainer - Contenedor WebElement del video sobre el que se ejecuta la acción.
   * @param action - Acción a ejecutar: EDIT, DELETE, UNPUBLISH, SCHEDULE o PREVIEW.
   *
   * @remarks
   * DELETE y UNPUBLISH son mutuamente excluyentes según el estado del video:
   * DELETE está disponible para videos no publicados; UNPUBLISH para videos publicados.
   *
   * @throws Error si el botón kebab no se encuentra o la acción no aparece en el menú.
   */
  async clickOnKebabAction(videoContainer: WebElement, action: InlineActionType): Promise<void> {
    try {
      logger.debug(`Abriendo menú kebab para acción "${action}"...`, { label: this.config.label });
      await this.openKebabMenu(videoContainer);
      await this.clickKebabMenuItem(videoContainer, action);
    } catch (error: unknown) {
      logger.error(`Fallo al clickear "${action}" en el menú kebab: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw new Error(`Fallo al clickear "${action}" en el menú kebab: ${getErrorMessage(error)}`);
    }
  }

  // =========================================================================
  //   HELPERS PRIVADOS
  // =========================================================================

  private async findDropdownAction(videoContainer: WebElement, action: ActionType): Promise<WebElement> {
    try {
      const elements = await videoContainer.findElements(VideoInlineActions.LABELS_OF_ACTIONS);
      for (const element of elements) {
        const text = await element.getText();
        for (const label of VideoInlineActions.ACTION_TYPE_MAP[action]) {
          if (text.trim().includes(label)) {
            return element;
          }
        }
      }
      throw new Error(`Acción "${action}" no encontrada en el dropdown.`);
    } catch (error: unknown) {
      logger.error(`Error en findDropdownAction: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  private async findKebabAction(videoContainer: WebElement, action: InlineActionType): Promise<WebElement> {
    try {
      const elements = await videoContainer.findElements(VideoInlineActions.KEBAB_MENU_ITEMS);
      for (const element of elements) {
        const text = await element.getText();
        for (const label of VideoInlineActions.INLINE_ACTION_TYPE_MAP[action]) {
          if (text.trim().includes(label)) {
            return element;
          }
        }
      }
      throw new Error(`Acción "${action}" no encontrada en el menú kebab.`);
    } catch (error: unknown) {
      logger.error(`Error en findKebabAction: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  private async isDropdownOpen(dropdownBtn: WebElement): Promise<boolean> {
    try {
      const ariaExpanded = await dropdownBtn.getAttribute('aria-expanded');
      return ariaExpanded === 'true';
    } catch (error: unknown) {
      logger.error(`Error en isDropdownOpen: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  private async isKebabMenuOpen(videoContainer: WebElement): Promise<boolean> {
    try {
      const items = await videoContainer.findElements(VideoInlineActions.KEBAB_MENU_ITEMS);
      if (items.length === 0) return false;
      return await items[0].isDisplayed();
    } catch (error: unknown) {
      logger.error(`Error en isKebabMenuOpen: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }
}
