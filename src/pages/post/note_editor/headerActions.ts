import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions } from "../../../core/wrappers/retry.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";

export enum NoteExitAction {
  // Acciones del Dropdown 'Guardar'
  SAVE_AND_EXIT = "save and exit", // Dropdown opción 0
  EXIT_WITHOUT_SAVING = "exit without saving", // Dropdown opción 1

  // Acciones del Dropdown 'Publicar'
  PUBLISH_AND_EXIT = "publish and exit", // Dropdown opción 0, luego modal
  SCHEDULE_AND_EXIT = "schedule", // Dropdown opción 1, luego modal

  // Acciones del Botón principal 'Publicar' (asumo que publica y se queda en la nota, y luego tienes que hacer algo más para salir)
  // Basado en tu código anterior `clickPublish`, asumo que es publicar y confirmar la acción en un modal.
  PUBLISH_ONLY_CONFIRM = "publish only",

  // Acciones del Botón 'Back'
  BACK_SAVE_AND_EXIT = "back save and exit", // Botón Back + Modal "Guardar y Salir"
  BACK_EXIT_DISCARD = "back exit discard", // Botón Back + Modal "Salir de todos modos"

  // Acción de Guardar (botón principal, sin salir) - Lo incluimos por completitud
  SAVE_ONLY = "save only",
}
/**
 * Clase para acciones del header
 */
export class NoteHeaderActions {
  private driver: WebDriver;

  // ========== LOCATORS ORIGINALES Y RENOMBRADOS ==========
  // Los locators se definen como constantes privadas (readonly) para mayor seguridad.

  // 1. Botones de Acción Principal / Desplegables
  private readonly SAVE_DROPDOWN_BTN: Locator = By.css('button[data-testid="dropdown-actions"]'); // Tu 'saveBtn' original
  private readonly PUBLISH_PRIMARY_BTN: Locator = By.css('button[data-testid="dropdown-action"]'); // Tu 'publishBtn' original
  private readonly BACK_BTN: Locator = By.css('a[data-testid="btn-exit-note"]'); // Tu 'backBtn' original

  // 2. Contenedores de Dropdowns (Aunque no se usan para el clic, los mantenemos si son necesarios para waits)
  private readonly DROPDOWN_SAVE_CONTAINER: Locator = By.id('dropdown-save'); // Tu 'dropdownSave' original
  private readonly DROPDOWN_PUBLISH_CONTAINER: Locator = By.id('dropdown-publish'); // Tu 'dropdownPublish' original

  // 3. Opciones de Dropdown (Guardar)
  private readonly SAVE_AND_EXIT_OPT: Locator = By.id("option-dropdown-0"); // Tu 'saveAndExitBtn' original
  private readonly EXIT_WITHOUT_SAVING_OPT: Locator = By.id("option-dropdown-1"); // Tu 'exitBtn' original

  // 4. Opciones de Dropdown (Publicar)
  private readonly PUBLISH_AND_EXIT_OPT: Locator = By.id("option-dropdown-0"); // Tu 'publishAndExitBtn' original
  private readonly SCHEDULE_OPT: Locator = By.id("option-dropdown-1"); // Tu 'scheduleBtn' original

  // 5. Modales
  private readonly MODAL_DISCARD_EXIT_BTN: Locator = By.css('app-cmsmedios-button[data-testid="btn-cancel"]'); // Tu 'exitAnywayBtnModal' original
  private readonly MODAL_SAVE_AND_EXIT_BTN: Locator = By.css('button[data-testid="btn-calendar-confirm"]'); // Tu 'saveAndExitBtnModal' original
  private readonly MODAL_PUBLISH_CONFIRM_BTN: Locator = By.css('app-cmsmedios-button[data-testid="post-note-confirm"] button[data-testid="btn-calendar-confirm"]'); // Tu 'publishBtnModal' original
  private readonly MODAL_CANCEL_BTN: Locator = By.css('app-cmsmedios-button[data-testid="post-note-cancel"] button[data-testid="btn-calendar-confirm"]'); // Tu 'cancelBtnModal' original (Añadido aunque no se use en las salidas)

