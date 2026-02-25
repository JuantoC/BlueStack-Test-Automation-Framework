import { Locator, WebDriver, By } from "selenium-webdriver";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { RetryOptions, DefaultConfig } from "../../core/config/default.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";

export enum NoteType {
  POST = 'POST',
  LISTICLE = 'LISTICLE',
  LIVEBLOG = 'LIVEBLOG'
}

export class NewCreationDropdown {
  private static readonly NOTE_TYPE_CONFIG: Record<NoteType, { index: number; displayName: string }> = {
    [NoteType.POST]: { index: 0, displayName: 'New Post' },
    [NoteType.LISTICLE]: { index: 1, displayName: 'New Listicle' },
    [NoteType.LIVEBLOG]: { index: 2, displayName: 'New LiveBlog' }
  };

  private readonly openDropdownBtn: Locator = By.css("button.btn-create-note");
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async selectNoteType(noteType: NoteType, opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, `selectNoteType(${noteType})`)
    };

    const typeData = NewCreationDropdown.NOTE_TYPE_CONFIG[noteType];
    if (!typeData) {
      throw new Error(`[NewCreationDropdown] Tipo de nota "${noteType}" no está en la configuración.`);
    }

    const optionLocator = By.css(`#option-dropdown-${typeData.index} label`);

    try {
      logger.debug("Abriendo selector de creación de nota", { label: config.label });
      await clickSafe(this.driver, this.openDropdownBtn, config);

      logger.debug(`Seleccionando opción: ${typeData.displayName}`, { label: config.label });
      await clickSafe(this.driver, optionLocator, config);

      logger.debug(`Tipo de nota "${typeData.displayName}" seleccionado exitosamente.`, { label: config.label });
    } catch (error) {
      // Regla de Oro: No redundancia. clickSafe ya logueó el error, nosotros solo propagamos.
      throw error;
    }
  }
}