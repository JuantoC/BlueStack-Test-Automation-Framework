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
    const cmdCtrl = process.platform === 'darwin' ? Key.COMMAND : Key.CONTROL; // Mac o Windows

    // 1. Enviamos la secuencia de borrado + el texto nuevo en un comando,
    // reduce la latencia y la probabilidad de que el DOM cambie a mitad de camino.
    await element.sendKeys(Key.chord(cmdCtrl, "a"), Key.BACK_SPACE, text);

  } catch (error: any) {
    const isStale = error.name === 'StaleElementReferenceError' || error.message?.includes('stale');

    logger.error(`Fallo al escribir en input estándar.`, {
      label: configLabel,
      error: error.message,
      suggestion: isStale ? "El elemento murió durante la escritura. El retry superior debe manejarlo." : "Verificar si el elemento es interactuable."
    });

    throw error;
  }
}