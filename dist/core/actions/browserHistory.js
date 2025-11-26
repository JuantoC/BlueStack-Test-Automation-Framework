/** Navega en el historial del navegador.
 * @param driver La instancia de WebDriver.
 * @param direction La dirección de navegación: "back" o "forward".
 */
export async function browserHistory(driver, direction) {
    console.log(`[browserHistory] Dirección: ${direction}`);
    if (direction === "back") {
        await driver.navigate().back();
    }
    else {
        await driver.navigate().forward();
    }
}
//# sourceMappingURL=browserHistory.js.map