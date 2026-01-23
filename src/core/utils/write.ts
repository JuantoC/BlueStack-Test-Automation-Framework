import { WebElement } from "selenium-webdriver";
import logger from "../utils/logger.js";
import { stackLabel } from "../utils/stackLabel.js";

/**
 * Escribe texto en elementos con atributo contenteditable utilizando JS para el foco 
 * y limpieza, y sendKeys para la simulación de teclado.
 */
export async function writeToEditable(
  element: WebElement,
  text: string,
  label?: string
): Promise<void> {
  const configLabel = stackLabel(label, "writeToEditable");

  try {
    logger.debug("Preparando elemento contenteditable (focus & clear via JS)", {
      label: configLabel
    });

    const driver = element.getDriver();
    // Limpiamos e inyectamos foco vía script para asegurar receptividad
    await driver.executeScript(
      "arguments[0].focus(); arguments[0].innerHTML = '';",
      element
    );

    await element.sendKeys(text);
  } catch (error: any) {
    logger.error(`Error en escritura editable: ${error.message}`, {
      label: configLabel
    });
    throw error;
  }
}

/**
 * Escribe texto en elementos de input estándar (input, textarea).
 */
export async function writeToStandard(
  element: WebElement,
  text: string,
  label?: string
): Promise<void> {
  const configLabel = stackLabel(label, "writeToStandard");

  try {
    logger.debug("Limpiando campo estándar e ingresando texto", {
      label: configLabel
    });

    await element.clear();
    await element.sendKeys(text);
  } catch (error: any) {
    logger.error(`Error en escritura estándar: ${error.message}`, {
      label: configLabel
    });
    throw error;
  }
}