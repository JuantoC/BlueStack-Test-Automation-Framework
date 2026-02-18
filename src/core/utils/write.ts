import { Key, WebElement } from "selenium-webdriver";
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
    logger.debug("Limpiando contenteditable via CTRL+ A + DELETE", {
      label: configLabel
    });

    await element.sendKeys(
      Key.chord(Key.CONTROL, "a"),
      Key.DELETE
    );

    await element.sendKeys(text);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    logger.error(`Error en escritura editable: ${message}`, {
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