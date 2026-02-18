import { stackLabel } from "../core/utils/stackLabel.js";
import { DefaultConfig } from "../core/config/default.js";
import { NoteEditorPage } from "../pages/post/note_editor/NoteEditorPage.js";
import logger from "../core/utils/logger.js";
/**
 * Flow: Inicio de creación de nota.
 * Centraliza el acceso al menú de creación a través del PO Maestro.
 */
export async function createNewNote(driver, noteType, opts = {}) {
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "flow:createNewNote")
    };
    const page = new NoteEditorPage(driver, noteType);
    try {
        logger.info(`Abriendo editor para nueva nota: ${noteType}`, { label: config.label });
        // Uso del componente 'creation' expuesto en NoteEditorPage
        await page.creation.selectNoteType(noteType, config);
    }
    catch (error) {
        logger.error(`Error en flujo de creación [${noteType}]: ${error.message}`, { label: config.label });
        throw error;
    }
}
/**
 * Flow: Finalización y salida del editor.
 * Utiliza el getter 'actions' para interactuar con el Header de forma segura.
 */
export async function closeNoteEditor(driver, exitAction, opts = {}) {
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "flow:closeNoteEditor")
    };
    const page = new NoteEditorPage(driver);
    try {
        logger.debug(`Ejecutando salida del editor: ${exitAction}`, { label: config.label });
        /**
         * IMPORTANTE: Aquí llamamos a 'page.actions' (el getter)
         * en lugar de 'page.headerActions' (que es privado).
         */
        await page.actions.clickExitAction(exitAction, config);
        logger.debug(`Editor cerrado exitosamente.`, { label: config.label });
    }
    catch (error) {
        logger.error(`Error en flujo de cierre (${exitAction}): ${error.message}`, { label: config.label });
        throw error;
    }
}
//# sourceMappingURL=noteLifecycleManager.js.map