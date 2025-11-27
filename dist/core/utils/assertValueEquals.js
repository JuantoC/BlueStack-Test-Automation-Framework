import { isContentEditable } from "./isContentEditable.js";
/**
 * Revisa que el valor de un elemento web coincide con el valor esperado.
 * Maneja tanto elementos editables como estándar.
 * @param driver La instancia del WebDriver.
 * @param element El WebElement cuyo valor se va a verificar.
 * @param locator El Locator (By) del elemento (para mensajes de error).
 * @param expected El valor esperado.
 * @param message Mensaje opcional para la aserción.
 */
export async function assertValueEquals(driver, element, locator, expected, message) {
    const isEditable = await isContentEditable(element);
    let actual;
    if (isEditable) {
        actual = await driver.executeScript("return arguments[0].innerText || arguments[0].textContent;", element);
    }
    else {
        actual = await element.getAttribute("value");
    }
    if (actual !== expected) {
        throw new Error(message ??
            `Assertion failed: 
Valor del elemento ${JSON.stringify(locator)} no coincide.
Esperado: "${expected}"
Actual:   "${actual}"`);
    }
}
//# sourceMappingURL=assertValueEquals.js.map