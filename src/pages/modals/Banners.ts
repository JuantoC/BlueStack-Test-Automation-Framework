import { By, until, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { step, attachment } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import { waitFind } from "../../core/actions/waitFind.js";

export class Banners {
  private driver: WebDriver;
  private config: RetryOptions;

  private static readonly TOAST_CONTAINER = By.css("div#toast-container");
  private static readonly TOAST_SUCCESS = By.css("div.toast-success");
  private static readonly TOAST_ERROR = By.css("div[role='alert']");

  private static readonly TOAST_ERROR_TITLE = By.css("div.toast-title");
  private static readonly TOAST_ERROR_DETAIL = By.css("div.toast-error-detail");
  private static readonly TOAST_ERROR_ROUTE = By.css("div.toast-error-route");
  private static readonly TOAST_CLOSE_BTN = By.css("button.toast-close-button");

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "Banners") }
  }

  async checkBanners(expectSuccess: boolean = false): Promise<boolean> {
    return await step(`Revisando banners: (${expectSuccess ? 'Esperando éxito' : 'Monitoreo'})`, async () => {
      // Usamos flags booleanos para evitar StaleElementReferenceException luego
      let hasSuccess = false;
      let hasError = false;

      try {
        const waitTime = expectSuccess ? this.config.timeoutMs : 800;
        await this.driver.wait(async () => {
          try {
            const containers = await this.driver.findElements(Banners.TOAST_CONTAINER);
            if (containers.length === 0) return false;

            const container = containers[0];

            // Revisamos qué tipo de toast existe
            const errors = await container.findElements(Banners.TOAST_ERROR);
            const successes = await container.findElements(Banners.TOAST_SUCCESS);

            if (errors.length > 0) hasError = true;
            if (successes.length > 0) hasSuccess = true;

            // NUEVA LÓGICA DE SALIDA
            if (expectSuccess) {
              // Si obligatoriamente esperamos éxito, no salimos hasta encontrarlo
              return hasSuccess;
            } else {
              // Si solo monitoreamos, salimos apenas encontremos cualquiera
              return hasError || hasSuccess;
            }
          } catch (e) {
            return false;
          }
        }, waitTime, "Búsqueda de banners finalizada por timeout.");

      } catch (e: any) {
        logger.debug('Sin toast encontrados.', { label: this.config.label });
      }

      // --- DELEGACIÓN DE RESPONSABILIDADES ---
      // Los handlers ahora se encargan de buscar el elemento fresco en el DOM

      if (hasSuccess) {
        logger.debug('Se detectó un toast de éxito, delegando manejo...', { label: this.config.label });
        await this.handleSuccessToast();
      }

      if (hasError) {
        logger.debug('Se detectó un toast de error, delegando manejo...', { label: this.config.label });
        await this.handleErrorToast();
      }


      // --- EVALUACIÓN FINAL DEL NEGOCIO ---

      if (expectSuccess && !hasSuccess) {
        const msg = hasError
          ? "El test falló: Se esperaba un toast de ÉXITO, pero solo apareció uno de ERROR."
          : "El test falló: Se esperaba un toast de ÉXITO, pero no apareció NINGÚN toast.";

        logger.error(msg, { label: this.config.label });
        const screenshot = await this.driver.takeScreenshot();
        await attachment("Captura_Sin_Toast_Exito", Buffer.from(screenshot, 'base64'), 'image/png');
        throw new Error(msg);
      }

      return hasError;
    });
  }

  /**
   * Maneja el toast de error. Busca el elemento internamente para evitar Stale Elements.
   */
  private async handleErrorToast(): Promise<void> {
    await step('Procesando toast de error', async () => {
      try {
        // 1. Buscamos el elemento FRESCO en el DOM
        const errorElements = await this.driver.findElements(Banners.TOAST_ERROR);
        if (errorElements.length === 0) {
          logger.debug('No se detectaron elementos de error en el DOM.', { label: this.config.label });
          return;
        }

        const errorElement = errorElements[0];

        const titleElements = await errorElement.findElements(Banners.TOAST_ERROR_TITLE);
        const detailElements = await errorElement.findElements(Banners.TOAST_ERROR_DETAIL);
        const routeElements = await errorElement.findElements(Banners.TOAST_ERROR_ROUTE);

        const titleText = titleElements.length > 0 ? await titleElements[0].getText() : 'Sin título';
        const detailText = detailElements.length > 0 ? await detailElements[0].getText() : 'Sin detalle';
        const routeText = routeElements.length > 0 ? await routeElements[0].getText() : 'Sin ruta';

        const errorData = `Ruta: ${routeText}\nTítulo: ${titleText}\nDetalle: ${detailText}`;
        logger.warn(`Información del Toast de error:\n${errorData}`, { label: this.config.label });

        // 2. Adjuntamos texto y screenshot
        await attachment("Detalles del Toast", Buffer.from(errorData, "utf-8"), "text/plain");
        const screenshot = await this.driver.takeScreenshot();
        await attachment("Captura_Error_Toast", Buffer.from(screenshot, 'base64'), 'image/png');

        // 3. Cerramos el Toast
        const closeBtns = await waitFind(this.driver, Banners.TOAST_CLOSE_BTN, { ...this.config, supressRetry: true, timeoutMs: 800 });
        await clickSafe(this.driver, closeBtns, { ...this.config, supressRetry: true, timeoutMs: 800 });
        logger.debug('Toast de error cerrado.', { label: this.config.label });

      } catch (error: any) {
        // Ahora sí, si falla, sabrás que no fue por un StaleElement al inicio
        logger.error(`Error interno procesando la UI del toast de error: ${error.message}`, { label: this.config.label });
      }
    });
  }

  /**
   * Maneja el toast de éxito. Busca el elemento internamente.
   */
  private async handleSuccessToast(): Promise<void> {
    await step('Procesando toast de éxito', async (stepContext) => {
      try {
        // Buscamos el elemento FRESCO en el DOM
        const successElements = await this.driver.findElements(Banners.TOAST_SUCCESS);
        if (successElements.length === 0) {
          logger.debug('No se detectaron elementos de éxito en el DOM.', { label: this.config.label });
          return;
        }

        const toastText = await successElements[0].getText();
        logger.debug(`Éxito confirmado: ${toastText}`, { label: this.config.label });
        await stepContext.parameter("Toast Message", toastText);
      } catch (error: any) {
        logger.error(`Error procesando toast de éxito: ${error.message}`, { label: this.config.label });
      }
    });
  }
}