import { Locator, WebDriver } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel";
import { RetryOptions } from "../../../core/wrappers/retry";
import { clickSafe } from "../../../core/actions/clickSafe";
import { writeSafe } from "../../../core/actions/writeSafe";
import { assertValueEquals } from "../../../core/utils/assertValueEquals";
import { AuthorType } from "./textFields";

/**
 * Clase para campos de autor
 */
export class NoteAuthorField {
  // ========== LOCATORS ==========
  private authorButtonMap: Record<AuthorType, Locator> = {
    [AuthorType.INTERNAL]: By.css('mat-icon="check_circle_outline"'),
    [AuthorType.ANONYMOUS]: By.css('mat-icon="person_outline"'),
    [AuthorType.MANUAL]: By.css('mat-icon="draw"')
  };
  
  public authorDescriptionField: Locator = By.css('.author-description__height');
  public authorNameField: Locator = By.css('input[data-testid="type_autocomplete"]');

  // ========== MÉTODOS ==========
  async selectAuthorType(driver: WebDriver, type: AuthorType, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'selectAuthorType') };
    const locator = this.authorButtonMap[type];
    
    await clickSafe(driver, locator, timeout, fullOpts);
  }

  async fillAuthorName(driver: WebDriver, name: string, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillAuthorName') };
    console.log(`[${fullOpts.label}] Rellenando nombre de autor...`);
    
    const element = await writeSafe(driver, this.authorNameField, name, timeout, fullOpts);
    await assertValueEquals(driver, element, this.authorNameField, name, 'El valor del nombre de autor no coincide');
  }

  async fillAuthorDescription(driver: WebDriver, description: string, timeout: number = 1500, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'fillAuthorDescription') };
    console.log(`[${fullOpts.label}] Rellenando descripción de autor...`);
    
    const element = await writeSafe(driver, this.authorDescriptionField, description, timeout, fullOpts);
    await assertValueEquals(driver, element, this.authorDescriptionField, description, 'El valor de la descripción no coincide');
  }
}
