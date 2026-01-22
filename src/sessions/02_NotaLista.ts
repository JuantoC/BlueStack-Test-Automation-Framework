import { listicleData } from "../dataTest/noteData.js";
import { testEditorCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { NoteType } from "../pages/post/note_editor/noteCreationDropdown.js";
import { initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { fillNote } from "../flows/fillNote.js";
import { passLogin } from "../flows/manageAuth.js";
import { getAuthUrl } from "../core/actions/getAuthURL.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { NoteExitAction } from "../pages/post/note_editor/headerActions.js";
import { closeNoteEditor, createNewNote } from "../flows/noteLifecycleManager.js";

async function notaLista(): Promise<void> {
    const noteType = NoteType.LISTICLE;
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password)
    const data = listicleData[0];
    const label = { label: ("[02_NotaLista]") }

    const driver = await initializeDriver({ isHeadless: false })
    try {
        await driver.get(authUrl)
        await passLogin(driver, testEditorCredentials, 1500, label)
        await createNewNote(driver, noteType, 1000, label)
        await fillNote(driver, data, 1500, label)
        await closeNoteEditor(driver, NoteExitAction.BACK_EXIT_DISCARD, 1500, label)
    } catch (e) {
        console.error('¡LA PRUEBA FALLÓ EN UN PASO CRÍTICO!');
        console.error(e);
        process.exit();
    } finally {
        await quitDriver(driver, 10000)
        process.exit();
    }
}
notaLista()