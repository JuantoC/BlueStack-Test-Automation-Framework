/**
 * Valida que el contenido de un elemento coincida con un valor esperado.
 * Posee capacidad de reintento autónoma o suprimida por orquestadores superiores.
 * * @param element - El WebElement a inspeccionar.
 * @param locator - Locator original para trazabilidad en errores.
 * @param expected - Valor que se espera encontrar.
 * @param opts - Opciones de reintento y trazabilidad.
*/
export async function assertValueEquals(
  element: WebElement,
  locator: Locator,
  expected: string,
  opts: RetryOptions = {}
): Promise<void> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "assertValueEquals"),
  };

  return await retry(async () => {
    try {
      const isEditable = await isContentEditable(element);
      if (!isEditable && expected.endsWith("\n")) {
        return;
      }

      // ... (código de extracción igual que antes) ...
      let actual: string;
      if (isEditable) {
        actual = await element.getDriver().executeScript<string>(
          "return (arguments[0].innerText || arguments[0].textContent || '').trim();",
          element
        );
      } else {
        actual = (await element.getAttribute("value")) ?? "";
      }

      const normalizedActual = isEditable ? normalizeEditableText(actual) : actual;
      const normalizedExpected = isEditable ? normalizeEditableText(expected) : expected;

      if (normalizedActual !== normalizedExpected) {

        const diffIndex = getFirstDiffIndex(normalizedExpected, normalizedActual);

        if (diffIndex !== -1) {
          const contextStart = Math.max(0, diffIndex - 20);
          const contextEnd = diffIndex + 20;

          const expectedSnippet = normalizedExpected.slice(contextStart, contextEnd);
          const actualSnippet = normalizedActual.slice(contextStart, contextEnd);

          // --- MEJORA DEL MENSAJE DE ERROR ---
          // Obtenemos los códigos ASCII/Unicode para desambiguar caracteres invisibles o parecidos
          const expChar = diffIndex < normalizedExpected.length
            ? normalizedExpected.charCodeAt(diffIndex)
            : 'EOF'; // End of File/String

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
            `Valor no coincide para ${locator.toString()}.
>> Diferencia en índice ${diffIndex}:
   Esperado: [${expChar}] '${expCharStr}' 
   Obtenido: [${actChar}] '${actCharStr}'
--------------------------------------------------
Esperado (frag): "...${expectedSnippet}..."
Obtenido (frag): "...${actualSnippet}..."`
          );
        }

        // fallback
        throw new Error(
          `Valor no coincide para ${locator.toString()}. Longitud ${normalizedExpected.length} vs ${normalizedActual.length}`
        );
      }

      // Log de éxito en DEBUG para no ensuciar si sale bien a la primera
      logger.debug(`Validación exitosa: Valor coincide.`, { label: config.label });

    } catch (error: any) {
      throw error;
    }
  }, config);
}

export function normalizeEditableText(text: string): string {
  if (!text) return "";

  return text
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\r\n/g, "\n")       // Unificar saltos de línea Windows
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


import { WebElement, Locator } from "selenium-webdriver";
import { isContentEditable } from "./isContentEditable.js";
import { stackLabel } from "../utils/stackLabel.js";
import { DefaultConfig, RetryOptions } from "../config/default.js";
import { retry } from "../wrappers/retry.js";
import logger from "../utils/logger.js";