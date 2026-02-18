export class BaseListicleSection {
    driver;
    strategy;
    // Selectores fijos (Se mantienen igual)
    CREATE_MENU = By.css('.dropdown-noteList button');
    ADD_OPTION = By.id('option-dropdown-0');
    constructor(driver, strategy) {
        this.driver = driver;
        this.strategy = strategy;
    }
    // --- Generadores de Locators (Validados con tu versión funcional) ---
    getIconLocator(uiIndex) {
        // Usamos la estructura exacta que ya te funciona
        return By.xpath(`//div[@id="note-list-${uiIndex}"]//mat-icon[contains(@class, "icon-up") or contains(@class, "icon-down")]`);
    }
    getFieldLocator(uiIndex, type) {
        const base = `//div[@id="note-list-${uiIndex}"]`;
        return type === 'body'
            ? By.xpath(`${base}//ckeditor[@id="ckNotaLista-${uiIndex}"]//div[@role="textbox"]`)
            : By.xpath(`${base}//textarea[@id="title-note-list-${uiIndex}"]`);
    }
    // --- Métodos de Acción ---
    /**
     * Determina el estado y expande/colapsa según sea necesario.
     * Basado en ensureItemExpanded de tu versión vieja pero más flexible.
     */
    async toggleExpansion(uiIndex, target, opts = {}) {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, `${target}(#${uiIndex})`)
        };
        const iconLocator = this.getIconLocator(uiIndex);
        try {
            const iconEl = await waitFind(this.driver, iconLocator, config);
            const className = await iconEl.getAttribute('class');
            const isExpanded = className.includes('icon-up');
            if ((target === 'expand' && !isExpanded) ||
                (target === 'collapse' && isExpanded)) {
                logger.debug(`${target === 'expand' ? 'Expandiendo' : 'Colapsando'} ítem #${uiIndex}`, { label: config.label });
                await clickSafe(this.driver, iconLocator, config);
            }
        }
        catch (error) {
            logger.warn(`No se pudo interactuar con el icono del ítem #${uiIndex}`, { label: config.label });
        }
    }
    /**
     * Provee y rellena múltiples ítems.
    */
    async fillItems(items, opts = {}) {
        if (!items?.length)
            return;
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, "fillItems")
        };
        // 🔹 1. Normalizar según estrategia
        const normalizedItems = this.strategy.normalizeItems(items);
        // 🔹 2. Crear slots (siempre hay 1 base)
        for (let i = 1; i < normalizedItems.length; i++) {
            await clickSafe(this.driver, this.CREATE_MENU, config);
            await clickSafe(this.driver, this.ADD_OPTION, config);
        }
        // 🔹 3. Poblar datos (orden DOM real)
        for (let i = 0; i < normalizedItems.length; i++) {
            const uiIndex = i + 1;
            const item = normalizedItems[i];
            await this.toggleExpansion(uiIndex, 'expand', config);
            if (item.title) {
                const titleLoc = this.getFieldLocator(uiIndex, 'title');
                await writeSafe(this.driver, titleLoc, item.title, config);
            }
            if (item.body) {
                const bodyLoc = this.getFieldLocator(uiIndex, 'body');
                await writeSafe(this.driver, bodyLoc, item.body, config);
            }
        }
    }
}
import { By } from "selenium-webdriver";
import { waitFind } from "../../../../core/utils/waitFind.js";
import { stackLabel } from "../../../../core/utils/stackLabel.js";
import { DefaultConfig } from "../../../../core/config/default.js";
import { clickSafe } from "../../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../../core/actions/writeSafe.js";
import logger from "../../../../core/utils/logger.js";
//# sourceMappingURL=BaseListicleSection.js.map