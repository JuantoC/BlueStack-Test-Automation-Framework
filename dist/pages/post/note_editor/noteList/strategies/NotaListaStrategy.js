import { By } from "selenium-webdriver";
import { clickSafe } from "../../../../../core/actions/clickSafe.js";
export class NotaListaStrategy {
    CREATE_MENU_BTN;
    ADD_OPTION_BTN;
    constructor(CREATE_MENU_BTN = By.css('.dropdown-noteList button'), ADD_OPTION_BTN = By.id('option-dropdown-0')) {
        this.CREATE_MENU_BTN = CREATE_MENU_BTN;
        this.ADD_OPTION_BTN = ADD_OPTION_BTN;
    }
    toUiIndex(logicalIndex) {
        // Comportamiento natural sin inversión: el primer ítem agregado es el primero en la lista
        return logicalIndex + 1;
    }
    async addNewItem(driver, opts) {
        await clickSafe(driver, this.CREATE_MENU_BTN, opts);
        await clickSafe(driver, this.ADD_OPTION_BTN, opts);
    }
}
//# sourceMappingURL=NotaListaStrategy.js.map