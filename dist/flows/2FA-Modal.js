import { error } from "selenium-webdriver";
import { clickSafe } from "../core/Core-Interactions.js";
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
//# sourceMappingURL=2FA-Modal.js.map