import { WebDriver, WebElement, Locator } from "selenium-webdriver";
import { retry } from "../wrappers/retry.js";
import { RetryOptions } from "../config/defaultConfig.js";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";
import { waitFind } from "../actions/waitFind.js";
import { waitClickable } from "../helpers/waitClickable.js";
import { Banners } from "../../pages/modals/Banners.js";

/**
 * Realiza un clic resistente a la inestabilidad del DOM (flakiness).
 * Orquesta la búsqueda (si es necesario), validación de estado y el clic físico en un único bloque de reintento.
 * Punto de entrada recomendado para cualquier interacción que requiera un clic en el framework.
 * Delega en `waitFind`, `waitClickable` y `Banners.checkBanners` para gestionar intercepciones de toast.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param ID - Locator o WebElement del elemento objetivo. Si es WebElement, omite la búsqueda en el DOM.
 * @param opts - Opciones de reintento y trazabilidad. Propagadas a todos los sub-llamados internos.
 * @returns {Promise<WebElement>} El elemento objetivo tras confirmar el clic exitoso.
 */
export async function clickSafe(
  driver: WebDriver,
  ID: Locator | WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {

  const config = {
    ...opts,
    label: stackLabel(opts.label, `clickSafe`)
  };

  return await retry(async () => {
    const internalOpts = { ...config, supressRetry: true };
    try {
      // 1. Búsqueda: Si se recibe un Locator, se realiza la búsqueda del elemento. Si ya es un WebElement, se omite esta etapa.
      const element = (ID instanceof WebElement)
        ? ID
        : await waitFind(driver, ID as Locator, internalOpts);

      // 2. Sincronización: Espera a que no haya loaders o animaciones bloqueantes.
      await waitClickable(driver, element, internalOpts);

      // 4. Ejecución
      await element.click();

      logger.debug(`Click ejecutado correctamente`, { label: config.label });
      return element;

    } catch (error: any) {
      if (error.name === 'ElementClickInterceptedError') {
        logger.debug(`Intercepción detectada. Verificando si es un toast...`, { label: config.label });
        const banner = new Banners(driver, config)
        const isToast = await banner.checkBanners(false)
        if (isToast) {
          throw error
        }
      }
      /* // 4. Contingencia Reactiva para el Modal de Angular
      if (error.name === 'ElementClickInterceptedError') {
        logger.debug(`Intercepción detectada. Verificando si es el modal de actualización...`, { label: config.label });

        // Timeout corto para no penalizar si la intercepción fue por otra causa
        const modalHandled = await handleUpdateModal(driver, { ...internalOpts, timeoutMs: 1500 });

        if (modalHandled) {
          const staleError = new Error("Modal de actualización cerrado y página recargada. Forzando re-búsqueda del DOM.");
          staleError.name = "StaleElementReferenceError";
          throw staleError;
        }
      } */
      throw error;
    }
  }, config);
}