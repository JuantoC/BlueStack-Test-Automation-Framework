/**
 * TEST CASE: 02 - Creación de Nota tipo Listicle
 * Valida la generación dinámica de ítems y la salida con descarte de cambios.
 */
async function runListicleSession() {
    const sessionLabel = "TC-02_Listicle_Creation";
    // Configuración centralizada
    const opts = {
        ...DefaultConfig,
        label: sessionLabel
    };
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password);
    let driver;
    try {
        logger.info(`>>> Iniciando Sesión: ${sessionLabel} <<<`, { label: sessionLabel });
        // 1. Setup
        driver = await initializeDriver({ isHeadless: false }, opts);
        // 2. Acceso y Autenticación
        await driver.get(authUrl);
        await passLogin(driver, testEditorCredentials, opts);
        // 3. Creación de Listicle
        await createNewNote(driver, NoteType.LISTICLE, opts);
        // 4. Llenado Dinámico 
        await fillNote(driver, listicleData[3], opts);
        // 5. Salida
        await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);
        logger.info(`✅ Prueba ${sessionLabel} finalizada exitosamente.`, { label: sessionLabel });
    }
    catch (error) {
        logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}: ${error.message}`, {
            label: sessionLabel
        });
        throw error;
    }
    finally {
        if (driver) {
            // Dejamos 5 segundos de cortesía para inspección visual antes de cerrar
            await quitDriver(driver, { ...opts, timeoutMs: 5000 });
        }
    }
}
// Bootstrap de la sesión
runListicleSession().catch(() => process.exit(1));
import { listicleData } from "../dataTest/noteData.js";
import { testEditorCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { DefaultConfig } from "../core/config/default.js";
// Core Tools
import { initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import logger from "../core/utils/logger.js";
// Business Flows
import { passLogin } from "../flows/manageAuth.js";
import { fillNote } from "../flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";
// Enums
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";
//# sourceMappingURL=02_NotaLista%20copy.js.map