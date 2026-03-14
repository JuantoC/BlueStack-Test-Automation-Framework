export type ListicleData = Pick<NoteData, 'listicleItems'>;
export type LiveBlogData = Pick<NoteData, 'listicleItems' | 'eventLiveBlog'>;

export abstract class BaseListicleSection {
  protected config: RetryOptions;

  private static readonly CREATE_MENU_BTN: Locator = By.css('.dropdown-noteList button');
  private static readonly ADD_OPT: Locator = By.id('option-dropdown-0');

  constructor(
    protected driver: WebDriver,
    protected strategy: ListicleStrategy,
    opts: RetryOptions
  ) {
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "BaseListicleSection") }
  }

  /**
     * Punto de entrada unificado para el Orquestador.
     * Recibe el objeto parcial y decide si debe ejecutar el llenado.
     */
  async fillAll(data: ListicleData | LiveBlogData): Promise<void> {

    await this.fillEventSection(data as LiveBlogData);

    if (!data.listicleItems || data.listicleItems.length === 0) {
      return;
    }

    await this.fillItems(data.listicleItems);
  }

  // --- Generadores de Locators ---

  private getIconLocator(uiIndex: number): Locator {
    return By.xpath(`//div[@id="note-list-${uiIndex}"]//mat-icon[contains(@class, "icon-up") or contains(@class, "icon-down")]`);
  }
  private getFieldLocator(uiIndex: number, type: 'title' | 'body'): Locator {
    const base = `//div[@id="note-list-${uiIndex}"]`;
    return type === 'body'
      ? By.xpath(`${base}//ckeditor[@id="ckNotaLista-${uiIndex}"]//div[@role="textbox"]`)
      : By.xpath(`${base}//textarea[@id="title-note-list-${uiIndex}"]`);
  }

  // --- Métodos de Acción ---

  protected async fillEventSection(data: LiveBlogData): Promise<void> {
    // Virtual method: default no-op
  }

  /**
   * Determina el estado y expande/colapsa según sea necesario.
   */
  async toggleExpansion(uiIndex: number, target: 'expand' | 'collapse') {

    const iconLocator = this.getIconLocator(uiIndex);

    try {
      const iconEl = await waitFind(this.driver, iconLocator, this.config);
      const className = await iconEl.getAttribute('class');
      const isExpanded = className.includes('icon-up');

      if (
        (target === 'expand' && !isExpanded) ||
        (target === 'collapse' && isExpanded)
      ) {
        logger.debug(
          `${target === 'expand' ? 'Expandiendo' : 'Colapsando'} ítem #${uiIndex}`,
          { label: this.config.label }
        );
        await clickSafe(this.driver, iconLocator, this.config);
      }
    } catch (error: any) {
      logger.error(
        `No se pudo interactuar con el icono del ítem #${uiIndex}`,
        { label: this.config.label, error: error.message }
      );
      throw error;
    }
  }


  /**
   * Provee y rellena múltiples ítems.
  */
  async fillItems(items: Array<{ title?: string; body?: string }>) {
    if (!items?.length) return;
    await step("Rellenar items Listicle o Liveblog", async (stepContext) => {
      stepContext.parameter("Número de items", `${items.length}`);

      // 1. Normalizar según estrategia
      const normalizedItems = this.strategy.normalizeItems(items);

      // 2. Crear slots (siempre hay 1 base)
      for (let i = 1; i < normalizedItems.length; i++) {
        await clickSafe(this.driver, BaseListicleSection.CREATE_MENU_BTN, this.config);
        await clickSafe(this.driver, BaseListicleSection.ADD_OPT, this.config);
      }

      // 3. Poblar datos (orden DOM real)
      for (let i = 0; i < normalizedItems.length; i++) {
        const uiIndex = i + 1;
        const item = normalizedItems[i];

        await this.toggleExpansion(uiIndex, 'expand');

        if (item.title) {
          const titleLoc = this.getFieldLocator(uiIndex, 'title');
          await writeSafe(this.driver, titleLoc, item.title, this.config);
        }

        if (item.body) {
          const bodyLoc = this.getFieldLocator(uiIndex, 'body');
          await writeSafe(this.driver, bodyLoc, item.body, this.config);
        }
      }
    });
  }
}

import { By, Locator, WebDriver } from "selenium-webdriver";
import { ListicleStrategy } from "./ListicleStrategy.js";
import { waitFind } from "../../../../core/actions/waitFind.js";
import { stackLabel } from "../../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../../core/actions/writeSafe.js";
import logger from "../../../../core/utils/logger.js";
import { NoteData } from "../../../../interfaces/data.js";
import { step } from "allure-js-commons";

