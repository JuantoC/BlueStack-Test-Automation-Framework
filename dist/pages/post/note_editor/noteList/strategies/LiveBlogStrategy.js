import { By } from "selenium-webdriver";
import { clickSafe } from "../../../../../core/actions/clickSafe.js";
export class LiveBlogStrategy {
    CREATE_MENU_BTN;
    ADD_OPTION_BTN;
    constructor(CREATE_MENU_BTN = By.css('.dropdown-noteList button'), ADD_OPTION_BTN = By.id('option-dropdown-0')) {
        this.CREATE_MENU_BTN = CREATE_MENU_BTN;
        this.ADD_OPTION_BTN = ADD_OPTION_BTN;
    }
    toUiIndex(logicalIndex, total) {
        // Inversion del index lógico para Live Blog: el último ítem agregado aparece primero
        return total - logicalIndex;
    }
    async addNewItem(driver, opts) {
        await clickSafe(driver, this.CREATE_MENU_BTN, opts);
        await clickSafe(driver, this.ADD_OPTION_BTN, opts);
    }
}
//# sourceMappingURL=LiveBlogStrategy.js.map