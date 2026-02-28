import { WebDriver } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../core/config/default.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteData } from "../dataTest/noteDataInterface.js";
import { NoteEditorPage } from "../pages/post_page/note_editor_page/MainEditorPage.js";
import logger from "../core/utils/logger.js";
import * as allure from "allure-js-commons";


/**
 * Flow de Negocio: Rellenado Dinámico de Nota.
 * Procesa únicamente los campos presentes en el objeto 'data'.
 */
export async function fillNote(
  driver: WebDriver,
  data: Partial<NoteData>,
  opts: RetryOptions = {}
): Promise<void> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "fillNote")
  };

  const editor = new NoteEditorPage(driver);

  await allure.step(`Rellenando la nota con datos dinámicos`, async (stepContext) => {
    stepContext.parameter("Data Keys", Object.keys(data).join(", "));
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.info(`Iniciando llenado dinámico de campos presentes en data`, {
        label: config.label
      });

      /**
       * Delegamos la inteligencia al método maestro del NoteEditorPage.
       * Como usamos Partial<NoteData>, fillFullNote ya tiene la lógica de:
       * "Si el campo existe y tiene valor, lo escribo; si no, lo ignoro".
       */
      await editor.fillFullNote(data, config);

      logger.info(`Llenado dinámico finalizado con éxito`, { label: config.label });

    } catch (error: any) {
      // Captura de fallo en el nivel más alto del flujo de edición
      logger.error(`Fallo en el flow de edición: ${error.message}`, {
        label: config.label,
        error: error.message
      });
      throw error;
    }
  });
}