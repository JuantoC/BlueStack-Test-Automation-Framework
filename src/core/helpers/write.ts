import { Key, WebElement } from "selenium-webdriver";
import logger from "../utils/logger.js";
import { stackLabel } from "../utils/stackLabel.js";
import { getErrorMessage } from "../utils/errorUtils.js";

/**
 * Escribe texto en elementos con atributo `contenteditable` (como editores CKEditor).
 * Usa `sendKeys` con Ctrl+A y Delete para limpiar el contenido previo antes de escribir,
 * simulando la interacción real del teclado. Llamada por `writeSafe` cuando `isContentEditable` retorna `true`.
 *
 * @param element - WebElement editable objetivo. Debe tener `contenteditable="true"` o `role="textbox"`.
 * @param text - Texto a ingresar, sin sanitizar. Se escribe tal cual usando sendKeys.
 * @param label - Contexto de trazabilidad para logs. Propagado desde el orquestador superior.
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
      label: configLabel,
      error: getErrorMessage(error)
    });

    throw error;
  }
}

/**
 * Escribe texto en elementos de input estándar (`input`, `textarea`).
 * Utiliza Ctrl+A + Backspace + texto en un único `sendKeys` para minimizar latencia
 * y reducir la probabilidad de que el DOM cambie a mitad de la escritura.
 * Llamada por `writeSafe` cuando `isContentEditable` retorna `false`.
 *
 * @param element - WebElement de input estándar objetivo.
 * @param text - Texto a ingresar, sin sanitizar.
 * @param label - Contexto de trazabilidad para logs. Propagado desde el orquestador superior.
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

  } catch (error: unknown) {
    const isStale = (error instanceof Error && error.name === 'StaleElementReferenceError') || getErrorMessage(error).includes('stale');

    logger.error(`Fallo al escribir en input estándar.`, {
      label: configLabel,
      error: getErrorMessage(error),
      suggestion: isStale ? "El elemento murió durante la escritura. El retry superior debe manejarlo." : "Verificar si el elemento es interactuable."
    });

    throw error;
  }
}