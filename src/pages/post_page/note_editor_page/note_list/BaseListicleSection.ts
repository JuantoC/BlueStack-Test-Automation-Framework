export type ListicleData = Pick<NoteData, 'listicleItems'>;
export type LiveBlogData = Pick<NoteData, 'listicleItems' | 'eventLiveBlog'>;

/**
 * Clase abstracta base para las secciones de lista del editor (Listicle y LiveBlog).
 * Define la lógica compartida de creación de slots, expansión de ítems y escritura de campos.
 * Implementa el patrón Strategy delegando en `ListicleStrategy` la normalización del orden de ítems,
 * permitiendo que `ListicleSection` y `LiveBlogSection` extiendan el comportamiento sin duplicar código.
 * Cada subclase puede sobrescribir `fillEventSection` para agregar comportamiento específico.
 */
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
   * Punto de entrada unificado para el orquestador del editor.
   * Primero delega en `fillEventSection` (hook sobrescribible por subclases para LiveBlog)
   * y luego rellena los ítems de la lista si existen en `data`.
   *
   * @param data - Datos de la sección de lista, incluyendo ítems y opcionalmente el evento LiveBlog.
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
   * Expande o colapsa un ítem de la lista según su estado actual y el destino indicado.
   * Lee el atributo `class` del ícono para determinar si el ítem está expandido (`icon-up`)
   * y solo hace click si el estado actual difiere del estado objetivo.
   *
   * @param uiIndex - Índice del ítem en el DOM (base 1, tal como lo asigna el CMS).
   * @param target - Estado objetivo: `'expand'` para abrir el ítem, `'collapse'` para cerrarlo.
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
   * Crea los slots necesarios y rellena cada ítem de la lista con título y cuerpo.
   * Primero normaliza el orden de los ítems según la estrategia (Standard o LiveBlog).
   * Luego crea los slots adicionales necesarios (siempre hay 1 base),
   * expande cada ítem y escribe sus campos usando `writeSafe`.
   *
   * @param items - Array de objetos con `title` y/o `body` para cada ítem de la lista.
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
        // Espera a que se abra el editor del nuevo item
        await sleep(500)
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
import { sleep } from "../../../../core/utils/backOff.js";

