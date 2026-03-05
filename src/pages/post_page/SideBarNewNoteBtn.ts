import { Locator, WebDriver, By, WebElement, until } from "selenium-webdriver";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";

export enum NoteType {
  POST = 'POST',
  LISTICLE = 'LISTICLE',
  LIVEBLOG = 'LIVEBLOG'
}

export class NewNoteBtn {
  private driver: WebDriver;
  private config: RetryOptions;

  private static readonly NOTE_TYPE_MAP: Record<NoteType, Set<string>> = {
    [NoteType.POST]: new Set(['New post', "Crear noticia", "Nova notícia"]),
    [NoteType.LISTICLE]: new Set(['New listicle', "Crear nota lista", "Nova lista de notas"]),
    [NoteType.LIVEBLOG]: new Set(['New liveblog', "Crear liveblog", "Nova liveblog"])
  };

  private readonly NEW_NOTE_DROPDOWN_BTN: Locator = By.css("button.btn-create-note");
  private readonly DROPDOWN_COMBO_MODAL: Locator = By.css('div[data-testid="dropdown-menu"]');
  private readonly LABELS_OF_NOTE_TYPES: Locator = By.css('div[data-testid="dropdown-item"] label[id^="option-create-"]');
  private readonly SIDEBAR_CONTAINER: Locator = By.css('nav[id="cmsmedios-sidebar"]');
  private readonly COMMENTS_BTN: Locator = By.css('a[title="Comentarios"]')
  private readonly PLANNING_BTN: Locator = By.css('a[title="Planning"]')
  private readonly NEWS_BTN: Locator = By.css('a[title="Noticias"]')
  private readonly TAGS_BTN: Locator = By.css('a[title="Tags"]')
  private readonly MULTIMEDIA_COMBO_BTN: Locator = By.css('a[title="Multimedia"]')
  private readonly IMAGES_BTN: Locator = By.css('a[title="Imagenes"]')
  private readonly VIDEOS_BTN: Locator = By.css('a[title="Videos"]')


  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "NewNoteBtn") };
  }

  async selectNoteType(noteType: NoteType): Promise<void> {
    await this.clickOnNewNoteButton();

    const elementToClick = await this.matchNoteType(noteType);
    logger.debug(`Intentando hacer click en la opción "${noteType}"...`, { label: this.config.label });
    await clickSafe(this.driver, elementToClick, this.config);
  }

  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el NoteType.
   * Retorna el elemento para ser clickeado posteriormente.
   */
  async matchNoteType(noteType: NoteType): Promise<WebElement> {
    // 1. Esperar a que el contenedor del menú sea visible en pantalla
    // Esto evita el error "Wait timed out" si el menú tarda en animarse
    try {
      const menuContainer = await this.driver.wait(
        until.elementLocated(this.DROPDOWN_COMBO_MODAL),
        this.config.timeoutMs,
        "El menú dropdown no se encuentra en el DOM"
      );
      await this.driver.wait(
        until.elementIsVisible(menuContainer),
        this.config.timeoutMs,
        "El menú dropdown existe pero no es visible"
      );
    } catch (error) {
      logger.error("El menú no se desplegó correctamente.", { label: this.config.label });
      throw error;
    }

    // 2. Buscar todos los labels candidatos
    const elements = await this.driver.findElements(this.LABELS_OF_NOTE_TYPES);

    if (elements.length === 0) {
      throw new Error(`El menú se abrió, pero no se encontraron labels con el selector: ${this.LABELS_OF_NOTE_TYPES}`);
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

  async clickOnNewNoteButton(): Promise<void> {
    const isVisible = await this.isDropdownVisible();

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de opciones...", { label: this.config.label });
      await clickSafe(this.driver, this.NEW_NOTE_DROPDOWN_BTN, this.config);
    } else {
      logger.debug("El dropdown ya estaba abierto.", { label: this.config.label });
    }
  }

  async isDropdownVisible(): Promise<boolean> {
    const element = await waitFind(this.driver, this.NEW_NOTE_DROPDOWN_BTN, this.config);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }
}