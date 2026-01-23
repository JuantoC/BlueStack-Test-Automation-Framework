import { Locator, WebDriver, By } from "selenium-webdriver";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";

export enum NoteType {
  POST = 'POST',
  LISTICLE = 'LISTICLE',
  LIVEBLOG = 'LIVEBLOG'
}

export class NoteCreationDropdown {
  // PUNTOS 2: Configuración estática y encapsulada
  private static readonly NOTE_TYPE_CONFIG: Record<NoteType, { index: number; displayName: string }> = {
    [NoteType.POST]: { index: 0, displayName: 'New Post' },
    [NoteType.LISTICLE]: { index: 1, displayName: 'New Listicle' },
    [NoteType.LIVEBLOG]: { index: 2, displayName: 'New LiveBlog' }
  };

  // PUNTO 1: Encapsulamiento estricto (Private)
  private readonly openDropdownBtn: Locator = By.css("button.btn-create-note");
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  // PUNTO 3: Eliminación de timeout posicional y uso de config centralizado
  async selectNoteType(noteType: NoteType, opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, `selectNoteType(${noteType})`)
    };

    const typeData = NoteCreationDropdown.NOTE_TYPE_CONFIG[noteType];
    if (!typeData) {
      throw new Error(`[NoteCreationDropdown] Tipo de nota "${noteType}" no está en la configuración.`);
    }

    // Respetamos tu locator original pero inyectamos el índice de la config
    const optionLocator = By.css(`#option-dropdown-${typeData.index} label`);

    try {
      // Uso de logger.debug para trazabilidad técnica interna
      logger.debug("Abriendo selector de creación de nota", { label: config.label });
      await clickSafe(this.driver, this.openDropdownBtn, config);

      logger.debug(`Seleccionando opción: ${typeData.displayName}`, { label: config.label });
      await clickSafe(this.driver, optionLocator, config);

      // Uso de logger.info para hito de negocio
      logger.info(`Tipo de nota "${typeData.displayName}" seleccionado exitosamente.`, { label: config.label });
    } catch (error) {
      // Regla de Oro: No redundancia. clickSafe ya logueó el error, nosotros solo propagamos.
      throw error;
    }
  }
}