import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
import { waitFind } from "../../../core/utils/waitFind.js";

export enum NoteExitAction {
  SAVE_ONLY = "save only",
  SAVE_AND_EXIT = "save and exit",
  EXIT_WITHOUT_SAVING = "exit without saving",
  PUBLISH_ONLY = "publish only",
  PUBLISH_AND_EXIT = "publish and exit",
  SCHEDULE_AND_EXIT = "schedule",
  BACK_SAVE_AND_EXIT = "back save and exit",
  BACK_EXIT_DISCARD = "back exit discard",
}

/**
 * Orquestador de acciones del Header en el Editor de Notas.
 * Gestiona secuencias complejas de clics (Dropdown -> Opción -> Modal).
 */
export class EditorHeaderActions {
  private driver: WebDriver;
  private config: RetryOptions;

  // ========== LOCATORS (Respetando originales) ==========
  private readonly SAVE_BTN = By.css('[data-testid="btn-save-post"] button[data-testid="dropdown-action"]');
  private readonly PUBLISH_BTN = By.css('button.btn-info[data-testid="dropdown-action"]');
  private readonly BACK_BTN = By.css('a[data-testid="btn-exit-note"]');

  private readonly DROPDOWN_SAVE_CONTAINER = By.id('dropdown-save');
  private readonly DROPDOWN_PUBLISH_CONTAINER = By.id('dropdown-publish');

  // Nota: Estos IDs compartidos son un riesgo potencial en el DOM.
  private readonly SAVE_AND_EXIT_OPT = By.id("option-dropdown-0");
  private readonly EXIT_WITHOUT_SAVING_OPT = By.id("option-dropdown-1");
  private readonly PUBLISH_AND_EXIT_OPT = By.id("option-dropdown-0");
  private readonly SCHEDULE_OPT = By.id("option-dropdown-1");

  private readonly MODAL_BACK_SAVE_AND_EXIT_BTN = By.css('[data-testid="btn-ok-confirmModal"] button');
  private readonly MODAL_BACK_DISCARD_EXIT_BTN = By.css('[data-testid="btn-cancel"] button');
  private readonly MODAL_PUBLISH_CONFIRM_BTN = By.css('app-cmsmedios-button[data-testid="post-note-confirm"] button[data-testid="btn-calendar-confirm"]');
  private readonly MODAL_PUBLISH_CANCEL_BTN = By.css('app-cmsmedios-button[data-testid="post-note-cancel"] button[data-testid="btn-calendar-confirm"]');

  private locatorMap: Record<NoteExitAction, Locator> = {
    [NoteExitAction.SAVE_ONLY]: this.SAVE_BTN,
    [NoteExitAction.SAVE_AND_EXIT]: this.DROPDOWN_SAVE_CONTAINER,
    [NoteExitAction.EXIT_WITHOUT_SAVING]: this.DROPDOWN_SAVE_CONTAINER,
    [NoteExitAction.PUBLISH_ONLY]: this.PUBLISH_BTN,
    [NoteExitAction.PUBLISH_AND_EXIT]: this.DROPDOWN_PUBLISH_CONTAINER,
    [NoteExitAction.SCHEDULE_AND_EXIT]: this.DROPDOWN_PUBLISH_CONTAINER,
    [NoteExitAction.BACK_SAVE_AND_EXIT]: this.BACK_BTN,
    [NoteExitAction.BACK_EXIT_DISCARD]: this.BACK_BTN,
  };

  private readonly infoSectionDataTime = By.css('div.info-section')

  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorHeaderActions") }
  }

  /**
   * Ejecuta una secuencia de salida o guardado basada en el enum NoteExitAction.
   */
  public async clickExitAction(action: NoteExitAction): Promise<void> {

    const initialLocator = this.locatorMap[action];
    if (!initialLocator) {
      throw new Error(`Acción de salida no mapeada en el componente: ${action}`);
    }

    try {
      logger.debug(`Iniciando secuencia de salida: ${action}`, { label: this.config.label });

      // 1. Antes del Clic inicial (Abrir dropdown o clic directo) vamos a dar una espera implicita para que termine de cargar la pagina por completo.
      await waitFind(this.driver, this.infoSectionDataTime, this.config)
      await clickSafe(this.driver, initialLocator, { ...this.config, initialDelayMs: 10000 });

      // 2. Manejo de sub-pasos (Máquina de estados)
      switch (action) {
        case NoteExitAction.SAVE_ONLY:
          break;

        case NoteExitAction.SAVE_AND_EXIT:
          await clickSafe(this.driver, this.SAVE_AND_EXIT_OPT, this.config);
          break;

        case NoteExitAction.EXIT_WITHOUT_SAVING:
          await clickSafe(this.driver, this.EXIT_WITHOUT_SAVING_OPT, this.config);
          await clickSafe(this.driver, this.MODAL_BACK_DISCARD_EXIT_BTN, this.config);
          break;

        case NoteExitAction.PUBLISH_ONLY:
          await clickSafe(this.driver, this.MODAL_PUBLISH_CONFIRM_BTN, { ...this.config, initialDelayMs: 10000 });
          break;

        case NoteExitAction.PUBLISH_AND_EXIT:
          await clickSafe(this.driver, this.PUBLISH_AND_EXIT_OPT, this.config);
          await clickSafe(this.driver, this.MODAL_PUBLISH_CONFIRM_BTN, { ...this.config, initialDelayMs: 10000 });
          break;

        case NoteExitAction.SCHEDULE_AND_EXIT:
          await clickSafe(this.driver, this.SCHEDULE_OPT, this.config);
          break;

        case NoteExitAction.BACK_SAVE_AND_EXIT:
          await clickSafe(this.driver, this.MODAL_BACK_SAVE_AND_EXIT_BTN, this.config);
          break;

        case NoteExitAction.BACK_EXIT_DISCARD:
          await clickSafe(this.driver, this.MODAL_BACK_DISCARD_EXIT_BTN, this.config);
          break;
      }

      logger.debug(`Acción de salida ejecutada correctamente: ${action}`, { label: this.config.label });

    } catch (error) {
      // No logueamos error aquí, ya lo hizo clickSafe. Solo propagamos.
      throw error;
    }
  }
}