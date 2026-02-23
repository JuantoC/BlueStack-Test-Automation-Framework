/**
 * TEST CASE: Creación de Nota tipo LiveBlog - 01
 * Valida la generación dinámica de ítems y la salida con descarte de cambios.
 */
runSession("Crear LiveBlog exitosamente", async (sessionLabel: string) => {
    const sessionTransport = addSessionTransport(sessionLabel);
    const opts: RetryOptions = { ...DefaultConfig, label: sessionLabel };

    // Obtenemos credenciales y URL desde el CONFIG centralizado
    const { user, pass } = CONFIG.getCredentials('editor');
    const { user: bUser, pass: bPass } = CONFIG.auth.basic;
    const authUrl = getAuthUrl(CONFIG.baseUrl, bUser, bPass);

    let session: DriverSession | null = null;

    try {
        logger.info(`>>> Iniciando Sesión: ${sessionLabel} <<<`, { label: sessionLabel });

        // 1. Setup
        session = await initializeDriver({
            isHeadless: CONFIG.browser.isHeadless,
            useGrid: CONFIG.grid.useGrid
        }, opts);

        const { driver } = session;

        // 2. Acceso y Autenticación
        await driver.get(authUrl);
        await passLogin(driver, { username: user, password: pass }, opts);

        // 3. Creación de LiveBlog
        await createNewNote(driver, NoteType.LIVEBLOG, opts);

        // 4. Llenado Dinámico 
        await fillNote(driver, LiveBlogData[0], opts);

        // 5. Salida
        await closeNoteEditor(driver, NoteExitAction.BACK_SAVE_AND_EXIT, opts);

        logger.info(`✅ Prueba ${sessionLabel} finalizada exitosamente.`, { label: sessionLabel });

    } catch (error: any) {
        // Evidencia visual solo en caso de error
        if (session?.driver) {
            const screenshot = await session.driver.takeScreenshot();
            await allure.attachment(`Fallo_${sessionLabel}`, Buffer.from(screenshot, 'base64'), 'image/png');
        }

        const msg = error.diff ? `${error.message}\n>>> DIFF <<< ${error.diff}` : error.message;
        logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}`, { label: sessionLabel, details: msg });

        throw error;
    } finally {
        if (session) {
            await checkConsoleErrors(session.driver, sessionLabel)
            logger.info("Limpiando entorno y cerrando sesión...", { label: sessionLabel });
            await quitDriver(session, opts);
        }
    }
});

import * as allure from "allure-js-commons";
import { LiveBlogData } from "../src/dataTest/noteData.js";
import { DefaultConfig, RetryOptions } from "../src/core/config/default.js";

// Core Tools
import { DriverSession, initializeDriver, quitDriver } from "../src/core/actions/driverManager.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import logger, { addSessionTransport } from "../src/core/utils/logger.js";

// Business Flows
import { passLogin } from "../src/flows/manageAuth.js";
import { fillNote } from "../src/flows/fillNote.js";
import { createNewNote, closeNoteEditor } from "../src/flows/noteLifecycleManager.js";

// Enums
import { NoteType } from "../src/pages/post/note_editor/NoteCreationDropdown.js";
import { checkConsoleErrors } from "../src/core/utils/browserLogs.js";
import { NoteExitAction } from "../src/pages/post/note_editor/NoteHeaderActions.js";
import { CONFIG } from "../src/core/config/config.js";
import { runSession } from "../src/core/wrappers/testWrapper.js";

