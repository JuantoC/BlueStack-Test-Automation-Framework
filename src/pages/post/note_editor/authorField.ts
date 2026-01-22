import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions } from "../../../core/config/default.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";

export enum AuthorType {
  INTERNAL = 'internal',
  ANONYMOUS = 'anonymous',
  MANUAL = 'manual'
}

/**
 * Clase para campos de autor
 */
export class NoteAuthorField {
  // ========== LOCATORS ==========
  private authorButtonMap: Record<AuthorType, Locator> = {
    [AuthorType.INTERNAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[contains(text(), 'check_circle_outline')]"),
    [AuthorType.ANONYMOUS]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[contains(text(), 'person_outline')]"),
    [AuthorType.MANUAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[contains(text(), 'draw')]"),
  };


  public authorDescriptionField = By.xpath("//div[contains(@class,'author-description')]//textarea[@type='text']");
  public authorNameField = By.css('.image-container_description input[type="text"]')

  public driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  // ========== MÉTODOS ==========
  async fillAuthorField(data: NoteData, timeout: number, opts: RetryOptions): Promise<void> {
    const fullOpts: RetryOptions = { ...opts, label: stackLabel(opts.label, `[NoteAuthorField.fillAuthorField]`) }
    const hasDescription = !!data.authorDescription?.trim();
    const hasName = !!data.authorName?.trim();

    console.log('[NoteAuthorField.fillAuthorField] Revisando formato de autor requerido...')
    let authorType: AuthorType | undefined;
    if (!data.authorType) {
      if (hasName || hasDescription) {
        authorType = AuthorType.MANUAL;
      } else {
        return;
      }
    } else {
      authorType = data.authorType as AuthorType;
    }

    switch (authorType) {
      case AuthorType.INTERNAL:
        console.log('[NoteAuthorField.fillAuthorField] El tipo de autor es: ', AuthorType.INTERNAL)
        return;

      case AuthorType.ANONYMOUS:
        await this.selectAuthorType(AuthorType.ANONYMOUS, timeout, fullOpts);
        return;

      case AuthorType.MANUAL:
        await this.selectAuthorType(AuthorType.MANUAL, timeout, fullOpts);
        if (hasName) {
          await this.fillAuthorName(data.authorName!, timeout, fullOpts);
        }
        if (hasDescription) {
          await this.fillAuthorDescription(data.authorDescription!, timeout, fullOpts);
        }
        return;
    }
  }


  async selectAuthorType(type: AuthorType, timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, '[NoteAuthorField.selectAuthorType]') };
    const locator = this.authorButtonMap[type];

    console.log('[NoteAuthorField.selectAuthorType]')
    await clickSafe(this.driver, locator, timeout, fullOpts);
  }

  async fillAuthorName(name: string, timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, '[NoteAuthorField.fillAuthorName]') };

    console.log(`[NoteAuthorField.fillAuthorName] Rellenando nombre de autor...`);
    const element = await writeSafe(this.driver, this.authorNameField, name, timeout, fullOpts);
    await assertValueEquals(this.driver, element, this.authorNameField, name, 'El valor del nombre de autor no coincide');
  }

  async fillAuthorDescription(description: string, timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, '[NoteAuthorField.fillAuthorDescription]') };

    console.log(`[NoteAuthorField.fillAuthorDescription] Rellenando descripción de autor...`);
    const element = await writeSafe(this.driver, this.authorDescriptionField, description, timeout, fullOpts);
    await assertValueEquals(this.driver, element, this.authorDescriptionField, description, 'El valor de la descripción no coincide');
  }
}
