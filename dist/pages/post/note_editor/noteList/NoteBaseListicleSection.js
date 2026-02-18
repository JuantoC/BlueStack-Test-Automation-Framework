import { By } from "selenium-webdriver";
import { DefaultConfig } from "../../../../core/config/default.js";
import { writeSafe } from "../../../../core/actions/writeSafe.js";
import { clickSafe } from "../../../../core/actions/clickSafe.js";
import { waitFind } from "../../../../core/utils/waitFind.js";
import logger from "../../../../core/utils/logger.js";
/**
 *  BASE COMÚN PARA:
 * - Nota Lista
 * - Live Blog
 */
export class BaseListicleSection {
    CREATE_MENU_BTN;
    ADD_OPTION_BTN;
    driver;
    strategy;
    constructor(CREATE_MENU_BTN, ADD_OPTION_BTN, driver, strategy) {
        this.CREATE_MENU_BTN = CREATE_MENU_BTN;
        this.ADD_OPTION_BTN = ADD_OPTION_BTN;
        this.driver = driver;
        this.strategy = strategy;
    }
    // ===== LOCATORS DINÁMICOS =====
    getFieldLocator(index, isBody) {
        const base = `//div[@id="note-list-${index}"]`;
        return isBody
            ? By.xpath(`${base}//ckeditor[contains(@id,'ckNotaLista-')]//div[@role="textbox"]`)
            : By.xpath(`${base}//textarea[contains(@id,'title-note-list-')]`);
    }
    getExpandIconLocator(index) {
        return By.xpath(`//div[@id="note-list-${index}"]//mat-icon[contains(@class, "icon-up") or contains(@class, "icon-down")]`);
    }
    // ===== ESTADO =====
    async getListicleItemState(index, opts = {}) {
        const config = { ...DefaultConfig, ...opts };
        const iconElement = await waitFind(this.driver, this.getExpandIconLocator(index), config);
        const isExpanded = await iconElement.getAttribute('class');
        return isExpanded.includes('icon-up')
            ? 'expanded'
            : 'collapsed';
    }
    async ensureItemExpanded(index, opts = {}) {
        const state = await this.getListicleItemState(index, opts);
        if (state === 'collapsed') {
            await clickSafe(this.driver, this.getExpandIconLocator(index), opts);
        }
    }
    // ===== MÉTODO PRINCIPAL (ESTRATEGIA INTEGRADA) =====
    async fillListicleItems(items, opts = {}) {
        if (!items?.length)
            return;
        const config = { ...DefaultConfig, ...opts };
        // 1. CREACIÓN DE SLOTS
        for (let i = 1; i < items.length; i++) {
            await clickSafe(this.driver, this.CREATE_MENU_BTN, config);
            await clickSafe(this.driver, this.ADD_OPTION_BTN, config);
        }
        // 2. POBLACIÓN DE DATOS
        for (let i = 0; i < items.length; i++) {
            const uiIndex = this.strategy.toUiIndex(i, items.length);
            const { title, body } = items[i];
            await this.ensureItemExpanded(uiIndex, config);
            if (title) {
                const locator = this.getFieldLocator(uiIndex, false);
                const element = await writeSafe(this.driver, locator, title, config);
            }
            if (body) {
                const loc = this.getFieldLocator(uiIndex, true);
                await writeSafe(this.driver, loc, body, config);
            }
        }
        logger.info(`Se procesaron ${items.length} ítems exitosamente.`, { label: config.label });
    }
    // ===== EXTENSIONES COMUNES =====
    async getByVisiblePosition(visiblePosition, total) {
        const uiIndex = this.strategy.toUiIndex(visiblePosition - 1, total);
        return {
            title: this.getFieldLocator(uiIndex, false),
            body: this.getFieldLocator(uiIndex, true)
        };
    }
    async deleteItem(visiblePosition, total, opts = {}) {
        const uiIndex = this.strategy.toUiIndex(visiblePosition - 1, total);
        const deleteBtn = By.xpath(`//div[@id="note-list-${uiIndex}"]//button[contains(@class,'delete')]`);
        await clickSafe(this.driver, deleteBtn, opts);
    }
}
//# sourceMappingURL=NoteBaseListicleSection.js.map