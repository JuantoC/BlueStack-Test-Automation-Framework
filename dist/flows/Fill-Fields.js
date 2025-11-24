import * as assert from 'assert';
import { writeSafe } from "../core/Core-Interactions.js";
import { DevSaasLocators } from "../environments/Dev_SAAS/Locators.js";
const Locators = DevSaasLocators.Locators;
const fieldMap = {
    title: Locators.mainTitleField,
    subtitle: Locators.subTitleField,
    halfTitle: Locators.halfTitleField,
    body: Locators.bodyField,
    summary: Locators.summaryField,
    authorName: Locators.authorNameField,
    authorDescription: Locators.authorDescriptionField
};
export async function fillPostFields(driver, postData, timeout) {
    // Escribir campos normales
    for (const key of Object.keys(fieldMap)) {
        const value = postData[key];
        if (value && typeof value === "string" && value.trim() !== "") {
            const locator = fieldMap[key];
            const element = await writeSafe(driver, locator, value, timeout);
            const isContentEditable = (await element.getAttribute("contenteditable")) === "true" ||
                (await element.getAttribute("role")) === "textbox" ||
                (await element.getAttribute("class"))?.includes("ck-editor__editable");
            let actualValue;
            if (isContentEditable) {
                actualValue = await driver.executeScript("return arguments[0].innerText;", element);
            }
            else {
                actualValue = await element.getAttribute("value");
            }
        }
        // Manejar Notas Listas 
        await handleListicleFields(driver, postData, timeout);
    }
    async function handleListicleFields(driver, postData, timeout) {
        const listicleTitleLocator = Locators.listicleTitleField;
        const listicleBodyLocator = Locators.listicleBodyField;
        if (postData.listicleTitle) {
            for (let i = 0; i < postData.listicleTitle.length; i++) {
                const text = postData.listicleTitle[i];
                if (!text)
                    continue;
                const element = await writeSafe(driver, listicleTitleLocator(i), text, timeout);
                const actualValue = await element.getAttribute("value");
                assert.equal(actualValue, text, `El título de lista en índice ${i} no coincide con lo esperado.`);
                console.log(`ListicleTitle[${i}] escrito exitosamente: "${actualValue}"`);
            }
        }
        if (postData.listicleBody) {
            for (let i = 0; i < postData.listicleBody.length; i++) {
                const text = postData.listicleBody[i];
                if (!text)
                    continue;
                const element = await writeSafe(driver, listicleBodyLocator(i), text, timeout);
                const actualValue = await element.getAttribute("value");
                assert.equal(actualValue, text, `El cuerpo de lista en índice ${i} no coincide con lo esperado.`);
                console.log(`ListicleBody[${i}] escrito exitosamente: "${actualValue}"`);
            }
        }
    }
}
//# sourceMappingURL=Fill-Fields.js.map