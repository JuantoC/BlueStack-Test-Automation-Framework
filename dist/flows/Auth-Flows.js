import { error } from "selenium-webdriver";
import { clickSafe, writeSafe } from "../core/Core-Interactions.js";
// ===========================================
//               FLUJOS DE AUTENTICACIÓN
// ===========================================
/**
 * Realiza el proceso completo de login en la aplicación.
 * @param driver La instancia del WebDriver.
 * @param credentials El objeto con el usuario y la contraseña.
 * @param locators El conjunto de localizadores del ambiente actual.
 */
export async function loginUser(driver, credentials, locators) {
    console.log(`Intentando login con usuario: ${credentials.username}`);
    await writeSafe(driver, locators.usernameField, credentials.username);
    await writeSafe(driver, locators.passwordField, credentials.password);
    await clickSafe(driver, locators.loginButton, locators.TIMEOUTS.LONG, "Login Button");
    console.log('Login exitoso. Esperando la redirección a la pantalla principal...');
}
/**
 * Intenta descartar el modal de Doble Autenticación haciendo click
 * en el botón "I will do it later".
 * @param driver La instancia del WebDriver.
 * @param locators El conjunto de localizadores del ambiente actual.
 */
export async function dismiss2FAModal(driver, locators) {
    console.log('Verificando y descartando el modal de 2FA...');
    try {
        // CRÍTICO: Usamos el timeout LONG para darle tiempo a que el modal aparezca
        await clickSafe(driver, locators.twoFAModalDismissButton, locators.TIMEOUTS.MEDIUM, "2FA Dismiss Button");
        console.log('Modal de 2FA descartado exitosamente.');
    }
    catch (e) {
        if (e instanceof error.TimeoutError) {
            console.log('El modal de 2FA no apareció o no se encontró el botón. Continuando...');
        }
        else {
            console.error('Ocurrió un error inesperado al descartar el 2FA.', e);
            throw e;
        }
    }
}
/**
 * Abre el modal de selección de tipo de nota y selecciona el tipo especificado.
 * @param driver La instancia del WebDriver.
 * @param noteType Referencia al tipo de nota en el modal de botones (e.g. ......).
 * @param locators El conjunto de localizadores del ambiente actual.
 */
export async function selectNoteType(driver, noteType, locators) {
    // 1. Abre el modal de selección
    console.log('Abriendo modal de creación de contenido...');
    await clickSafe(driver, locators.createNoteModalButton, locators.TIMEOUTS.MEDIUM, "Create Note Modal Button");
    // 3. Selecciona el tipo de nota
    console.log(`Seleccionando el tipo de nota: "${noteType}"`);
    const noteLocator = locators.noteTypeBase(noteType);
    await clickSafe(driver, noteLocator, locators.TIMEOUTS.MEDIUM);
    console.log(`Tipo de nota "${noteType}" seleccionado y proceso completado.`);
}
//# sourceMappingURL=Auth-Flows.js.map