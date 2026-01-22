import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import { RetryOptions } from "../../../core/config/default.js";
import { waitFind } from "../../../core/utils/waitFind.js";

export class listicleFields {
  // Locators estáticos para la creación
  private readonly CREATE_MENU_BTN = By.css('.dropdown-noteList button');
  private readonly ADD_OPTION_BTN = By.css('div#option-dropdown-0');

  constructor(private driver: WebDriver) { }

  private async createNewListItem(timeout: number, opts: RetryOptions): Promise<void> {
    await clickSafe(this.driver, this.CREATE_MENU_BTN, timeout, opts);
    await clickSafe(this.driver, this.ADD_OPTION_BTN, timeout, opts);
  }

  /**
   * Generador dinámico de locators basado en índice
   */
  private getFieldLocator(index: number, isBody: boolean): Locator {
    const base = `//div[@id="note-list-${index}"]`;
    return isBody
      ? By.xpath(`${base}//ckeditor[@id="ckNotaLista-${index}"]//div[@role="textbox"]`)
      : By.xpath(`${base}//textarea[@id="title-note-list-${index}"]`);
  }

  private getExpandIconLocator(index: number): Locator {
    // Buscamos el mat-icon que tenga alguna de las dos clases dentro del contenedor del item
    return By.xpath(`//div[@id="note-list-${index}"]//mat-icon[contains(@class, "icon-up") or contains(@class, "icon-down")]`);
  }

  /**
   * Determina si un item del listicle está expandido o colapsado.
   * @returns 'expanded' | 'collapsed'
  */
  async getListicleItemState(index: number, timeout: number): Promise<'expanded' | 'collapsed'> {
    const locator = this.getExpandIconLocator(index);

    // 1. Esperar y obtener el elemento
    const iconElement = await waitFind(this.driver, locator, timeout);

    // 2. Obtener el valor del atributo "class"
    const classAttribute = await iconElement.getAttribute('class');

    if (classAttribute.includes('icon-up')) {
      return 'expanded';
    } else {
      return 'collapsed';
    }
  }

  async ensureItemExpanded(index: number, timeout: number, opts: RetryOptions): Promise<void> {
    const state = await this.getListicleItemState(index, timeout);

    if (state === 'collapsed') {
      console.log(`[Listicle #${index}] Está colapsado. Expandiendo...`);
      const locator = this.getExpandIconLocator(index);
      await clickSafe(this.driver, locator, timeout, opts);
    }
  }

  async fillListicleItems(items: Array<{ title: string; body: string }>, timeout: number, opts: RetryOptions = {}): Promise<void> {
    if (!items?.length) return;

    // 1. Provisionamiento (Solo creamos los necesarios, asumiendo que el 1ero ya existe)
    for (let i = 1; i < items.length; i++) {
      console.log(`[Listicle] Asegurando existencia del ítem #${i + 1}`);
      await this.createNewListItem(timeout, opts);
    }

    // 2. Población
    for (let i = 0; i < items.length; i++) {
      const uiIndex = i + 1;
      const { title, body } = items[i];
      await this.ensureItemExpanded(uiIndex, timeout, opts);

      if (title) {
        const loc = this.getFieldLocator(uiIndex, false);
        const el = await writeSafe(this.driver, loc, title, timeout, opts);
        await assertValueEquals(this.driver, el, loc, title);
      }

      if (body) {
        const loc = this.getFieldLocator(uiIndex, true);
        await writeSafe(this.driver, loc, body, timeout, opts);
      }
    }
  }
}