  // ========== LOCATOR MAPS DINÁMICOS ==========

  private locatorMap: Record<NoteExitAction, Locator> = {
    // Acciones que inician con el botón de Guardar (desplegable)
    [NoteExitAction.SAVE_ONLY]: this.SAVE_DROPDOWN_BTN,
    [NoteExitAction.SAVE_AND_EXIT]: this.SAVE_DROPDOWN_BTN,
    [NoteExitAction.EXIT_WITHOUT_SAVING]: this.SAVE_DROPDOWN_BTN,

    // Acciones que inician con el botón de Publicar (desplegable o directo)
    [NoteExitAction.PUBLISH_ONLY_CONFIRM]: this.PUBLISH_PRIMARY_BTN,
    [NoteExitAction.PUBLISH_AND_EXIT]: this.PUBLISH_PRIMARY_BTN,
    [NoteExitAction.SCHEDULE_AND_EXIT]: this.PUBLISH_PRIMARY_BTN,

    // Acciones que inician con el botón de Volver (Back)
    [NoteExitAction.BACK_SAVE_AND_EXIT]: this.BACK_BTN,
    [NoteExitAction.BACK_EXIT_DISCARD]: this.BACK_BTN,
  };

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  // ========== MÉTODO PADRE CENTRALIZADO ==========

  public async clickExitAction(action: NoteExitAction, timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `[clickExitAction]: ${action}`) };

    // 1. Clicar el primer elemento usando el locatorMap
    const initialLocator = this.locatorMap[action];
    if (!initialLocator) {
      throw new Error(`[NoteHeaderActions]: Acción de salida no mapeada: ${action}`);
    }
    await clickSafe(this.driver, initialLocator, timeout, fullOpts);

    // 2. Manejar la secuencia posterior (Dropdowns, Modales, etc.)
    switch (action) {
      case NoteExitAction.SAVE_ONLY:
        // Clic simple, la acción se completó.
        break;

      // --- Dropdown de Guardar: Clic a la Opción ---
      case NoteExitAction.SAVE_AND_EXIT:
        await clickSafe(this.driver, this.SAVE_AND_EXIT_OPT, timeout, fullOpts);
        break;
      case NoteExitAction.EXIT_WITHOUT_SAVING:
        await clickSafe(this.driver, this.EXIT_WITHOUT_SAVING_OPT, timeout, fullOpts);
        break;

      // --- Publicación Directa: Clic al Modal de Confirmación ---
      case NoteExitAction.PUBLISH_ONLY_CONFIRM:
        await clickSafe(this.driver, this.MODAL_PUBLISH_CONFIRM_BTN, timeout, fullOpts);
        break;

      // --- Dropdown de Publicar: Clic a la Opción ---
      case NoteExitAction.PUBLISH_AND_EXIT:
        await clickSafe(this.driver, this.PUBLISH_AND_EXIT_OPT, timeout, fullOpts);
        break;
      case NoteExitAction.SCHEDULE_AND_EXIT:
        await clickSafe(this.driver, this.SCHEDULE_OPT, timeout, fullOpts);
        break;

      // --- Salida por Botón 'Back': Secuencia Compleja ---
      case NoteExitAction.BACK_SAVE_AND_EXIT:
      case NoteExitAction.BACK_EXIT_DISCARD:
        await this._handleBackExit(action, timeout, fullOpts);
        break;

      default:
        break;
    }
  }

  // ========== MÉTODOS PRIVADOS AUXILIARES ==========

  private async _handleBackExit(action: NoteExitAction, timeout: number, opts: RetryOptions): Promise<void> {
    let modalLocator: Locator;
    if (action === NoteExitAction.BACK_SAVE_AND_EXIT) {
      modalLocator = this.MODAL_SAVE_AND_EXIT_BTN;
    } else if (action === NoteExitAction.BACK_EXIT_DISCARD) {
      modalLocator = this.MODAL_DISCARD_EXIT_BTN;
    } else {
      throw new Error(`Error lógico interno: Acción de Back Button inválida: ${action}`);
    }

    await clickSafe(this.driver, modalLocator, timeout, opts);
  }
}