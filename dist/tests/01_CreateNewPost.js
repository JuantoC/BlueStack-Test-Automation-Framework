import { initializeDriver, quitDriver } from '../core/actions/driverManager.js';
import { DevSaasLocators, getAuthUrl } from '../environments/Dev_SAAS/Locators.js';
import { dismiss2FAModal } from '../core/actions/twoFA-Modal.js';
import { loginUser } from '../flows/manageAuth.js';
import { selectNoteType } from '../core/utils/getNoteTypeLocator.js';
import { NewPostData } from '../dataTest/noteData.js';
import { fillPostFields } from '../core/helpers/fillPostFields.js';
// ===========================================
//          SCRIPT DE EJECUCIÓN DEL TEST
// ===========================================
/**
 * Define y ejecuta el flujo completo para la creación de un 'New Post' (Nota Común)
 * en el ambiente Dev-SAAS y escribe un título.
 */
async function runCreateNewPostTest() {
    let driver = undefined;
    const authUrl = getAuthUrl();
    const { LoginCredentials, Constants, Locators } = DevSaasLocators;
    const { TIMEOUTS } = Constants;
    const postData = NewPostData[0];
    const noteType = 'New Post';
    // Se construye el objeto AuthLocators
    const flowLocators = {
        TIMEOUTS: TIMEOUTS,
        twoFAModalDismissButton: Locators.twoFAModalDismissButton,
        createNoteModalButton: Locators.createNoteModalButton,
        noteTypeBase: Locators.noteTypeBase,
        usernameField: Locators.usernameField,
        passwordField: Locators.passwordField,
        loginButton: Locators.loginButton,
    };
    try {
        driver = await initializeDriver({
            isHeadless: false,
        });
        console.log("==============================================");
        console.log("INICIO DE TEST: Creación de 'New Post' (Dev-SAAS)");
        console.log("==============================================");
        // Basic Auth y Navegación
        console.log(`Navegando a: ${authUrl.substring(0, 50)}...`);
        await driver.get(authUrl);
        // Login de Aplicación
        await loginUser(driver, LoginCredentials, flowLocators);
        // Descarte de Modal 2FA
        await dismiss2FAModal(driver, flowLocators);
        // Apertura del modal y selección del tipo de nota
        await selectNoteType(driver, noteType, flowLocators);
        // Escritura del contenido de la nota
        await fillPostFields(driver, postData, TIMEOUTS.LONG);
        console.log("==============================================");
        console.log("PRUEBA EXITOSA: Creación de Nota y Escritura de Título.");
        console.log("==============================================");
    }
    catch (e) {
        console.error('============================================');
        console.error('¡LA PRUEBA FALLÓ EN UN PASO CRÍTICO!');
        console.error(e);
        console.error('============================================');
    }
    finally {
        if (driver) {
            await quitDriver(driver);
        }
    }
}
runCreateNewPostTest();
//# sourceMappingURL=01_CreateNewPost.js.map