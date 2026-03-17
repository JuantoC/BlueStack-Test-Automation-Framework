import { Locator, WebDriver, By, WebElement, until } from "selenium-webdriver";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { step } from "allure-js-commons";

export type NoteType = keyof typeof NewNoteBtn.NOTE_TYPE_MAP;

export class NewNoteBtn {
  private driver: WebDriver;
  private config: RetryOptions;

  public static readonly NOTE_TYPE_MAP = {
    POST: new Set(['New post', "Crear noticia", "Nova notícia"]),
    LISTICLE: new Set(['New listicle', "Crear nota lista", "Nova lista de notas"]),
    LIVEBLOG: new Set(['New liveblog', "Crear liveblog", "Nova liveblog"])
  } as const;

  private static readonly NEW_NOTE_DROPDOWN_BTN: Locator = By.css("button.btn-create-note");
  private static readonly DROPDOWN_COMBO_MODAL: Locator = By.css('div[data-testid="dropdown-menu"]');
  private static readonly LABELS_OF_NOTE_TYPES: Locator = By.css('div[data-testid="dropdown-item"] label[id^="option-create-"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "NewNoteBtn") };
  }

  private async clickOnNewNoteButton(): Promise<void> {
    const isVisible = await this.isDropdownVisible();

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de opciones...", { label: this.config.label });
      await clickSafe(this.driver, NewNoteBtn.NEW_NOTE_DROPDOWN_BTN, this.config);
    } else {
      logger.debug("El dropdown ya estaba abierto.", { label: this.config.label });
    }
  }

  async selectNoteType(noteType: NoteType): Promise<void> {
    try {
      await this.clickOnNewNoteButton();

      const elementToClick = await this.matchNoteType(noteType);
      logger.debug(`Intentando hacer click en la opción "${noteType}"...`, { label: this.config.label });
      await clickSafe(this.driver, elementToClick, this.config);
    } catch (error: any) {
      logger.error(`Error en selectNoteType: ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }

  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el NoteType.
   * Retorna el elemento para ser clickeado posteriormente.
   */
  private async matchNoteType(noteType: NoteType): Promise<WebElement> {
    // 1. Esperar a que el contenedor del menú sea visible en pantalla
    try {
      const menuContainer = await this.driver.wait(
        until.elementLocated(NewNoteBtn.DROPDOWN_COMBO_MODAL),
        this.config.timeoutMs,
        "El menú dropdown no se encuentra en el DOM"
      );
      await this.driver.wait(
        until.elementIsVisible(menuContainer),
        this.config.timeoutMs,
        "El menú dropdown existe pero no es visible"
      );
    } catch (error: any) {
      logger.error(`El menú no se desplegó correctamente: ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }

    // 2. Buscar todos los labels candidatos
    const elements = await this.driver.findElements(NewNoteBtn.LABELS_OF_NOTE_TYPES);

    if (elements.length === 0) {
      throw new Error(`El menú se abrió, pero no se encontraron labels con el selector: ${NewNoteBtn.LABELS_OF_NOTE_TYPES}`);
    }

    logger.debug(`Analizando ${elements.length} opciones disponibles...`, { label: this.config.label });

    // 3. Iterar dinámicamente
    for (const element of elements) {
      // Obtenemos el texto limpio (trim)
      const text = await element.getText();
      const cleanLabel = text.trim();

      if (NewNoteBtn.NOTE_TYPE_MAP[noteType].has(cleanLabel)) {
        logger.debug(`Match encontrado: "${cleanLabel}"`, { label: this.config.label });
        return element;
      }
    }

    throw new Error(`No se encontró la opción "${noteType}" en el menú.`);
  }

  private async isDropdownVisible(): Promise<boolean> {
    const element = await waitFind(this.driver, NewNoteBtn.NEW_NOTE_DROPDOWN_BTN, this.config);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }
}