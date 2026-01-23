import { WebDriver } from "selenium-webdriver";
import { postUrl } from "../utils/routes.js";
import { stackLabel } from "../utils/stackLabel.js";
import logger from "../utils/logger.js";

/**
 * Navega directamente a la página de edición de un post específico.
 * * @param driver - Instancia activa de WebDriver.
 * @param baseURL - URL base del entorno (ej: staging, prod).
 * @param id - Identificador único del post (numérico o string).
 * @param label - Label de trazabilidad opcional.
 */
export async function goToPost(
  driver: WebDriver,
  baseURL: string,
  id: number | string,
  label?: string
): Promise<void> {
  const configLabel = stackLabel(label, "goToPost");
  const url = postUrl(baseURL, id);

  try {
    // Debug: Registramos la URL exacta antes de la acción para facilitar replicación manual.
    logger.debug(`Preparando navegación hacia Post ID: ${id}. URL objetivo: ${url}`, {
      label: configLabel
    });

    await driver.navigate().to(url);

    // Info: Confirmamos que el comando de navegación fue enviado y procesado.
    logger.info(`Navegación exitosa al post [ID: ${id}]`, {
      label: configLabel
    });

  } catch (error: any) {
    // Error: Si la navegación falla (ej. URL mal formada o timeout de red).
    logger.error(`Error al intentar navegar al post ${id}: ${error.message}`, {
      label: configLabel,
      url // Incluimos la URL en la metadata del error para debugging rápido.
    });
    throw error;
  }
}