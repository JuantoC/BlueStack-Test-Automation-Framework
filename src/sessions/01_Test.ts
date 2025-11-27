import { WebDriver } from "selenium-webdriver";
import { noteData } from "../dataTest/noteData.js";
import { adminCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { NoteType } from "../pages/post/note_editor/noteCreationDropdown.js";
import { initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { createFullNote } from "../flows/createNewNote.js";
import { passLogin } from "../flows/manageAuth.js";
import { getAuthUrl } from "../core/actions/getAuthURL.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";

async function runSession(): Promise<void> {
    let driver: WebDriver | undefined = undefined;
    const data = noteData[2];
    const apacheCredentials = basicAuthCredentials;
    const credentials = adminCredentials;
    const noteType = NoteType.POST
    const authUrl = getAuthUrl(MainConfig.BASE_URL, apacheCredentials.username, apacheCredentials.password)

    driver = await initializeDriver({ isHeadless: false })
    try {
        await driver.get(authUrl)
        await passLogin(driver, credentials, 1500, { label: ("[01_Test]") })
        await createFullNote(driver, noteType, data, 1500, { label: ("[01_Test]") })

    } catch (e) {
        console.error('============================================');
        console.error('¡LA PRUEBA FALLÓ EN UN PASO CRÍTICO!');
        console.error(e);
        console.error('============================================');
    } finally {

    }
}
runSession()