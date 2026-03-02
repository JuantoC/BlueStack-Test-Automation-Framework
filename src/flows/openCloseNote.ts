import { WebDriver } from "selenium-webdriver";
import { stackLabel } from "../core/utils/stackLabel.js";
import { DefaultConfig, RetryOptions } from "../core/config/default.js";
import { NoteType } from "../pages/post_page/SideBarNewNoteBtn.js";
import { NoteEditorPage } from "../pages/post_page/note_editor_page/MainEditorPage.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import logger from "../core/utils/logger.js";
import { step, parameter, attachment } from "allure-js-commons";

/**
 * Flow: Inicio de creación de nota.
 * Centraliza el acceso al menú de creación a través del PO Maestro.
 */
export async function createNewNote(
  driver: WebDriver,
  noteType: NoteType,
  opts: RetryOptions = {}
): Promise<NoteEditorPage> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "createNewNote")
  };

  const page = new NoteEditorPage(driver, noteType);

  await step(`Creando nueva nota: ${noteType}`, async (stepContext) => {
    stepContext.parameter("Note Type", noteType);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.info(`Abriendo editor para nueva nota: ${noteType}`, { label: config.label });
      await page.creation.selectNoteType(noteType, config);
      logger.debug(`Editor de nota abierto exitosamente para tipo: ${noteType}`, { label: config.label });
    } catch (error: any) {
      logger.error(`Error en flujo de creación [${noteType}]: ${error.message}`, { label: config.label });
      throw error;
    }
  });
  return page;
}

/**
 * Flow: Finalización y salida del editor.
 * Utiliza el getter 'actions' para interactuar con el Header de forma segura.
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

  await step(`Cerrando editor de nota con acción: ${exitAction}`, async (stepContext) => {
    stepContext.parameter("Exit Action", exitAction);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.info(`Ejecutando salida del editor: ${exitAction}`, { label: config.label });
      await page.actions.clickExitAction(exitAction, config);
      logger.info(`Editor cerrado exitosamente.`, { label: config.label });

    } catch (error: any) {
      logger.error(`Error en flujo de cierre (${exitAction}): ${error.message}`, { 
        label: config.label,
        exitAction: exitAction,
        error: error.message
      });
      throw error;
    }
  });
}