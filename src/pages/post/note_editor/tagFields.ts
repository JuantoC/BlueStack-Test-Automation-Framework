import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";

export enum NoteTagField {
  TAGS = 'tags',
  HIDDEN_TAGS = 'hiddenTags'
}

export class NoteTagsFields {
  // Locators centralizados y privados
  private readonly LOCATORS: Record<NoteTagField, Locator> = {
    [NoteTagField.TAGS]: By.css('div[id="claves-content"] input[role="combobox"]'),
    [NoteTagField.HIDDEN_TAGS]: By.css('div[id="clavesOcultas-content"] input[role="combobox"]')
  };

  constructor(private driver: WebDriver) {}

  /**
   * Agrega múltiples tags presionando Enter después de cada uno.
   */
  async addTags(type: NoteTagField, tags: string[], timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, `NoteTagsFields.addTags:${type}`) };
    const locator = this.LOCATORS[type];

    if (!tags || tags.length === 0) return;

    for (const tag of tags) {
      const sanitizedTag = tag.trim();
      if (!sanitizedTag) continue;

      console.log(`[Tags] Agregando: "${sanitizedTag}"`);
      // Nota: El \n es crítico aquí para que el componente de UI procese el tag
      await writeSafe(this.driver, locator, `${sanitizedTag}\n`, timeout, fullOpts);
    }
  }
}