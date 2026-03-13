import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { hoverOverParentContainer } from "../../core/helpers/hoverOverParentContainer.js";

export enum ActionType {
  EDIT = 'edit',
  DELETE = 'delete',
  UNPUBLISH = 'unpublish',
}

export class VideoActions {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private readonly ACTION_TYPE_MAP: Record<ActionType, Set<string>> = {
    [ActionType.EDIT]: new Set(['Edit', "Editar"]),
    [ActionType.DELETE]: new Set(["Eliminar", "Remove"]),
    [ActionType.UNPUBLISH]: new Set(['Unpublish', "Despublicar"]),
  };
  private readonly DROPDOWN_BTN: Locator = By.css('div#-dropMenu button.dropdown-toggle')
  private readonly LABELS_OF_ACTIONS: Locator = By.css('div#-dropMenu button.dropdown-item')

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "VideoActions") }
  }


  /**
   * Clickea el botón de una accion de un video específico.
   */
  async clickOnAction(videoContainer: WebElement, action: ActionType): Promise<void> {
    try {
      logger.debug(`Buscando el boton de ${action} dentro del video..`, { label: this.config.label })
      const editorBtn = await videoContainer.findElement(this.DROPDOWN_BTN);

      await hoverOverParentContainer(this.driver, editorBtn, this.config)

      if (!await this.isActionsModalOpen(editorBtn)) {
        logger.debug(`El modal de acciones no se encuentra abierto, clickeando el boton de ${action}`, { label: this.config.label })
        await clickSafe(this.driver, editorBtn, this.config)
      }
      const actionBtn = await this.findAction(videoContainer, action)
      logger.debug(`Encontrado el boton de ${action}, clickeando...`, { label: this.config.label })
      await clickSafe(this.driver, actionBtn, this.config)
    } catch (error) {
      throw new Error(`Fallo al clickear botón ${action} en el video: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findAction(videoContainer: WebElement, action: ActionType): Promise<WebElement> {
    try {
      const elements = await videoContainer.findElements(this.LABELS_OF_ACTIONS);
      for (const element of elements) {
        const text = await element.getText();
        for (const label of this.ACTION_TYPE_MAP[action]) {
          if (text.trim().includes(label)) {
            return element;
          }
        }
      }
      throw new Error(`No se encontro la accion ${action}`)
    } catch (error) {
      throw error;
    }
  }

  async isActionsModalOpen(editorBtn: WebElement): Promise<boolean> {
    try {
      const ariaExpanded = await editorBtn.getAttribute('aria-expanded')
      return ariaExpanded === 'true'
    } catch (error) {
      throw error;
    }
  }
}