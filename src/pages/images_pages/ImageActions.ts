import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { hoverOverParentContainer } from "../../core/helpers/hoverOverParentContainer.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

export type ImageActionType = keyof typeof ImageActions.ACTION_TYPE_MAP;

/**
 * Page Object que encapsula las acciones disponibles para una imagen en la tabla multimedia.
 * Gestiona la apertura del menú desplegable de acciones mediante hover y click,
 * y la selección de la acción correcta comparando el texto visible contra el mapa
 * de alias multilinguales definido en `ACTION_TYPE_MAP`.
 * Consumido por `MainImagePage.clickOnActionImage` como paso de interacción con el menú de opciones.
 *
 * @example
 * const actions = new ImageActions(driver, opts);
 * await actions.clickOnAction(imageContainer, 'EDIT');
 */
export class ImageActions {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  public static readonly ACTION_TYPE_MAP = {
    EDIT: new Set(['Edit', "Editar"]),
    DELETE: new Set(["Eliminar", "Remove"]),
    UNPUBLISH: new Set(['Unpublish', "Despublicar"]),
  } as const;
  private static readonly DROPDOWN_BTN: Locator = By.css('div.dropdown-options-table button.dropdown-toggle')
  private static readonly LABELS_OF_ACTIONS: Locator = By.css('div[aria-labelledby="dropdownBasic1"] button.dropdown-item')
  private static readonly EDITOR_BTN: Locator = By.css('div.icon-default button[mat-icon-button]')

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "ImageActions")
  }


  /**
   * Abre el menú desplegable de acciones de la imagen y hace click en la opción indicada.
   * Realiza hover sobre el botón del dropdown para activar su visibilidad, abre el menú
   * si no está expandido, y localiza la acción correcta mediante `findAction`.
   *
   * @param imageContainer - Contenedor WebElement de la imagen sobre la que se ejecuta la acción.
   * @param action - Tipo de acción a ejecutar (EDIT, DELETE o UNPUBLISH).
   */
  async clickOnAction(imageContainer: WebElement, action: ImageActionType): Promise<void> {
    try {
      logger.debug(`Buscando el boton de ${action} dentro de la imagen..`, { label: this.config.label })
      const editorBtn = await imageContainer.findElement(ImageActions.DROPDOWN_BTN);

      await hoverOverParentContainer(this.driver, editorBtn, this.config)

      if(action === 'EDIT') {
        logger.debug(`La acción es EDIT, realizando click seguro sobre el botón de edición.`, { label: this.config.label })
        await this.clickOnEditImage(imageContainer);
        return;
      }
      
      if (!await this.isActionsModalOpen(editorBtn)) {
        logger.debug(`El modal de acciones no se encuentra abierto, clickeando el boton de ${action}`, { label: this.config.label })
        await clickSafe(this.driver, editorBtn, this.config)
      }

      const actionBtn = await this.findAction(imageContainer, action)
      logger.debug(`Encontrado el boton de ${action}, clickeando...`, { label: this.config.label })
      await clickSafe(this.driver, actionBtn, this.config)

    } catch (error: unknown) {
      logger.error(`Fallo al clickear botón ${action} en la imagen: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw new Error(`Fallo al clickear botón ${action} en la imagen: ${getErrorMessage(error)}`);
    }
  }

  async clickOnEditImage(imageContainer: WebElement): Promise<void> {
    try {
      logger.debug(`Buscando el boton de Edit dentro de la imagen..`, { label: this.config.label })
      const editorBtn = await imageContainer.findElement(ImageActions.EDITOR_BTN);
      clickSafe(this.driver, editorBtn, this.config)
    } catch (error: unknown) {
      logger.error(`Fallo al clickear botón Edit en la imagen: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw new Error(`Fallo al clickear botón Edit en la imagen: ${getErrorMessage(error)}`);
    }
  }

  private async findAction(imageContainer: WebElement, action: ImageActionType): Promise<WebElement> {
    try {
      const elements = await imageContainer.findElements(ImageActions.LABELS_OF_ACTIONS);
      for (const element of elements) {
        const text = await element.getText();
        for (const label of ImageActions.ACTION_TYPE_MAP[action]) {
          if (text.trim().includes(label)) {
            return element;
          }
        }
      }
      throw new Error(`No se encontro la accion ${action}`)
    } catch (error: unknown) {
      logger.error(`Error en findAction: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  private async isActionsModalOpen(editorBtn: WebElement): Promise<boolean> {
    try {
      const ariaExpanded = await editorBtn.getAttribute('aria-expanded')
      return ariaExpanded === 'true'
    } catch (error: unknown) {
      logger.error(`Error en isActionsModalOpen: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
