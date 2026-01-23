import { noteData } from "../dataTest/noteData.js";
import { testEditorCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { DefaultConfig } from "../core/config/default.js";
// Herramientas Core
import { initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import logger from "../core/utils/logger.js";
// Business Flows (La capa de inteligencia)
import { passLogin } from "../flows/manageAuth.js";
import { fillNote } from "../flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";
// Enums de Dominio
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";
/**
 * TEST CASE: 01 - Creación y Guardado de Nota Estándar (Post)
 * Valida el ciclo completo desde el login hasta el persistido en base de datos.
 */
async function runNoteCreationSession() {
    const sessionLabel = "TC-01_Note_Creation";
    // Unificamos configuración global para esta sesión
    const opts = {
        ...DefaultConfig,
        label: sessionLabel
    };
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password);
    let driver;
    try {
        logger.info(`>>> Iniciando Sesión de Prueba: ${sessionLabel} <<<`, { label: sessionLabel });
        // 1. Setup del Entorno
        driver = await initializeDriver({ isHeadless: false });
        // 2. Ejecución del Circuito de Negocio (Business Flows)
        await driver.get(authUrl);
        await passLogin(driver, testEditorCredentials, opts);
        await createNewNote(driver, NoteType.POST, opts);
        // Usamos la data del set de pruebas #1
        await fillNote(driver, noteData[1], opts);
        // Definimos un timeout específico para el cierre/guardado que suele ser más pesado
        await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT, {
            ...opts,
            timeoutMs: 15000
        });
        logger.info(`✅ Prueba ${sessionLabel} finalizada exitosamente.`, { label: sessionLabel });
    }
    catch (error) {
        logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}: ${error.message}`, {
            label: sessionLabel,
            stack: error.stack
        });
        // Permitimos que el error se propague para que el runner lo detecte
        throw error;
    }
    finally {
        if (driver) {
            logger.info("Limpiando entorno y cerrando sesión...", { label: sessionLabel });
            await quitDriver(driver, opts);
        }
        // process.exit() solo se recomienda si este es el único punto de entrada de la app
        // En un framework de testing, el runner se encarga de esto.
    }
}
// Ejecución controlada
runNoteCreationSession().catch(() => {
    // Evitamos 'UnhandledPromiseRejectionWarning'
    process.exit(1);
});
//# sourceMappingURL=01_Test.js.map