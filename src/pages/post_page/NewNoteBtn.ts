import { Locator, WebDriver, By, WebElement, until } from "selenium-webdriver";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { RetryOptions, resolveRetryConfig } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";
import type { NoteType } from "../../interfaces/data.js";

export type { NoteType } from "../../interfaces/data.js";

/**
 * Sub-componente que representa el botón de creación de notas y su menú desplegable de tipos.
 * Encapsula la apertura del dropdown y la selección dinámica del tipo de nota mediante
 * comparación de etiquetas multilingüales definidas en `NOTE_TYPE_MAP`.
 * Utilizado por `MainPostPage` como primer paso del flujo de creación de nota.
 *
 * @example
 * const btn = new NewNoteBtn(driver, opts);
 * await btn.selectNoteType('POST');
 */
export class NewNoteBtn {
  private config: RetryOptions;

  public static readonly NOTE_TYPE_MAP = {
    POST: new Set(['New post', "Crear noticia", "Nova notícia"]),
    LISTICLE: new Set(['New listicle', "Crear nota lista", "Nova lista de notas"]),
    LIVEBLOG: new Set(['New liveblog', "Crear liveblog", "Nova liveblog"]),
    AI_POST: new Set(['Create AI Post', 'Crear noticia IA', 'Crie notícias sobre IA'])
  } as const;

  private static readonly NEW_NOTE_DROPDOWN_BTN: Locator = By.css("button.btn-create-note");
  private static readonly DROPDOWN_COMBO_MODAL: Locator = By.css('div[data-testid="dropdown-menu"]');

  // Mapa de NoteType → data-testid del elemento clickeable en el dropdown.
  // Reemplaza la búsqueda por texto (LABELS_OF_NOTE_TYPES) que dejó de funcionar
  // cuando los items recibieron testids específicos por tipo (NAA-4324).
  private static readonly NOTE_TYPE_TESTID_MAP: Record<NoteType, string> = {
    POST:     'link-navigate-news',
    LISTICLE: 'link-navigate-listas',
    LIVEBLOG: 'link-navigate-liveblog',
    AI_POST:  'btn-create-ai',
  } as const;

  constructor(private driver: WebDriver, opts: RetryOptions) {
    this.config = resolveRetryConfig(opts, "NewNoteBtn");
  }

  /**
   * Abre el dropdown de tipos de nota si aún no está abierto.
   * Verifica el estado mediante `isDropdownOpen` antes de ejecutar el click.
   */
  async openNoteTypeDropdown(): Promise<void> {
    const isVisible = await this.isDropdownOpen();

    if (!isVisible) {
      logger.debug("Abriendo el dropdown de opciones...", { label: this.config.label });
      await clickSafe(this.driver, NewNoteBtn.NEW_NOTE_DROPDOWN_BTN, this.config);
    } else {
      logger.debug("El dropdown ya estaba abierto.", { label: this.config.label });
    }
  }

  /**
   * Abre el dropdown de tipos de nota y selecciona la opción que corresponde al tipo indicado.
   * Si el dropdown ya está abierto, omite el click de apertura. Localiza la etiqueta correcta
   * mediante `findNoteTypeOption`, que compara el texto visible contra los alias de `NOTE_TYPE_MAP`.
   *
   * @param noteType - Tipo de nota a seleccionar del menú (POST, LISTICLE, LIVEBLOG o AI_POST).
   */
  async selectNoteType(noteType: NoteType): Promise<void> {
    try {
      await this.openNoteTypeDropdown();

      const elementToClick = await this.findNoteTypeOption(noteType);
      await this.clickNoteTypeOption(elementToClick);
    } catch (error: unknown) {
      logger.error(`Error en selectNoteType: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Busca en la lista de opciones desplegadas el WebElement que coincide con el NoteType.
   * Espera a que el dropdown sea visible antes de iterar los labels disponibles.
   * Retorna el elemento para ser clickeado posteriormente con `clickNoteTypeOption`.
   *
   * @param noteType - Tipo de nota a localizar en el menú desplegable.
   * @returns {Promise<WebElement>} Elemento del menú que corresponde al tipo indicado.
   */
  async findNoteTypeOption(noteType: NoteType): Promise<WebElement> {
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
    } catch (error: unknown) {
      logger.error(`El menú no se desplegó correctamente: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }

    // 2. Localizar el elemento por testid específico del tipo
    const testid = NewNoteBtn.NOTE_TYPE_TESTID_MAP[noteType];
    logger.debug(`Buscando opción "${noteType}" por testid: ${testid}`, { label: this.config.label });

    const element = await this.driver.findElement(By.css(`[data-testid="${testid}"]`));
    logger.debug(`Opción "${noteType}" encontrada.`, { label: this.config.label });
    return element;
  }

  /**
   * Ejecuta el click sobre un elemento de opción del menú desplegable de tipos de nota.
   *
   * @param element - WebElement de la opción a clickear (obtenido desde `findNoteTypeOption`).
   */
  async clickNoteTypeOption(element: WebElement): Promise<void> {
    logger.debug(`Intentando hacer click en la opción del menú...`, { label: this.config.label });
    await clickSafe(this.driver, element, this.config);
  }

  /**
   * Verifica si el dropdown de tipos de nota está actualmente abierto.
   * Lee el atributo `aria-expanded` del botón principal del dropdown.
   *
   * @returns {Promise<boolean>} `true` si el dropdown está abierto, `false` en caso contrario.
   */
  async isDropdownOpen(): Promise<boolean> {
    const element = await waitFind(this.driver, NewNoteBtn.NEW_NOTE_DROPDOWN_BTN, this.config);

    const isExpanded = await element.getAttribute("aria-expanded");
    return isExpanded === "true";
  }
}