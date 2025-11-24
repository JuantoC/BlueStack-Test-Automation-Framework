import { until, error } from "selenium-webdriver";
/**
 * Espera a que un elemento sea ubicado en el DOM por su Locator.
 * @param driver La instancia del WebDriver.
 * @param locator El objeto By (e.g., By.css('...'), By.xpath('...')) que identifica el elemento.
 * @param timeout El tiempo máximo de espera en milisegundos (default: 5s).
 * @returns Una promesa que resuelve con el WebElement una vez ubicado.
 */
export async function waitFind(driver, locator, timeout = 5000) {
    try {
        return await driver.wait(until.elementLocated(locator), timeout, `Elemento no encontrado: ${locator} en ${timeout}ms`);
    }
    catch (err) {
        if (err instanceof error.TimeoutError) {
            throw new Error(`Elemento no encontrado: ${locator} en ${timeout}ms`);
        }
        throw err;
    }
}
/**
 * Espera a que un WebElement (ya encontrado) sea visible en la página.
 * @param driver La instancia del WebDriver.
 * @param element El WebElement ya resuelto para verificar su visibilidad.
 * @param timeout El tiempo máximo de espera en milisegundos (default: 5s).
 * @returns Una promesa que resuelve con el mismo WebElement una vez que es visible.
 */
export async function waitVisible(driver, element, timeout = 5000) {
    try {
        return driver.wait(until.elementIsVisible(element), timeout);
    }
    catch (err) {
        if (err instanceof error.TimeoutError) {
            console.error(`ERROR en WaitVisible. Elemento no visible en ${timeout}ms`);
        }
        throw err;
    }
}
/**
 * Realiza un clic seguro en un elemento.
 * Combina las esperas de 'encontrar' y 'visibilidad' y espera a que el elemento esté habilitado.
 * @param driver La instancia del WebDriver.
 * @param locator El Locator (By) del elemento.
 * @param timeout Tiempo máximo de espera para todo el proceso.
 * @returns Una promesa que resuelve con el WebElement después del clic.
 */
export async function clickSafe(driver, locator, timeout = 5000, id = "") {
    const element = await waitFind(driver, locator, timeout);
    await waitVisible(driver, element);
    await driver.wait(until.elementIsEnabled(element), timeout);
    element.click();
    console.log(`Click ${id} realizado exitosamente.`);
    return element;
}
/**
 * Escribe un texto de forma segura en un campo de entrada.
 * Combina la lógica de clickSafe, luego limpia el campo y envía las teclas.
 * @param driver La instancia del WebDriver.
 * @param locator El Locator (By) del campo de entrada.
 * @param text El texto a escribir.
 * @param timeout Tiempo máximo de espera.
 * @returns Una promesa que resuelve con el WebElement después de escribir.
 */
export async function writeSafe(driver, locator, text, timeout = 5000) {
    const element = await waitFind(driver, locator, timeout);
    await waitVisible(driver, element, timeout);
    // Detectar CKEditor o div editable
    const isContentEditable = (await element.getAttribute("contenteditable")) === "true" ||
        (await element.getAttribute("role")) === "textbox" ||
        (await element.getAttribute("class"))?.includes("ck-editor__editable");
    await driver.wait(until.elementIsEnabled(element), 3000);
    if (isContentEditable) {
        // === CKEDITOR / DIV ===
        try {
            await element.click();
            await driver.executeScript("arguments[0].focus();", element);
            await driver.executeScript("arguments[0].innerHTML = '';", element); // Clear
            await element.sendKeys(text);
        }
        catch {
            await driver.executeScript("arguments[0].focus(); arguments[0].innerHTML = '';", element);
            await element.sendKeys(text);
        }
    }
    else {
        // === INPUT / TEXTAREA ===
        try {
            await element.click();
            await element.clear();
            await element.sendKeys(text);
        }
        catch {
            await driver.executeScript("arguments[0].click();", element);
            await element.clear();
            await element.sendKeys(text);
        }
    }
    return element;
}
//# sourceMappingURL=Core-Interactions.js.map