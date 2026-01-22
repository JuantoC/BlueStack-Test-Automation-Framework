import { By } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import { waitFind } from "../../../core/utils/waitFind.js";
export class listicleFields {
    driver;
    // Locators estáticos para la creación
    CREATE_MENU_BTN = By.css('.dropdown-noteList button');
    ADD_OPTION_BTN = By.css('div#option-dropdown-0');
    constructor(driver) {
        this.driver = driver;
    }
    async createNewListItem(timeout, opts) {
        await clickSafe(this.driver, this.CREATE_MENU_BTN, timeout, opts);
        await clickSafe(this.driver, this.ADD_OPTION_BTN, timeout, opts);
    }
    /**
     * Generador dinámico de locators basado en índice
     */
    getFieldLocator(index, isBody) {
        const base = `//div[@id="note-list-${index}"]`;
        return isBody
            ? By.xpath(`${base}//ckeditor[@id="ckNotaLista-${index}"]//div[@role="textbox"]`)
            : By.xpath(`${base}//textarea[@id="title-note-list-${index}"]`);
    }
    getExpandIconLocator(index) {
        // Buscamos el mat-icon que tenga alguna de las dos clases dentro del contenedor del item
        return By.xpath(`//div[@id="note-list-${index}"]//mat-icon[contains(@class, "icon-up") or contains(@class, "icon-down")]`);
    }
    /**
     * Determina si un item del listicle está expandido o colapsado.
     * @returns 'expanded' | 'collapsed'
    */
    async getListicleItemState(index, timeout) {
        const locator = this.getExpandIconLocator(index);
        // 1. Esperar y obtener el elemento
        const iconElement = await waitFind(this.driver, locator, timeout);
        // 2. Obtener el valor del atributo "class"
        const classAttribute = await iconElement.getAttribute('class');
        if (classAttribute.includes('icon-up')) {
            return 'expanded';
        }
        else {
            return 'collapsed';
        }
    }
    async ensureItemExpanded(index, timeout, opts) {
        const state = await this.getListicleItemState(index, timeout);
        if (state === 'collapsed') {
            console.log(`[Listicle #${index}] Está colapsado. Expandiendo...`);
            const locator = this.getExpandIconLocator(index);
            await clickSafe(this.driver, locator, timeout, opts);
        }
    }
    async fillListicleItems(items, timeout, opts = {}) {
        if (!items?.length)
            return;
        // 1. Provisionamiento (Solo creamos los necesarios, asumiendo que el 1ero ya existe)
        for (let i = 1; i < items.length; i++) {
            console.log(`[Listicle] Asegurando existencia del ítem #${i + 1}`);
            await this.createNewListItem(timeout, opts);
        }
        // 2. Población
        for (let i = 0; i < items.length; i++) {
            const uiIndex = i + 1;
            const { title, body } = items[i];
            await this.ensureItemExpanded(uiIndex, timeout, opts);
            if (title) {
                const loc = this.getFieldLocator(uiIndex, false);
                const el = await writeSafe(this.driver, loc, title, timeout, opts);
                await assertValueEquals(this.driver, el, loc, title);
            }
            if (body) {
                const loc = this.getFieldLocator(uiIndex, true);
                await writeSafe(this.driver, loc, body, timeout, opts);
            }
        }
    }
}
//# sourceMappingURL=listicleFields.js.map