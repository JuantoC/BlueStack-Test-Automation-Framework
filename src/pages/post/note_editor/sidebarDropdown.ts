import { Locator } from "selenium-webdriver";

export class NoteSidebarDropdow {
    // 4. Side Dropdown y Botones de Acción
      public sideDropdownButton: Locator = By.css('mat-select[data-testid="select-lateral"]');
      public comboSectionOptions: Locator = By.css('mat-select[data-testid="section-options"]');
      public firstSectionOption: Locator = By.id('mat-option-74');
}