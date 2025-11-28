import { By } from "selenium-webdriver";
import { retry } from "../../../core/wrappers/retry.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
export class NoteTextFields {
    driver;
    // ========== LOCATORS ==========
    locatorMap = {
        [NoteTextField.TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.main__title-height'),
        [NoteTextField.SECONDARY_TITLE]: By.css('div[id="titulo-content"] textarea.content__input-title.secondary__title-height'),
        [NoteTextField.SUB_TITLE]: By.css('ckeditor[data-testid="copete-content"] div.ck-editor__editable'),
        [NoteTextField.HALF_TITLE]: By.css('div[id="volanta-content"] input[type="text"]'),
        [NoteTextField.BODY]: By.css('div[id="cuerpo-content"] div.ck-editor__editable'),
        [NoteTextField.SUMMARY]: By.id('resumen-content')
    };
    tagLocatorMap = {
        [NoteTagField.TAGS]: By.css('div[id="claves-content"] input[role="combobox"]'),
        [NoteTagField.HIDDEN_TAGS]: By.css('div[id="clavesOcultas-content"] input[role="combobox"]')
    };
    fieldNameMap = {
        [NoteTextField.TITLE]: 'título',
        [NoteTextField.SECONDARY_TITLE]: 'título secundario',
        [NoteTextField.SUB_TITLE]: 'subtítulo',
        [NoteTextField.HALF_TITLE]: 'volanta',
        [NoteTextField.BODY]: 'cuerpo',
        [NoteTextField.SUMMARY]: 'resumen'
    };
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS ==========
    async fillNoteData(data, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'NoteTextFields.fillNoteData') };
        const textFieldsData = {};
        console.log(`[${fullOpts.label}] Iniciando orquestación de llenado de campos (Textos, Tags, Listicle)...`);
        // 1. Llenar campos de texto principales
        for (const key of Object.keys(NOTE_TEXT_FIELD_MAP)) {
            const dataKey = key;
            const enumKey = NOTE_TEXT_FIELD_MAP[dataKey];
            const value = data[dataKey];
            if (value !== undefined && value.trim() !== "") {
                textFieldsData[enumKey] = value;
            }
        }
        if (Object.keys(textFieldsData).length > 0) {
            await this.fillTextFields(textFieldsData, timeout, fullOpts);
        }
        // 2. Llenar Tags
        if (data.tags && data.tags.length > 0) {
            await this.addTags(data.tags, timeout, fullOpts);
        }
        if (data.hiddenTags && data.hiddenTags.length > 0) {
            await this.addHiddenTags(data.hiddenTags, timeout, fullOpts);
        }
        // 3. Llenar Listicle Items
        if (data.listicleItems && data.listicleItems.length > 0) {
            await this.fillListicleItems(data.listicleItems, timeout, fullOpts);
        }
        console.log(`[${fullOpts.label}] Orquestación de llenado completada.`);
    }
    /**
     * Rellena un campo de texto de forma dinámica
     * @param field - El campo a rellenar
     * @param value - El valor a escribir
     * @param timeout - Timeout para la operación
     * @param opts - Opciones de retry
     */
    async fillField(field, value, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `fillField:${field}`) };
        const fieldName = this.fieldNameMap[field];
        const locator = this.locatorMap[field];
        console.log(`[fillField] Rellenando ${fieldName}...`);
        return await retry(async () => {
            const element = await writeSafe(this.driver, locator, value, timeout, fullOpts);
            await assertValueEquals(this.driver, element, locator, value);
        }, fullOpts);
    }
    /**
     * Rellena múltiples campos de texto a la vez
     * Acepta un objeto con los campos a rellenar
     * @param data - Objeto con los datos a rellenar
     * @param timeout - Timeout para la operación
     * @param opts - Opciones de retry
     */
    async fillTextFields(data, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillTextFields') };
        for (const [field, value] of Object.entries(data)) {
            if (value !== undefined && value.trim() !== "") {
                await this.fillField(field, value, timeout, fullOpts);
            }
        }
    }
    // ========== MÉTODOS PARA TAGS ==========
    /**
     * Método dinámico para agregar tags (normales o ocultos)
     * @param tagField - Si es normal o hidden
     * @param timeout - Timeout para la operación
     * @param opts - Opciones de retry
     */
    async addTagsToField(tagField, tags, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `addTags:${tagField}`) };
        const locator = this.tagLocatorMap[tagField];
        if (tags.length === 0) {
            console.log(`[${fullOpts.label}] No hay tags para procesar.`);
            return;
        }
        console.log(`[${fullOpts.label}] Iniciando ingreso de ${tags.length} tags.`);
        for (const tag of tags) {
            if (tag.trim() === "")
                continue;
            const tagTextWithSubmit = tag.trim() + '\n';
            console.log(`[${fullOpts.label}] Ingresando tag: "${tag.trim()}"`);
            await writeSafe(this.driver, locator, tagTextWithSubmit, timeout, fullOpts);
        }
        console.log(`[${fullOpts.label}] Tags completados.`);
    }
    /**
     * Métodos de conveniencia para tags
     */
    async addTags(tags, timeout, opts = {}) {
        await this.addTagsToField(NoteTagField.TAGS, tags, timeout, opts);
    }
    async addHiddenTags(tags, timeout, opts = {}) {
        await this.addTagsToField(NoteTagField.HIDDEN_TAGS, tags, timeout, opts);
    }
    // ========== MÉTODOS PARA LISTICLE ==========
    /**
     * Obtener el Locator de un campo de Listicle dinámico
     */
    getListicleFieldLocator(fieldType, index) {
        const baseSelector = `//div[@data-listicle-item-index="${index}"]`;
        let selector;
        switch (fieldType) {
            case ListicleFieldType.TITLE:
                selector = `${baseSelector}//input[contains(@class, 'listicle-title-input')]`;
                break;
            case ListicleFieldType.BODY:
                selector = `${baseSelector}//ckeditor[contains(@class, 'listicle-body-editor')]/.ck-editor__editable`;
                break;
            default:
                throw new Error(`Tipo de campo Listicle desconocido: ${fieldType}`);
        }
        return By.xpath(selector);
    }
    /**
     * Rellena un item de Listicle específico
     */
    async fillListicleItem(index, title, body, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, `fillListicleItem #${index}`) };
        const uiIndex = index + 1; // Los índices UI empiezan en 1
        // Rellenar título del item
        if (title && title.trim() !== "") {
            const titleLocator = this.getListicleFieldLocator(ListicleFieldType.TITLE, uiIndex);
            console.log(`[${fullOpts.label}] Rellenando Listicle #${uiIndex} Título`);
            const titleElement = await writeSafe(this.driver, titleLocator, title, timeout, fullOpts);
            await assertValueEquals(this.driver, titleElement, titleLocator, title, `Listicle #${uiIndex} Título no coincide.`);
        }
        // Rellenar cuerpo del item
        if (body && body.trim() !== "") {
            const bodyLocator = this.getListicleFieldLocator(ListicleFieldType.BODY, uiIndex);
            console.log(`[${fullOpts.label}] Rellenando Listicle #${uiIndex} Cuerpo`);
            const bodyElement = await writeSafe(this.driver, bodyLocator, body, timeout, fullOpts);
            await assertValueEquals(this.driver, bodyElement, bodyLocator, body, `Listicle #${uiIndex} Cuerpo no coincide.`);
        }
    }
    /**
     * Rellena múltiples items de Listicle
     */
    async fillListicleItems(items, timeout, opts = {}) {
        const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillListicleItems') };
        if (!items || items.length === 0) {
            console.log(`[${fullOpts.label}] No hay items de listicle para procesar.`);
            return;
        }
        console.log(`[${fullOpts.label}] Procesando ${items.length} items de listicle.`);
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await this.fillListicleItem(i, item.title, item.body, timeout, fullOpts);
        }
        console.log(`[${fullOpts.label}] Listicle items completados.`);
    }
}
export var NoteTextField;
(function (NoteTextField) {
    NoteTextField["TITLE"] = "title";
    NoteTextField["SECONDARY_TITLE"] = "secondaryTitle";
    NoteTextField["SUB_TITLE"] = "subTitle";
    NoteTextField["HALF_TITLE"] = "halfTitle";
    NoteTextField["BODY"] = "body";
    NoteTextField["SUMMARY"] = "summary";
})(NoteTextField || (NoteTextField = {}));
export var NoteTagField;
(function (NoteTagField) {
    NoteTagField["TAGS"] = "tags";
    NoteTagField["HIDDEN_TAGS"] = "hiddenTags";
})(NoteTagField || (NoteTagField = {}));
export var ListicleFieldType;
(function (ListicleFieldType) {
    ListicleFieldType["TITLE"] = "title";
    ListicleFieldType["BODY"] = "body";
})(ListicleFieldType || (ListicleFieldType = {}));
// Mapeo entre la clave de NoteData y la clave del enum NoteTextField
const NOTE_TEXT_FIELD_MAP = {
    title: NoteTextField.TITLE,
    secondaryTitle: NoteTextField.SECONDARY_TITLE,
    subTitle: NoteTextField.SUB_TITLE,
    halfTitle: NoteTextField.HALF_TITLE,
    body: NoteTextField.BODY,
    summary: NoteTextField.SUMMARY,
};
//# sourceMappingURL=textFields.js.map