import { WebDriver } from "selenium-webdriver";
import { noteData } from "../dataTest/noteData";
import { adminCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials";
import { NoteType } from "../pages/post/note_editor/noteCreationDropdown";
import { initializeDriver, quitDriver } from "../core/actions/driverManager";
import { createFullNote } from "../flows/createNewNote";
import { passLogin } from "../flows/manageAuth";
import { getAuthUrl } from "../core/actions/getAuthURL";
import { MainConfig } from "../environments/Dev_SAAS/env.config";

async function runSesion(): Promise<void> {
    let driver: WebDriver | undefined = undefined;
    const data = noteData[2];
    const apacheCredentials = basicAuthCredentials;
    const credentials = adminCredentials;
    const noteType = NoteType.POST
    const authUrl = getAuthUrl(MainConfig.BASE_URL, apacheCredentials.username, apacheCredentials.password)

    driver = await initializeDriver({isHeadless: true})

    await driver.get(authUrl) 
    await passLogin(driver, credentials, 1000, {label: ("[01_Test]")})
    await createFullNote(driver, noteType, data, 1000, {label: ("[01_Test]")})

    await quitDriver(driver);
}
runSesion()