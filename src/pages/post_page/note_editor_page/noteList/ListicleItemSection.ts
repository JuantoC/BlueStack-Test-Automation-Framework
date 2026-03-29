import { WebDriver } from "selenium-webdriver";
import { BaseListicleSection, LiveBlogData } from "./BaseListicleSection.js";
import { LiveBlogStrategy, StandardStrategy } from "./ListicleStrategy.js";
import { LiveBlogEventSection } from "./LiveBlogEventSection.js";
import logger from "../../../../core/utils/logger.js";
import { RetryOptions } from "../../../../core/config/defaultConfig.js";

/**
 * Implementación concreta de `BaseListicleSection` para notas de tipo LiveBlog.
 * Extiende la base con el relleno del evento del LiveBlog (título del evento) antes de los ítems.
 * Usa `LiveBlogStrategy` para invertir el orden de los ítems al crearlos,
 * ya que el CMS los apila en orden inverso al esperado por la interfaz.
 */
export class LiveBlogSection extends BaseListicleSection {
  private eventSection: LiveBlogEventSection;

  constructor(driver: WebDriver, opts: RetryOptions) {
    super(driver, LiveBlogStrategy, opts);
    this.eventSection = new LiveBlogEventSection(driver, this.config);
  }

  /**
   * Implementación del hook de la base para rellenar la sección del evento LiveBlog.
   * Solo actúa si `data.eventLiveBlog.eventTitle` tiene valor; si no, omite el paso.
   * Delega en `LiveBlogEventSection.fillEventTitle`.
   *
   * @param data - Datos del LiveBlog, incluyendo el objeto `eventLiveBlog` con el título del evento.
   */
  protected async fillEventSection(data: LiveBlogData): Promise<void> {
    if (!data.eventLiveBlog?.eventTitle) {
      logger.debug(`No se proporcionó un título para el evento de LiveBlog. Omitiendo este paso.`, { label: this.config.label });
      return;
    }
    await this.eventSection.fillEventTitle(data);
  }
}

/**
 * Implementación concreta de `BaseListicleSection` para notas de tipo Listicle.
 * No sobrescribe ningún hook; usa `StandardStrategy` que preserva el orden original de los ítems.
 */
export class ListicleSection extends BaseListicleSection {
  constructor(driver: WebDriver, opts: RetryOptions) {
    super(driver, StandardStrategy, opts);
  }
}