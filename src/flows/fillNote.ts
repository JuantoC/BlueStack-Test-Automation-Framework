import { WebDriver } from "selenium-webdriver";
import { RetryOptions, DefaultConfig } from "../core/config/default.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteData } from "../dataTest/noteDataInterface.js";
import { NoteEditorPage } from "../pages/post/note_editor/NoteEditorPage.js";
import logger from "../core/utils/logger.js";

/**
 * Orquestador de negocio para completar el formulario de una nota.
 * Centraliza la configuración en el objeto opts para mayor flexibilidad.
 * * @param driver - Instancia de WebDriver.
 * @param data - Datos de la nota a ingresar.
 * @param opts - Opciones extendidas incluyendo timeoutMs y trazabilidad.
 */
export async function fillNote(
  driver: WebDriver,
  data: NoteData,
  opts: RetryOptions = {}
): Promise<void> {
  // 1. Unificamos la configuración. 
  // Ahora timeoutMs viene dentro de opts, si no existe, toma el DefaultConfig.
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "fillNote")
  };

  const page = new NoteEditorPage(driver);

  try {
    // 2. Log de hito de negocio.
    logger.info(`Iniciando llenado de nota: "${data.title || 'Untitled'}"`, {
      label: config.label
    });

    // 3. Delegación al Page Object. 
    // Pasamos el objeto config completo que ya contiene el timeoutMs.
    await page.fillFields(data, config);

    logger.debug(`Proceso fillNote finalizado exitosamente.`, {
      label: config.label
    });

  } catch (error: any) {
    // Trazabilidad forense sin realizar operaciones costosas.
    logger.error(`Fallo crítico al completar la nota: ${error.message}`, {
      label: config.label,
      context: { title: data.title, timeoutMs: config.timeoutMs }
    });
    throw error;
  }
}