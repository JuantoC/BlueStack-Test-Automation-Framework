import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

export type VideoFilterType = keyof typeof VideoTypeFilter.VIDEO_FILTER_MAP;

/**
 * Page Object que representa el selector de pestañas de tipo de video en la tabla multimedia.
 * Permite cambiar la vista de la tabla entre los distintos tipos de video disponibles
 * (Nativo, Embedded, YouTube, YouTube Short) haciendo click en la pestaña correspondiente.
 * Consumido por `MainVideoPage` como componente de filtrado de la vista tabular.
 *
 * @remarks
 * Los tipos de filtro (`VideoFilterType`) son equivalentes en nombre a `VideoType` de `UploadVideoBtn`,
 * pero representan un concepto distinto: selección de vista, no tipo de contenido a subir.
 *
 * @example
 * const filter = new VideoTypeFilter(driver, opts);
 * await filter.clickTab('YOUTUBE');
 * const active = await filter.getActiveTabLabel();
 */
export class VideoTypeFilter {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  /**
   * Mapa de tipos de filtro a sus etiquetas multilinguales visibles en las pestañas.
   * Usado para resolver el texto del DOM al tipo canónico.
   */
  public static readonly VIDEO_FILTER_MAP = {
    NATIVO: new Set(['Videos Nativos', 'Native Videos', 'Nativo', 'Native']),
    EMBEDDED: new Set(['Videos Embedded', 'Embedded Videos', 'Embedded', 'Video Embedded']),
    YOUTUBE: new Set(['Videos YouTube', 'YouTube Videos', 'Youtube Videos', 'YouTube']),
    SHORT: new Set(['Videos YouTube Short', 'YouTube Short Videos', 'Youtube Short Videos', 'Short']),
  } as const;

  private static readonly FILTER_TABS_CONTAINER: Locator = By.css('[data-testid="TODO_filter_tabs_container"]');
  private static readonly FILTER_TAB_ITEMS: Locator = By.css('[data-testid="TODO_filter_tab_item"]');
  private static readonly ACTIVE_TAB: Locator = By.css('[data-testid="TODO_active_tab"]');

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "VideoTypeFilter");
  }

  /**
   * Hace click en la pestaña de tipo de video indicada.
   * Espera a que el contenedor de pestañas esté presente, itera sobre
   * los ítems disponibles y activa el que coincide con las etiquetas del tipo.
   *
   * @param type - Tipo de filtro a activar (NATIVO, EMBEDDED, YOUTUBE, SHORT).
   * @throws Error si el contenedor no se encuentra o el tipo no tiene pestaña visible.
   */
  async clickTab(type: VideoFilterType): Promise<void> {
    try {
      logger.debug(`Cambiando pestaña de tipo de video a: "${type}"`, { label: this.config.label });
      await waitFind(this.driver, VideoTypeFilter.FILTER_TABS_CONTAINER, this.config);

      const tabs = await this.driver.findElements(VideoTypeFilter.FILTER_TAB_ITEMS);
      for (const tab of tabs) {
        const text = (await tab.getText()).trim();
        if (VideoTypeFilter.VIDEO_FILTER_MAP[type].has(text)) {
          await clickSafe(this.driver, tab, this.config);
          logger.debug(`Pestaña "${type}" activada.`, { label: this.config.label });
          return;
        }
      }
      throw new Error(`No se encontró la pestaña de tipo "${type}" en el filtro de videos.`);
    } catch (error: unknown) {
      logger.error(`Error al cambiar pestaña a "${type}": ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Retorna el texto visible de la pestaña actualmente activa.
   *
   * @returns {Promise<string>} Texto trimmed de la pestaña activa.
   * @throws Error si el elemento de pestaña activa no se encuentra.
   */
  async getActiveTabLabel(): Promise<string> {
    try {
      logger.debug('Obteniendo la pestaña activa...', { label: this.config.label });
      const activeTab = await waitFind(this.driver, VideoTypeFilter.ACTIVE_TAB, this.config);
      const label = (await activeTab.getText()).trim();
      logger.debug(`Pestaña activa: "${label}"`, { label: this.config.label });
      return label;
    } catch (error: unknown) {
      logger.error(`Error al obtener la pestaña activa: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  /**
   * Verifica si la pestaña del tipo indicado está actualmente activa
   * comparando el texto de la pestaña activa con las etiquetas del tipo en `VIDEO_FILTER_MAP`.
   *
   * @param type - Tipo de filtro a verificar.
   * @returns {Promise<boolean>} `true` si la pestaña del tipo está activa.
   */
  async isTabActive(type: VideoFilterType): Promise<boolean> {
    try {
      const activeLabel = await this.getActiveTabLabel();
      return VideoTypeFilter.VIDEO_FILTER_MAP[type].has(activeLabel);
    } catch (error: unknown) {
      logger.error(`Error al verificar si la pestaña "${type}" está activa: ${getErrorMessage(error)}`, {
        label: this.config.label,
        error: getErrorMessage(error),
      });
      throw error;
    }
  }

  // =========================================================================
  //                         HELPERS PRIVADOS
  // =========================================================================

  /**
   * Resuelve el `VideoFilterType` canónico a partir de una etiqueta visible en el DOM.
   * Itera sobre todas las entradas del mapa y retorna la clave cuyo Set incluye el texto.
   *
   * @param label - Texto visible de la pestaña a resolver.
   * @returns {VideoFilterType | null} Tipo canónico o `null` si el texto no tiene match.
   */
  private resolveTypeFromLabel(label: string): VideoFilterType | null {
    for (const [type, labels] of Object.entries(VideoTypeFilter.VIDEO_FILTER_MAP)) {
      if ((labels as Set<string>).has(label)) {
        return type as VideoFilterType;
      }
    }
    return null;
  }
}
