/**
 * TEST CASE: Creación de Nota tipo LiveBlog - 01
 * Valida la generación dinámica de ítems y la salida con descarte de cambios.
 */
async function runLiveBlogSession(): Promise<void> {
    const sessionLabel = "LiveBlog_TC-01";

    // Configuración centralizada
    const opts: RetryOptions = {
        ...DefaultConfig,
        label: sessionLabel
    };

    const authUrl = getAuthUrl(
        MainConfig.BASE_URL,
        basicAuthCredentials.username,
        basicAuthCredentials.password
    );

    let session: DriverSession | null = null;

    try {
        logger.info(`>>> Iniciando Sesión: ${sessionLabel} <<<`, { label: sessionLabel });

        // 1. Setup
        session = await initializeDriver({ isHeadless: false }, opts);
        const driver = session.driver;

        // 2. Acceso y Autenticación
        await driver.get(authUrl);
        await passLogin(driver, testEditorCredentials, opts);

        // 3. Creación de LiveBlog
        await createNewNote(driver, NoteType.LIVEBLOG, opts);

        // 4. Llenado Dinámico 
        await fillNote(driver, LiveBlogData[0], opts);

        // 5. Salida
        await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);

        logger.info(`✅ Prueba ${sessionLabel} finalizada exitosamente.`, { label: sessionLabel });

    } catch (error: any) {
        if (error instanceof Error) {
            let errorMessage = error.message;

            const diff = (error as any)?.diff;
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
    } finally {
        if (session) {
            await checkConsoleErrors(session.driver, sessionLabel)
            logger.info("Limpiando entorno y cerrando sesión...", { label: sessionLabel });
            await quitDriver(session, opts);
        }
    }
}

// Bootstrap de la sesión
runLiveBlogSession().catch(() => process.exit(1));

import { LiveBlogData } from "../dataTest/noteData.js";
import { testEditorCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { DefaultConfig, RetryOptions } from "../core/config/default.js";

// Core Tools
import { DriverSession, initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import logger from "../core/utils/logger.js";

// Business Flows
import { passLogin } from "../flows/manageAuth.js";
import { fillNote } from "../flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../flows/noteLifecycleManager.js";

// Enums
import { NoteType } from "../pages/post/note_editor/NoteCreationDropdown.js";
import { checkConsoleErrors } from "../core/utils/browserLogs.js";
import { NoteExitAction } from "../pages/post/note_editor/NoteHeaderActions.js";

