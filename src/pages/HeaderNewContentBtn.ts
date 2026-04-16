import { By, Locator, WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { step } from "allure-js-commons";
import logger from "../core/utils/logger.js";
import { clickSafe } from "../core/actions/clickSafe.js";
import { waitFind } from "../core/actions/waitFind.js";
import { getErrorMessage } from "../core/utils/errorUtils.js";

export type HeaderNewContentType = keyof typeof HeaderNewContentBtn.NEW_CONTENT_TYPE_MAP;

/**
 * Sub-componente que representa el botón "+" del header del CMS y su dropdown
 * de creación de contenido (`app-new-content-dropdown`).
 * Encapsula la apertura del dropdown y la selección directa de la opción por
 * `data-testid`, evitando dependencias en texto visible o IDs dinámicos.
 *
 * Las opciones están organizadas en tres secciones (Frequent, Others, Videos).
 * Las opciones `NEW_UCG` y `NEW_CHRONICLE` están marcadas como `hidden` en el DOM
 * — pueden no ser visibles dependiendo de la configuración del tenant.
 *
 * @example
 * const header = new HeaderNewContentBtn(driver, opts);
 * await header.selectNewContent('NEW_POST');
 */
export class HeaderNewContentBtn {
  private config: RetryOptions;

  // ========== LOCATORS ==========
  private static readonly ADD_BTN: Locator = By.css('[data-testid="btn-add-header"]');
  private static readonly DROPDOWN_CONTAINER: Locator = By.css('[data-testid="dropdown-menu-new-content"]');

  /**
   * Mapa de tipo de contenido → data-testid del ítem en el dropdown.
   * Las opciones UCG y CHRONICLE son hidden por configuración de tenant.
   * Los testids de video usan puntos literales en el valor del atributo.
   */
  public static readonly NEW_CONTENT_TYPE_MAP = {
    // Frequent
    NEW_POST:           'dropdown-item-new-news',
    NEW_TRIVIA:         'dropdown-item-new-trivias',
    NEW_POLL:           'dropdown-item-new-polls',
    NEW_LISTICLE:       'dropdown-item-new-listas',
    // Others
    NEW_TAG:            'dropdown-item-new-tag',
    NEW_UCG:            'dropdown-item-new-post',
    NEW_GAMECAST:       'dropdown-item-new-gamecasts',
    NEW_CHRONICLE:      'dropdown-item-new-cronicas',
    NEW_LIVEBLOG:       'dropdown-item-new-liveblog',
    NEW_AI_NEWS:        'dropdown-item-new-AIEnabled',
    NEW_AI_LISTICLE:    'dropdown-item-new-AIEnabledList',
    // Videos
    NEW_VIDEO_NATIVE:   'dropdown-item-new-header.new_video.native',
    NEW_VIDEO_EMBEDDED: 'dropdown-item-new-header.new_video.embed',
    NEW_VIDEO_YOUTUBE:  'dropdown-item-new-header.new_video.youtube',
  } as const;

  constructor(private driver: WebDriver, opts: RetryOptions) {
    this.config = resolveRetryConfig(opts, "HeaderNewContentBtn");
  }

  /**
   * Abre el dropdown de nuevo contenido y hace click en la opción indicada por tipo.
   * Si el dropdown ya está abierto, omite el click de apertura.
   * Localiza el ítem directamente por `data-testid` — sin iterar texto visible.
   *
   * @param type - Tipo de contenido a crear. Valores disponibles en `NEW_CONTENT_TYPE_MAP`.
   */
  async selectNewContent(type: HeaderNewContentType): Promise<void> {
    await step(`Crear nuevo contenido: ${type}`, async () => {
      try {
        logger.debug(`Iniciando creación de contenido tipo: ${type}`, { label: this.config.label });

        await this.openDropdown();

        const testid = HeaderNewContentBtn.NEW_CONTENT_TYPE_MAP[type];
        logger.debug(`Buscando opción "${type}" por testid: ${testid}`, { label: this.config.label });

        const item = await waitFind(
          this.driver,
          By.css(`[data-testid="${testid}"]`),
          this.config
        );

        await clickSafe(this.driver, item, this.config);
        logger.debug(`Opción "${type}" seleccionada.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al seleccionar contenido "${type}": ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error),
        });
        throw error;
      }
    });
  }

  /**
   * Abre el dropdown de nuevo contenido si aún no está abierto.
   * Verifica el estado mediante `isDropdownOpen` antes de ejecutar el click.
   */
  async openDropdown(): Promise<void> {
    try {
      const isOpen = await this.isDropdownOpen();
      if (!isOpen) {
        logger.debug("Abriendo dropdown de nuevo contenido...", { label: this.config.label });
        await clickSafe(this.driver, HeaderNewContentBtn.ADD_BTN, this.config);
        await waitFind(this.driver, HeaderNewContentBtn.DROPDOWN_CONTAINER, this.config);
      } else {
        logger.debug("El dropdown de nuevo contenido ya estaba abierto.", { label: this.config.label });
      }
    } catch (error: unknown) {
      logger.error(`Error al abrir el dropdown de nuevo contenido: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Verifica si el dropdown de nuevo contenido está actualmente abierto.
   * Lee el atributo `aria-expanded` del botón disparador.
   *
   * @returns {Promise<boolean>} `true` si el dropdown está abierto.
   */
  async isDropdownOpen(): Promise<boolean> {
    try {
      const btn = await waitFind(this.driver, HeaderNewContentBtn.ADD_BTN, this.config);
      const expanded = await btn.getAttribute("aria-expanded");
      return expanded === "true";
    } catch {
      return false;
    }
  }
}
