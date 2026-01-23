import { By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { DefaultConfig } from "../../../core/config/default.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import { waitFind } from "../../../core/utils/waitFind.js";
import logger from "../../../core/utils/logger.js";
/**
 * Maneja la sección de Listicles (listas de ítems) dentro de la nota.
 * Gestiona la creación dinámica, expansión y llenado de campos.
 */
export class NoteListicleSection {
    driver;
    CREATE_MENU_BTN = By.css('.dropdown-noteList button');
    ADD_OPTION_BTN = By.id('option-dropdown-0');
    constructor(driver) {
        this.driver = driver;
    }
    // ========== GENERADORES DINÁMICOS (Internos) ==========
    getFieldLocator(index, isBody) {
        const base = `//div[@id="note-list-${index}"]`;
        return isBody
            ? By.xpath(`${base}//ckeditor[@id="ckNotaLista-${index}"]//div[@role="textbox"]`)
            : By.xpath(`${base}//textarea[@id="title-note-list-${index}"]`);
    }
    getExpandIconLocator(index) {
        return By.xpath(`//div[@id="note-list-${index}"]//mat-icon[contains(@class, "icon-up") or contains(@class, "icon-down")]`);
    }
    // ========== MÉTODOS DE ESTADO Y ACCIÓN ==========
    /**
     * Identifica si un ítem está expandido mediante la inspección de clases del icono.
     */
    async getListicleItemState(index, opts = {}) {
        const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, `getState(#${index})`) };
        const locator = this.getExpandIconLocator(index);
        try {
            const iconElement = await waitFind(this.driver, locator, config);
            const classAttribute = await iconElement.getAttribute('class');
            const state = classAttribute.includes('icon-up') ? 'expanded' : 'collapsed';
            logger.debug(`Estado detectado para ítem #${index}: ${state}`, { label: config.label });
            return state;
        }
        catch (error) {
            logger.warn(`No se pudo determinar el estado del ítem #${index}. Asumiendo colapsado.`, { label: config.label });
            return 'collapsed';
        }
    }
    async ensureItemExpanded(index, opts = {}) {
        const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, `expand(#${index})`) };
        const state = await this.getListicleItemState(index, config);
        if (state === 'collapsed') {
            logger.debug(`Expandiendo ítem #${index}...`, { label: config.label });
            await clickSafe(this.driver, this.getExpandIconLocator(index), config);
        }
    }
    // ========== ORQUESTADOR DE COMPONENTE ==========
    /**
     * Provee y rellena múltiples ítems de listicle.
     */
    async fillListicleItems(items, opts = {}) {
        if (!items?.length)
            return;
        const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "fillListicle") };
        try {
            // 1. Creación de ítems (Lógica de provisión)
            // Nota: i=1 porque asumimos que el primer slot (index 1) ya existe por defecto en el CMS.
            for (let i = 1; i < items.length; i++) {
                logger.debug(`Añadiendo nuevo slot de ítem (Total requerido: ${items.length})`, { label: config.label });
                await clickSafe(this.driver, this.CREATE_MENU_BTN, config);
                await clickSafe(this.driver, this.ADD_OPTION_BTN, config);
            }
            // 2. Población de datos
            for (let i = 0; i < items.length; i++) {
                const uiIndex = i + 1;
                const { title, body } = items[i];
                await this.ensureItemExpanded(uiIndex, config);
                if (title) {
                    const loc = this.getFieldLocator(uiIndex, false);
                    logger.debug(`Escribiendo título en ítem #${uiIndex}`, { label: config.label });
                    const el = await writeSafe(this.driver, loc, title, config);
                    await assertValueEquals(el, loc, title, config);
                }
                if (body) {
                    const loc = this.getFieldLocator(uiIndex, true);
                    logger.debug(`Escribiendo cuerpo (CKEditor) en ítem #${uiIndex}`, { label: config.label });
                    // Para CKEditor no siempre podemos hacer assertValueEquals estándar por el HTML interno
                    await writeSafe(this.driver, loc, body, config);
                }
            }
            logger.info(`Se procesaron ${items.length} ítems de listicle exitosamente.`, { label: config.label });
        }
        catch (error) {
            throw error;
        }
    }
}
//# sourceMappingURL=NoteListicleSection.js.map