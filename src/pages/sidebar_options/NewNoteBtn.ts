import { Locator, WebDriver, By, WebElement, until } from "selenium-webdriver";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { RetryOptions, DefaultConfig } from "../../core/config/default.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/utils/waitFind.js";

export enum NoteType {
  POST = 'POST',
  LISTICLE = 'LISTICLE',
  LIVEBLOG = 'LIVEBLOG'
}

export class NewNoteBtn {
  private static readonly NOTE_TYPE_MAP: Record<NoteType, Set<string>> = {
    [NoteType.POST]: new Set(['New post', "Crear noticia", "Nova notícia"]),
    [NoteType.LISTICLE]: new Set(['New listicle', "Crear nota lista", "Nova lista de notas"]),
    [NoteType.LIVEBLOG]: new Set(['New liveblog', "Crear liveblog", "Nova liveblog"])
  };

  private readonly openDropdownBtn: Locator = By.css("button.btn-create-note");
  private readonly dropdownContainer: Locator = By.css('div[data-testid="dropdown-menu"]');
  private readonly noteTypeLabels: Locator = By.css('div[data-testid="dropdown-item"] label[id^="option-create-"]');

  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async selectNoteType(noteType: NoteType, opts: RetryOptions): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "NewNoteBtn.selectNoteType"),
    };

    await this.clickOnNewNoteButton(config);

    const elementToClick = await this.matchNoteType(noteType, config);
    logger.debug(`Intentando hacer click en la opción "${noteType}"...`, config);
    await clickSafe(this.driver, elementToClick, config);
  }

  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el NoteType.
   * Retorna el elemento para ser clickeado posteriormente.
   */
  async matchNoteType(noteType: NoteType, opts: RetryOptions): Promise<WebElement> {
    const config = { ...DefaultConfig, ...opts };

    // 1. Esperar a que el contenedor del menú sea visible en pantalla
    // Esto evita el error "Wait timed out" si el menú tarda en animarse
    try {
      const menuContainer = await this.driver.wait(
        until.elementLocated(this.dropdownContainer),
        config.timeoutMs,
        "El menú dropdown no se encuentra en el DOM"
      );
      await this.driver.wait(
        until.elementIsVisible(menuContainer),
        config.timeoutMs,
        "El menú dropdown existe pero no es visible"
      );
    } catch (error) {
      logger.error("El menú no se desplegó correctamente.", config);
      throw error;
    }

    // 2. Buscar todos los labels candidatos
    const elements = await this.driver.findElements(this.noteTypeLabels);

    if (elements.length === 0) {
      throw new Error(`El menú se abrió, pero no se encontraron labels con el selector: ${this.noteTypeLabels}`);
    }

    logger.debug(`Analizando ${elements.length} opciones disponibles...`, config);

    // 3. Iterar dinámicamente
    for (const element of elements) {
      // Obtenemos el texto limpio (trim)
      const text = await element.getText();
      const cleanLabel = text.trim();

      if (NewNoteBtn.NOTE_TYPE_MAP[noteType].has(cleanLabel)) {
        logger.debug(`Match encontrado: "${cleanLabel}"`, config);
        return element;
      }
    }

    throw new Error(`No se encontró la opción "${noteType}" en el menú.`);
  }
  async clickOnNewNoteButton(opts: RetryOptions): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "NewNoteBtn.clickOnNewNoteButton"),
    };

    const isVisible = await this.isDropdownVisible(config);

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de opciones...", { label: config.label });
      await clickSafe(this.driver, this.openDropdownBtn, config);
    } else {
      logger.debug("El dropdown ya estaba abierto.", { label: config.label });
    }
  }

  async isDropdownVisible(opts: RetryOptions): Promise<boolean> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "NewNoteBtn.isDropdownVisible"),
    };

    const element = await waitFind(this.driver, this.openDropdownBtn, config);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }
}