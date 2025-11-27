export async function writeToEditable(element, text) {
    const driver = element.getDriver();
    console.log(`writeSafe: es un elemento editable!`);
    await driver.executeScript("arguments[0].focus(); arguments[0].innerHTML = '';", element);
    await element.sendKeys(text);
}
export async function writeToStandard(element, text) {
    console.log(`writeSafe: NO es un elemento editable!`);
    await element.clear();
    await element.sendKeys(text);
}
//# sourceMappingURL=write.js.map