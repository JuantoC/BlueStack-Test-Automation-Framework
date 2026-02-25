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
    [NoteType.LIVEBLOG]: new Set(['New liveBlog', "Crear liveblog", "Nova liveblog"])
  };

  private readonly openDropdownBtn: Locator = By.css("button.btn-create-note");
  private readonly dropdownItemsLocator: Locator = By.css('div[id^="option-create-"]');

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

    const element = await this.matchNoteType(noteType, config);
    await clickSafe(this.driver, element, config);
  }

  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el NoteType.
   * Retorna el elemento para ser clickeado posteriormente.
   */
  async matchNoteType(noteType: NoteType, opts: RetryOptions): Promise<WebElement> {
    const config = { ...DefaultConfig, ...opts };

    // 1. Esperamos a que los elementos estén presentes en el DOM
    await this.driver.wait(
      until.elementsLocated(this.dropdownItemsLocator),
      config.timeoutMs,
      "No se encontraron opciones en el dropdown de notas"
    );

    // 2. Traemos todos los elementos
    const elements = await this.driver.findElements(this.dropdownItemsLocator);

    logger.debug(`Se encontraron ${elements.length} opciones en el dropdown. Buscando: ${noteType}`, {label: config.label});

    // 3. Iteramos dinámicamente sobre lo que encontró el driver
    for (const element of elements) {
      const label = await element.getText();

      if (NewNoteBtn.NOTE_TYPE_MAP[noteType].has(label)) {
        logger.debug(`Opción encontrada: "${label}" coincide con "${noteType}".`, {label: config.label});
        return element;
      }
    }

    // 4. Si termina el bucle y no retornó nada, lanzamos error
    throw new Error(`No se encontró ninguna opción de menú que coincida con el tipo de nota: ${noteType}`);
  }

  async clickOnNewNoteButton(opts: RetryOptions): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "clickOnNewNoteButton"),
    };

    const isVisible = await this.isDropdownVisible(config);

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de opciones...", {label: config.label});
      await clickSafe(this.driver, this.openDropdownBtn, config);
    } else {
      logger.debug("El dropdown ya estaba abierto.", {label: config.label});
    }
  }

  async isDropdownVisible(opts: RetryOptions): Promise<boolean> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "isDropdownVisible"),
    };

    const element = await waitFind(this.driver, this.openDropdownBtn, config);

    // Verificamos visualmente el atributo
    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }
}