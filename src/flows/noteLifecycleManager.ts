import { WebDriver } from "selenium-webdriver";
import { stackLabel } from "../core/utils/stackLabel.js";
import { DefaultConfig, RetryOptions } from "../core/config/default.js";
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { NoteEditorPage } from "../pages/post/note_editor/NoteEditorPage.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";
import logger from "../core/utils/logger.js";

/**
 * Orquestador para iniciar la creación de una nueva nota.
 * Selecciona el tipo de nota desde el dropdown inicial.
 */
export async function createNewNote(
  driver: WebDriver,
  noteType: NoteType,
  opts: RetryOptions = {}
): Promise<void> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "createNewNote")
  };

  const page = new NoteEditorPage(driver);

  try {
    logger.info(`Iniciando creación de nota tipo: ${noteType}`, {
      label: config.label
    });

    // Delegamos al sub-componente del Page Object
    await page.creationDropdow.selectNoteType(noteType, config);

    logger.debug(`Tipo de nota "${noteType}" seleccionado correctamente.`, {
      label: config.label
    });
  } catch (error: any) {
    logger.error(`Error al seleccionar el tipo de nota [${noteType}]: ${error.message}`, {
      label: config.label
    });
    throw error;
  }
}

/**
 * Orquestador para cerrar el editor de notas.
 * Ejecuta la acción de salida (Guardar, Descartar, etc.) desde el header.
 */
export async function closeNoteEditor(
  driver: WebDriver,
  exitAction: NoteExitAction,
  opts: RetryOptions = {}
): Promise<void> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "closeNoteEditor")
  };

  const page = new NoteEditorPage(driver);

  try {
    logger.info(`Cerrando editor con acción: ${exitAction}`, {
      label: config.label
    });

    // Delegamos al componente del Header
    await page.headerActions.clickExitAction(exitAction, config);

    logger.debug(`Acción de salida "${exitAction}" ejecutada con éxito.`, {
      label: config.label
    });
  } catch (error: any) {
    logger.error(`Fallo al cerrar el editor mediante ${exitAction}: ${error.message}`, {
      label: config.label
    });
    throw error;
  }
}