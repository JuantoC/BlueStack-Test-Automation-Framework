import { writeSafe } from "../actions/writeSafe.js";
import { NoteDataInterface } from "../../dataTest/noteDataInterface.js";
import { WebDriver, Locator } from "selenium-webdriver";
import { noteEditorPage, LOCATOR_SUFFIX } from "../../pages/post/note_editor/noteEditor.js";
import { assertValueEquals } from '../utils/assertValueEquals.js';
import { RetryOptions } from "../wrappers/retry.js";
import { stackLabel } from "../utils/stackLabel.js";
import { handleListicleFields } from "./handleListicleFields.js";
import { handleTagsFields } from "./handleTagsFields.js";
const SPECIAL_HANDLING_KEYS: (keyof NoteDataInterface)[] = [
  'tags',
  'hiddenTags',
  'listicleTitle',
  'listicleBody',
];
/**
 * Rellena los campos de un post en la página de creación de posts.
 * @param driver La instancia del WebDriver.
 * @param postData Objeto que contiene los datos del post.
 * @param timeout Tiempo máximo de espera para cada campo.
 */
export async function fillPostFields(driver: WebDriver, postData: NoteDataInterface, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
  const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `fillPostFields`) }

  console.log(`[${fullOpts.label}]`);
  const dataKeys = Object.keys(postData) as (keyof NoteDataInterface)[];

  for (const key of dataKeys) {
    const value = postData[key];

    if (SPECIAL_HANDLING_KEYS.includes(key)) {

      // Lógica para Tags y HiddenTags (si son arrays y existen en la data)
      if (key === 'tags' || key === 'hiddenTags') {
        const locatorName = key + LOCATOR_SUFFIX; // "tagsField"
        const locator = (noteEditorPage.textFields as any)[locatorName];

        if (Array.isArray(value) && value.length > 0 && locator) {
          await handleTagsFields(driver, value as string[], locator, timeout, fullOpts);
        }
      }
      continue;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const locator: Locator | undefined = (noteEditorPage.textFields as any)[key + LOCATOR_SUFFIX];

      if (locator) {
        console.log(`[Rellenando ${key} ...]`);
        const element = await writeSafe(driver, locator, value, timeout, fullOpts);
        await assertValueEquals(driver, element, locator, value,
          `El valor del campo "${key}" no coincide con el valor esperado.`
        );
      } else {
        console.warn(`[${fullOpts.label}] Advertencia: Campo "${key}" existe en la data, pero no se encontró el locator "${key + LOCATOR_SUFFIX}" en /page/post.`);
      }
    }
  }

  if (postData.listicleTitle && postData.listicleBody) {
    await handleListicleFields(driver, postData, timeout, fullOpts);
  }
}