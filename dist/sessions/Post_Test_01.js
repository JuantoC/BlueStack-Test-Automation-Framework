/**
 * TEST CASE: Creación de Nota tipo Post - 01
 * Valida el ciclo completo desde el login hasta el persistido en base de datos.
 */
async function runNoteCreationSession() {
    const sessionLabel = "Post_TC-01";
    // Unificamos configuración global para esta sesión
    const opts = {
        ...DefaultConfig,
        label: sessionLabel
    };
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password);
    let session = null;
    try {
        logger.info(`>>> Iniciando Sesión de Prueba: ${sessionLabel} <<<`, { label: sessionLabel });
        // 1. Setup del Entorno
        session = await initializeDriver({ isHeadless: false });
        const driver = session.driver;
        // 2. Acceso y Autenticación
        await driver.get(authUrl);
        await passLogin(driver, testEditorCredentials, opts);
        // 3. Creación de Nota tipo Post
        await createNewNote(driver, NoteType.POST, opts);
        // 4. Llenado Dinámico de la Nota
        await fillNote(driver, notesData[3], opts);
        // 5. Salida
        await closeNoteEditor(driver, NoteExitAction.SAVE_ONLY, opts);
        logger.info(`✅ Prueba ${sessionLabel} finalizada exitosamente.`, { label: sessionLabel });
    }
    catch (error) {
        if (error instanceof Error) {
            let errorMessage = error.message;
            const diff = error?.diff;
            if (diff) {
                errorMessage += `\n>>> DETALLE DEL FALLO DE TEXTO <<<${diff}`;
            }
            logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}`, {
                label: sessionLabel,
                stack: error.stack,
                details: errorMessage
            });
            throw error;
        }
    }
    finally {
        if (session) {
            await checkConsoleErrors(session.driver, sessionLabel);
            logger.info("Limpiando entorno y cerrando sesión...", { label: sessionLabel });
            await quitDriver(session, opts);
        }
    }
}
// Ejecución controlada
runNoteCreationSession().catch(() => {
    process.exit(1);
});
import { notesData } from "../dataTest/noteData.js";
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
import { checkConsoleErrors } from "../core/utils/browserLogs.js";
//# sourceMappingURL=Post_Test_01.js.map