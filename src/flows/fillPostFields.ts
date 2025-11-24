import { writeSafe } from "../core/actions/writeSafe.js";
import { NoteDataInterface } from "../Data-Test/Note-Creation-Interface.js";
import { WebDriver } from "selenium-webdriver";
import { createPostPage } from "../pages/createPostPage.js";
import '../core/utils/assertValueEquals.js'
import { assertValueEquals } from '../core/utils/assertValueEquals.js';
import { RetryOptions } from "../core/wrappers/retry.js";
import { stackLabel } from "../core/utils/stackLabel";

/**
 * Rellena los campos de un post en la página de creación de posts.
 * @param driver La instancia del WebDriver.
 * @param postData Objeto que contiene los datos del post.
 * @param timeout Tiempo máximo de espera para cada campo.
 */
export async function fillPostFields(driver: WebDriver, postData: NoteDataInterface, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
  const fullOpts = { ...opts, label: stackLabel(opts.label, `fillPostFields`) };
  const Locators = createPostPage;
  const fieldMap = {
    title: Locators.mainTitleField,
    subtitle: Locators.subTitleField,
    halfTitle: Locators.halfTitleField,
    body: Locators.bodyField,
    summary: Locators.summaryField,
    authorName: Locators.authorNameField,
    authorDescription: Locators.authorDescriptionField
  };

  console.log(`[${fullOpts.label}] Iniciando el llenado de campos del post.`);
  for (const key of Object.keys(fieldMap) as (keyof typeof fieldMap)[]) {
    const text = (postData as any)[key];

    if (text && typeof text === "string" && text.trim() !== "") {
      const locator = fieldMap[key];
      console.log(`Rellenando campo "${key}"`);
      const element = await writeSafe(driver, locator, text, timeout, fullOpts );

      await assertValueEquals(driver, element, locator, text,
        `El campo "${key}" no coincide con el valor esperado.`
      );

    }

    // Manejar Notas Listas SIN ARMAR AÚN!!!!!!!!!!!!!!!!!
    await handleListicleFields(driver, postData, timeout);
  }

  async function handleListicleFields(
    driver: WebDriver,
    postData: NoteDataInterface,
    timeout: number
  ) {
    const listicleTitleLocator = Locators.listicleTitleField;
    const listicleBodyLocator = Locators.listicleBodyField;

    if (postData.listicleTitle) {
      for (let i = 0; i < postData.listicleTitle.length; i++) {
        const text = postData.listicleTitle[i];
        if (!text) continue;

        const element = await writeSafe(driver, listicleTitleLocator(i), text);
        const actualValue = await element.getAttribute("value");

        assert.equal(
          actualValue,
          text,
          `El título de lista en índice ${i} no coincide con lo esperado.`
        );

        console.log(`ListicleTitle[${i}] escrito exitosamente: "${actualValue}"`);
      }
    }

    if (postData.listicleBody) {
      for (let i = 0; i < postData.listicleBody.length; i++) {
        const text = postData.listicleBody[i];
        if (!text) continue;

        const element = await writeSafe(driver, listicleBodyLocator(i), text);
        const actualValue = await element.getAttribute("value");

        assert.equal(
          actualValue,
          text,
          `El cuerpo de lista en índice ${i} no coincide con lo esperado.`
        );

        console.log(`ListicleBody[${i}] escrito exitosamente: "${actualValue}"`);
      }
    }
  }
}