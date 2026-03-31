import { By, Locator, WebDriver } from "selenium-webdriver";
import { DefaultConfig, resolveRetryConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import logger from "../core/utils/logger.js";
import { clickSafe } from "../core/actions/clickSafe.js";
import { retry } from "../core/wrappers/retry.js";
import { getErrorMessage } from "../core/utils/errorUtils.js";

export type SidebarOption = keyof typeof SidebarAndHeader.SIDEBAR_MAP;

/**
 * Sub-componente que representa la barra lateral de navegación y el header del CMS.
 * Expone navegación hacia las secciones principales del sistema (Noticias, Videos, Imágenes, etc.)
 * mediante la resolución dinámica del locator correspondiente desde `SIDEBAR_MAP`.
 * Para secciones multimedia (IMAGES, VIDEOS), orquesta un click previo en el menú colapsable
 * antes de seleccionar la opción final, utilizando la estrategia de retry del wrapper `retry`.
 *
 * @example
 * const sidebar = new SidebarAndHeader(driver, opts);
 * await sidebar.goToComponent(SidebarOption.VIDEOS);
 */
export class SidebarAndHeader {
  private driver: WebDriver;
  private config: RetryOptions;

  private static readonly MULTIMEDIA_FILE_BTN: Locator = By.css('a[title="Multimedia"]');

  public static readonly SIDEBAR_MAP = {
    COMMENTS: By.css('a[title="Comentarios"]'),
    PLANNING: By.css('a[title="Planning"]'),
    NEWS: By.css('a[title="Noticias"]'),
    TAGS: By.css('a[title="Tags"]'),
    IMAGES: By.css('a[title="Imagenes"]'),
    VIDEOS: By.css('a[title="Videos"]')
  } as const;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "SidebarAndHeader")
  }

  /**
   * Navega hacia la sección indicada haciendo click en el enlace correspondiente del sidebar.
   * Para `IMAGES` o `VIDEOS`, delega en `clickOnMultimediaFileBtn` que gestiona el menú colapsable
   * de multimedia antes de seleccionar la sub-sección. Para el resto, hace click directo en el enlace.
   * Envuelto en un Allure `step` para trazabilidad en reportes.
   *
   * @param component - Sección del CMS a la que se desea navegar.
   * @returns {Promise<any>} Resuelve cuando la navegación se ha completado.
   */
  async goToComponent(component: SidebarOption): Promise<any> {
    await step(`Moverse hacia el componente ${component}`, async () => {
      const locator = SidebarAndHeader.SIDEBAR_MAP[component];
      try {
        logger.debug(`Ejecutando click en ${component}...`, { label: this.config.label })
        if (component === 'IMAGES' || component === 'VIDEOS') {
          await this.clickOnMultimediaFileBtn(component)
          return
        }
        await clickSafe(this.driver, locator, this.config)
      } catch (error: unknown) {
        logger.error(`Fallo al navegar al componente ${component}: ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }

  /**
   * Abre el menú colapsable de "Multimedia" y luego hace click en la sub-sección indicada.
   * Ejecuta la secuencia completa con `supressRetry: true` dentro de un wrapper `retry`
   * para reintentar desde el primer click si la transición del DOM falla.
   *
   * @param action - Sub-sección multimedia a seleccionar: IMAGES o VIDEOS.
   */
  async clickOnMultimediaFileBtn(action: 'IMAGES' | 'VIDEOS'): Promise<void> {
    const newConfig = { ...this.config, supressRetry: true }
    return retry(async () => {
      try {
        logger.debug(`Ejecutando click en el botón de multimedia para ir a ${action}...`, { label: newConfig.label })
        await clickSafe(this.driver, SidebarAndHeader.MULTIMEDIA_FILE_BTN, newConfig)
        await clickSafe(this.driver, SidebarAndHeader.SIDEBAR_MAP[action], newConfig)
      } catch (error: unknown) {
        throw error;
      }
    }, this.config)
  }
}