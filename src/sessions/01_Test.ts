import { noteData } from "../dataTest/noteData.js";
import { testEditorCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { NoteType } from "../pages/post/note_editor/noteCreationDropdown.js";
import { initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { fillNote } from "../flows/fillNote.js";
import { passLogin } from "../flows/manageAuth.js";
import { getAuthUrl } from "../core/actions/getAuthURL.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { NoteExitAction } from "../pages/post/note_editor/headerActions.js";
import { closeNoteEditor, createNewNote } from "../flows/noteLifecycleManager.js";

async function runSession(): Promise<void> {
    const noteType = NoteType.POST
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password)
    const opts = { label: ("[01_Test]") }

    const driver = await initializeDriver({ isHeadless: false })
    try {
        await driver.get(authUrl)
        await passLogin(driver, testEditorCredentials, 1500, opts)
        await createNewNote(driver, noteType, 1000, opts)
        await fillNote(driver, noteData[1], 1500, opts)
        await closeNoteEditor(driver, NoteExitAction.SAVE_AND_EXIT , 3000, opts)
    } catch (e) {
        console.error('¡LA PRUEBA FALLÓ EN UN PASO CRÍTICO!');
        console.error(e);
        process.exit();
    } finally {
        await quitDriver(driver, 8000)
        process.exit();
    }
}
runSession()