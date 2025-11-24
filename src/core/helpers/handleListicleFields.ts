import { WebDriver } from "selenium-webdriver";
import { writeSafe } from "../actions/writeSafe.js";
import { assertValueEquals } from "../utils/assertValueEquals.js";
import { RetryOptions } from "../wrappers/retry.js";
import { PostPage } from "../../pages/post.js";
import { NoteDataInterface } from "../../dataTest/noteDataInterface.js";
import { stackLabel } from "../utils/stackLabel.js";

/**
 * Maneja el llenado de los campos dinámicos de Listicles.
 * Se asume que listicleTitle y listicleBody tienen la misma longitud.
 */
export async function handleListicleFields(driver: WebDriver, postData: NoteDataInterface, timeout: number, opts: RetryOptions): Promise<void> {
  const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `handleListicleFields`) }

  const titles = postData.listicleTitle;
  const bodies = postData.listicleBody;
  if (!titles || !bodies || titles.length === 0 || bodies.length === 0) {
    console.log(`[handleListicleFields] No hay datos de entradas para procesar.`);
    return;
  }
  const maxItems = Math.min(titles.length, bodies.length);


  // NOTA: Aca incluir la lógica para añadir entradas si el número actual de entradas en la UI 
  // es menor que 'maxItems'. Por simplicidad, asumimos que las entradas ya existen.

  console.log(`[handleListicleFields] Procesando ${maxItems} entradas.`);
  for (let i = 0; i < maxItems; i++) {
    const uiIndex = i + 1;

    const titleText = titles[i];
    if (titleText && titleText.trim() !== "") {
      const titleLocator = PostPage.getListicleFieldLocator('title', uiIndex);
      console.log(`[handleListicleFields] Rellenando Listicle #${uiIndex} Título`);

      const titleElement = await writeSafe(driver, titleLocator, titleText, timeout, fullOpts);
      await assertValueEquals(driver, titleElement, titleLocator, titleText,
        `Listicle #${uiIndex} Título no coincide.`
      );
    }

    const bodyText = bodies[i];
    if (bodyText && bodyText.trim() !== "") {
      const bodyLocator = PostPage.getListicleFieldLocator('body', uiIndex);
      console.log(`[handleListicleFields] Rellenando Listicle #${uiIndex} Cuerpo`);

      const bodyElement = await writeSafe(driver, bodyLocator, bodyText, timeout, fullOpts);
      await assertValueEquals(driver, bodyElement, bodyLocator, bodyText,
        `Listicle #${uiIndex} Cuerpo no coincide.`
      );
    }
  }
}