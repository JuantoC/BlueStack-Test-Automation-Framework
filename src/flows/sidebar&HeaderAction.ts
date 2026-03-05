import { WebDriver } from "selenium-webdriver";
import { stackLabel } from "../core/utils/stackLabel.js";
import { DefaultConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { NoteType, SidebarOption, SidebarSection } from "../pages/post_page/SidebarSection.js";
import { NoteEditorPage } from "../pages/post_page/note_editor_page/MainEditorPage.js";
import { NoteExitAction } from "../pages/post_page/note_editor_page/EditorHeaderActions.js";
import logger from "../core/utils/logger.js";
import { step } from "allure-js-commons";

export async function moveToComponent(driver: WebDriver, component: SidebarOption, opts: RetryOptions): Promise<SidebarSection> {
  const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "moveToComponent") };
  const page = new SidebarSection(driver, config)

  await step(`Moverse hacia el componente ${component}`, async (stepContext) => {
    stepContext.parameter('Component', component)

    try {
      await page.goToComponent(component)
    } catch (error) {
      throw error;
    }
  })
  return page;
}

/** 
 * Flow: Inicio de creación de nota.
 * Centraliza el acceso al menú de creación a través del PO Maestro.
 */
export async function createNewNote(driver: WebDriver, noteType: NoteType, opts: RetryOptions): Promise<NoteEditorPage> {
  const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "createNewNote") };
  const page = new NoteEditorPage(driver, config, noteType);

  await step(`Crear nueva nota: ${noteType}`, async (stepContext) => {
    stepContext.parameter("Note Type", noteType);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.info(`Abriendo editor para nueva nota: ${noteType}`, { label: config.label });
      await page.creation.selectNoteType(noteType);
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
export async function closeNoteEditor(driver: WebDriver, exitAction: NoteExitAction, opts: RetryOptions = {}): Promise<void> {
  const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "closeNoteEditor") };
  const page = new NoteEditorPage(driver, config);

  await step(`Cerrar editor de nota con acción: ${exitAction}`, async (stepContext) => {
    stepContext.parameter("Exit Action", exitAction);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.info(`Ejecutando salida del editor: ${exitAction}`, { label: config.label });
      await page.actions.clickExitAction(exitAction);
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