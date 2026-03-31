import { WebDriver, WebElement, error } from "selenium-webdriver";
import { RetryOptions, DefaultConfig, resolveRetryConfig } from "../config/defaultConfig.js";
import { stackLabel } from "../utils/stackLabel.js";
import { waitVisible } from "../actions/waitVisible.js";
import { waitEnabled } from "../actions/waitEnabled.js";
import logger from "../utils/logger.js";
import { retry } from "../wrappers/retry.js";

/**
 * Valida que un elemento sea apto para recibir clics (Visible + Habilitado).
 * Orquesta la validación secuencial de visibilidad (`waitVisible`) y habilitación (`waitEnabled`).
 * Usada por `clickSafe` como paso de sincronización previo al clic físico.
 *
 * @param driver - Instancia activa de WebDriver para la sesión actual.
 * @param element - WebElement a validar. Debe estar previamente localizado en el DOM.
 * @param opts - Opciones de reintento y trazabilidad. Propagadas a todos los sub-llamados internos.
 * @returns {Promise<WebElement>} El mismo elemento una vez confirmado como visible y habilitado.
 */
export async function waitClickable(
  driver: WebDriver,
  element: WebElement,
  opts: RetryOptions = {}
): Promise<WebElement> {

  // Validación de integridad del objeto antes de operar
  if (!element || typeof element.getId !== "function") {
    throw new Error(`Se esperaba un WebElement válido pero se recibió: ${element}`);
  }
  const fullOpts = resolveRetryConfig(opts, 'waitClickable');

  return await retry(async () => {
    try {
      // La combinación de visible + enabled garantiza que el driver pueda interactuar
      await waitVisible(driver, element, fullOpts);
      await waitEnabled(driver, element, fullOpts);

      return element;

    } catch (err: unknown) {
      if (err instanceof error.TimeoutError) {
        err.message = `El elemento no fue interactuable tras ${fullOpts.timeoutMs / 1000}s. ${err.message}`;
      }
      throw err;
    }
  }, fullOpts);
}