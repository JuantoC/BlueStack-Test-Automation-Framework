export async function writeToEditable(element, text) {
    const driver = element.getDriver();
    await driver.executeScript("arguments[0].focus(); arguments[0].innerHTML = '';", element);
    await element.sendKeys(text);
}
export async function writeToStandard(element, text) {
    await element.clear();
    await element.sendKeys(text);
}
//# sourceMappingURL=write.js.map