export async function writeToEditable(element, text) {
    const driver = element.getDriver();
    console.log(`[writeToEditable]: ${await element.getTagName()} es un elemento editable`);
    await driver.executeScript("arguments[0].focus(); arguments[0].innerHTML = '';", element);
    await element.sendKeys(text);
}
export async function writeToStandard(element, text) {
    console.log(`[writeToEditable]: ${await element.getTagName()} NO es un elemento editable`);
    await element.clear();
    await element.sendKeys(text);
}
//# sourceMappingURL=write.js.map