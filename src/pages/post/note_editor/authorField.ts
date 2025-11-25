import { Locator } from "selenium-webdriver";

export class NoteAuthorField {
     // 3. Sección de Autor
      public authorInternalUserBtn: Locator = By.css('mat-icon="check_circle_outline"');
      public authorAnonymuosUserBtn: Locator = By.css('mat-icon="person_outline"');
      public authorManualUserBtn: Locator = By.css('mat-icon="draw"');
      public authorDescriptionField: Locator = By.css('.author-description__height');
      public authorNameField: Locator = By.css('input[data-testid="type_autocomplete"]');
}