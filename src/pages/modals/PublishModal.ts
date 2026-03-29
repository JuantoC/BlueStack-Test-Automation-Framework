import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";

/**
 * Sub-componente modal que gestiona la confirmación de publicación de notas y videos en el CMS.
 * Espera a que el resumen generado por IA (`loadSummary`) desaparezca antes de habilitar
 * el botón de confirmar, evitando clics prematuros durante la generación del contenido IA.
 * Consumido internamente por `FooterActions` y `EditorHeaderActions`; no debe invocarse desde tests.
 */
export class PublishModal {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly PUBLISH_CONFIRM_BTN: Locator = By.css('div.button-primary__four button[data-testid="btn-calendar-confirm"]');
  private static readonly PUBLISH_CANCEL_BTN: Locator
  private static readonly CKEDITOR_LOAD_SUMMARY: Locator = By.css('div.loadSummary')

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "PublishModal"), timeoutMs: 10000 }
  }

  /**
   * Espera a que el resumen IA termine de generarse y hace click en el botón de confirmar publicación.
   * Orquesta la secuencia: primero `waitUntilAISummaryGenerated`, luego `clickSafe` sobre el botón.
   */
  async clickOnPublishBtn(): Promise<void> {
    try {
      logger.debug('Intentando clickar en el boton de publicar...', { label: this.config.label })
      await this.waitUntilAISummaryGenerated()
      await clickSafe(this.driver, PublishModal.PUBLISH_CONFIRM_BTN, this.config)
      logger.debug('Clickado el boton de publicar', { label: this.config.label })
    } catch (error: any) {
      logger.error(`Error clickeando el boton de publicar: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }

  /**
   * Hace click en el botón de cancelar del modal de publicación.
   * Espera a que el botón esté disponible e interactuable antes de actuar.
   */
  async clickOnCancelBtn(): Promise<void> {
    try {
      logger.debug('Intentando clickar en el boton de cancelar...', { label: this.config.label })
      const elementToClick = await this.waitUntilIsReady(PublishModal.PUBLISH_CANCEL_BTN)
      await clickSafe(this.driver, elementToClick, this.config)
      logger.debug('Clickado el boton de cancelar', { label: this.config.label })
    } catch (error: any) {
      logger.error(`Error clickeando el boton de cancelar: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }

  /**
   * Aguarda hasta que el indicador de generación del resumen IA desaparezca del DOM.
   * El CMS muestra un `div.loadSummary` mientras genera el resumen; este método
   * hace polling hasta que ese elemento ya no esté presente, con un timeout de 30 segundos.
   *
   * @returns {Promise<any>} Resuelve cuando el resumen IA ha terminado de generarse.
   */
  async waitUntilAISummaryGenerated(): Promise<any> {
    try {
      logger.debug('Esperando a que se genere el resumen por IA...', { label: this.config.label })
      await this.driver.wait(async () => {
        const summaryLoading = await this.driver.findElements(PublishModal.CKEDITOR_LOAD_SUMMARY)
        if (summaryLoading.length === 0) {
          logger.debug('Resumen por IA generado', { label: this.config.label })
          return true;
        }
        return false;
      }, 30000)
    } catch (error: any) {
      logger.error(`Error esperando a que se genere el resumen por IA: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }

  private async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    logger.debug(`Esperando a que el elemento ${JSON.stringify(locator)} este listo`, { label: this.config.label })

    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)

    return element
  }
}