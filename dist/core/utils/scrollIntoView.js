export async function scrollIntoView(element) {
    const driver = element.getDriver();
    console.log(`[scrollIntoView] Llevando el scroll al elemento...`);
    await driver.executeScript("arguments[0].scrollIntoView(true);", element);
    console.log(`[scrollIntoView] Exito.`);
    return element;
}
//# sourceMappingURL=scrollIntoView.js.map