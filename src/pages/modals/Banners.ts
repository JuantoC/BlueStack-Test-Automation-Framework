import { By, WebDriver, WebElement } from "selenium-webdriver";
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
  private static readonly TOAST_ERROR = By.css("div[role='alert']"); // Asumimos que este es el wrapper del error

  // Selectores relativos (para buscar DENTRO del WebElement del error)
  private static readonly TOAST_ERROR_TITLE = By.css("div.toast-title");
  private static readonly TOAST_ERROR_DETAIL = By.css("div.toast-error-detail");
  private static readonly TOAST_ERROR_ROUTE = By.css("div.toast-error-route");
  private static readonly TOAST_CLOSE_BTN = By.css("button.toast-close-button");

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "Banners") }
  }

  /**
   * Método orquestador. Revisa si existe el contenedor y delega el manejo
   * al método correspondiente según el tipo de toast que encuentre.
   * * @param expectSuccess - Si es true, el test FALLARÁ si no se encuentra un toast de éxito. 
   * Si es false, solo revisa y maneja lo que haya (ideal para soft checks).
   */
  async checkBanners(expectSuccess: boolean = false): Promise<void> {
    return await step(`Revisando banners (Esperando éxito: ${expectSuccess})`, async () => {
      let foundSuccess: WebElement | null = null;
      let foundError: WebElement | null = null;

      try {
        // Si esperamos éxito, usamos el timeout completo. 
        // Si no esperamos nada y solo estamos "espiando", usamos un tiempo corto para no frenar el test.
        const waitTime = expectSuccess ? this.config.timeoutMs : 800;

        await this.driver.wait(async () => {
          const containers = await this.driver.findElements(Banners.TOAST_CONTAINER);
          if (containers.length === 0) return false;

          const container = containers[0];

          // Revisamos qué tipo de toast existe dentro del contenedor
          const errors = await container.findElements(Banners.TOAST_ERROR);
          const successes = await container.findElements(Banners.TOAST_SUCCESS);

          if (errors.length > 0) foundError = errors[0];
          if (successes.length > 0) foundSuccess = successes[0];

          // Cortamos el ciclo wait si encontramos cualquiera de los dos
          return foundError !== null || foundSuccess !== null;
        }, waitTime, "Búsqueda de banners finalizada por timeout.");

      } catch (e: any) {
        // Se acabó el tiempo del wait y no apareció ningún toast. 
        // No lanzamos error aquí, la evaluación final se hace abajo.
        logger.debug('No se detectaron banners en el tiempo establecido.', { label: this.config.label });
      }

      // --- DELEGACIÓN DE RESPONSABILIDADES ---

      if (foundError) {
        logger.debug('Se detectó un toast de error, delegando manejo...', { label: this.config.label });
        await this.handleErrorToast(foundError);
      }

      if (foundSuccess) {
        logger.debug('Se detectó un toast de éxito, delegando manejo...', { label: this.config.label });
        await this.handleSuccessToast(foundSuccess);
      }

      // --- EVALUACIÓN FINAL DEL NEGOCIO ---

      // Si la lógica de negocio EXIGÍA un success y no apareció, fallamos el test.
      // (No importa si apareció un error o si no apareció nada de nada).
      if (expectSuccess && !foundSuccess) {
        const msg = foundError
          ? "El test falló: Se esperaba un toast de ÉXITO, pero apareció uno de ERROR en su lugar."
          : "El test falló: Se esperaba un toast de ÉXITO, pero no apareció NINGÚN toast.";

        logger.error(msg, { label: this.config.label });
        throw new Error(msg);
      }
    });
  }

  /**
   * Maneja el toast de error usando el WebElement ya encontrado.
   * Extrae info, saca screenshot y lo cierra. NO lanza excepciones.
   */
  private async handleErrorToast(errorElement: WebElement): Promise<void> {
    await step('Procesando toast de error', async () => {
      try {
        // 1. Extraemos la información buscando DENTRO del elemento que ya tenemos
        const titleElements = await errorElement.findElements(Banners.TOAST_ERROR_TITLE);
        const detailElements = await errorElement.findElements(Banners.TOAST_ERROR_DETAIL);
        const routeElements = await errorElement.findElements(Banners.TOAST_ERROR_ROUTE);

        const titleText = titleElements.length > 0 ? await titleElements[0].getText() : 'Sin título';
        const detailText = detailElements.length > 0 ? await detailElements[0].getText() : 'Sin detalle';
        const routeText = routeElements.length > 0 ? await routeElements[0].getText() : 'Sin ruta';

        const errorData = `Ruta: ${routeText}\nTítulo: ${titleText}\nDetalle: ${detailText}`;
        logger.warn(`Información del Toast de error:\n${errorData}`, { label: this.config.label });

        // 2. Adjuntamos texto y screenshot al reporte
        await attachment("Detalles del Toast", Buffer.from(errorData, "utf-8"), "text/plain");
        const screenshot = await this.driver.takeScreenshot();
        await attachment("Captura_Error_Toast", Buffer.from(screenshot, 'base64'), 'image/png');

        // 3. Cerramos el Toast interactuando con el botón DENTRO del contenedor del error
        const closeBtns = await waitFind(this.driver, Banners.TOAST_CLOSE_BTN, this.config)
        await clickSafe(this.driver, closeBtns, this.config)
        logger.debug('Toast de error cerrado.', { label: this.config.label });

      } catch (error: any) {
        logger.error(`Error interno procesando la UI del toast de error: ${error.message}`, { label: this.config.label });
      }
    });
  }

  /**
   * Maneja el toast de éxito usando el WebElement ya encontrado.
   */
  private async handleSuccessToast(successElement: WebElement): Promise<void> {
    await step('Procesando toast de éxito', async () => {
      try {
        const toastText = await successElement.getText();
        logger.debug(`Éxito confirmado: ${toastText}`, { label: this.config.label });
        await attachment("Mensaje de Éxito", Buffer.from(toastText, "utf-8"), "text/plain");
      } catch (error: any) {
        logger.error(`Error procesando toast de éxito: ${error.message}`, { label: this.config.label });
      }
    });
  }
}