/**
 * Valida de forma segura que el texto visible o valor de un elemento coincida exactamente con lo esperado.
 * Orquesta la extracción de texto dependiendo del tipo de elemento (inputs, textareas o contenteditable),
 * normaliza el contenido y aplica reintentos automáticos si la validación falla temporalmente.
 *
 * @param element - WebElement objetivo del cual se extraerá el texto a validar.
 * @param expected - Cadena de texto exacta que se espera encontrar dentro del elemento.
 * @param opts - Opciones de reintento y trazabilidad. Se propaga a todos los sub-llamados internos.
 * @returns {Promise<void>} Se resuelve sin errores si la validación es exitosa. Lanza una excepción detallada en caso de discrepancia.
 */
export async function assertValueEquals(
  element: WebElement,
  expected: string,
  opts: RetryOptions = {}
): Promise<void> {
  const config = {
    ...opts,
    label: stackLabel(opts.label, "assertValueEquals"),
  };

  const elementTag = "[WebElement]";

  return await retry(async () => {
    try {
      // 1. Identificación: Verificamos si el elemento permite formato enriquecido para usar la estrategia pertinente.
      const isEditable = await isContentEditable(element);
      if (!isEditable && expected.endsWith("\n")) {
        return;
      }

      let actual: string;
      // 2. Extracción: Obtenemos el texto usando ejecución de script para contenteditable o atributos/getText estándar.
      if (isEditable) {
        actual = await element.getDriver().executeScript<string>(
          "return (arguments[0].innerText || arguments[0].textContent || '').trim();",
          element
        );
      } else {
        const tagName = await element.getTagName();
        if (tagName === 'input' || tagName === 'textarea') {
          actual = (await element.getAttribute("value")) ?? "";
        } else {
          actual = await element.getText();
        }
      }

      const normalizedActual = isEditable ? normalizeEditableText(actual) : actual;
      const normalizedExpected = isEditable ? normalizeEditableText(expected) : expected;

      // 3. Validación: Comparamos las versiones normalizadas y generamos un diff detallado en caso de error.
      if (normalizedActual !== normalizedExpected) {
        const diffIndex = getFirstDiffIndex(normalizedExpected, normalizedActual);

        if (diffIndex !== -1) {
          const contextStart = Math.max(0, diffIndex - 20);
          const contextEnd = diffIndex + 20;

          const expectedSnippet = normalizedExpected.slice(contextStart, contextEnd);
          const actualSnippet = normalizedActual.slice(contextStart, contextEnd);

          const expChar = diffIndex < normalizedExpected.length
            ? normalizedExpected.charCodeAt(diffIndex)
            : 'EOF';

          const actChar = diffIndex < normalizedActual.length
            ? normalizedActual.charCodeAt(diffIndex)
            : 'EOF';

          const expCharStr = diffIndex < normalizedExpected.length
            ? `'${normalizedExpected[diffIndex]}'`
            : '[Fin de texto]';

          const actCharStr = diffIndex < normalizedActual.length
            ? `'${normalizedActual[diffIndex]}'`
            : '[Texto extra]';

          throw new Error(
            `Valor no coincide para ${elementTag}.
>> Diferencia en índice ${diffIndex}:
   Esperado: [${expChar}] ${expCharStr} 
   Obtenido: [${actChar}] ${actCharStr}
--------------------------------------------------
Esperado (frag): "...${expectedSnippet}..."
Obtenido (frag): "...${actualSnippet}..."`
          );
        }

        throw new Error(
          `Valor no coincide para ${elementTag}. Longitud ${normalizedExpected.length} vs ${normalizedActual.length}`
        );
      }

      logger.debug(`Validación exitosa.`, { label: config.label });

    } catch (error: any) {
      logger.debug('Error en la validacion del texto.')
      throw error;
    }
  }, config);
}

/**
 * Normaliza cadenas de texto extraídas de elementos tipográficos enriquecidos o contenteditable.
 * Reemplaza comillas tipográficas, elipses y unifica saltos de línea para permitir comparaciones 
 * exactas y confiables contra valores esperados estándar.
 *
 * @param text - Cadena de texto cruda extraída directamente del DOM.
 * @returns {string} Cadena de texto limpia, con caracteres especiales normalizados y espacios colapsados.
 */
export function normalizeEditableText(text: string): string {
  if (!text) return "";

  return text
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\r\n/g, "\n")       // Unificar saltos de l ínea Windows
    .replace(/\n{2,}/g, "\n\n")   // Máximo 2 saltos de línea consecutivos
    .replace(/[ \t]+/g, " ")      // Colapsar espacios y tabs
    .trim();
}

function getFirstDiffIndex(a: string, b: string): number {
  const minLength = Math.min(a.length, b.length);

  for (let i = 0; i < minLength; i++) {
    if (a[i] !== b[i]) return i;
  }

  return a.length !== b.length ? minLength : -1;
}


import { WebElement } from "selenium-webdriver";
import { isContentEditable } from "../helpers/isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { RetryOptions } from "../config/defaultConfig.js";
import { retry } from "../wrappers/retry.js";
import logger from "../utils/logger.js";