import { WebDriver, By, Locator } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";

export enum NoteTagField {
  TAGS = 'tags',
  HIDDEN_TAGS = 'hiddenTags'
}

/**
 * Representa solo la parte de NoteData que esta sección sabe manejar.
 */
export type NoteTagsData = Pick<NoteData, 'tags' | 'hiddenTags'>;

/**
 * Gestiona la sección de etiquetas (Tags) y etiquetas ocultas de la nota.
 */
export class NoteTagsSection {
  // ========== LOCATORS (Private & Readonly) ==========
  private readonly LOCATORS: Record<NoteTagField, Locator> = {
    [NoteTagField.TAGS]: By.css('div[id="claves-content"] input[role="combobox"]'),
    [NoteTagField.HIDDEN_TAGS]: By.css('div[id="clavesOcultas-content"] input[role="combobox"]')
  };

  constructor(private driver: WebDriver) { }

  /**
     * Método de alto nivel para llenar todos los tags disponibles en la data.
     */
  async fillAll(data: NoteTagsData, opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "NoteTagsSection.fillAll")
    };

    // La lógica de "si existe, hacelo" vive aquí. 
    // El orquestador ya no tiene que preguntar.
    if (data.tags?.length) {
      await this.addTags(NoteTagField.TAGS, data.tags, config);
    }

    if (data.hiddenTags?.length) {
      await this.addTags(NoteTagField.HIDDEN_TAGS, data.hiddenTags, config);
    }
  }

  /**
   * Agrega múltiples tags presionando Enter después de cada uno para procesarlos.
   * @param type Tipo de tag (Visible u Oculto).
   * @param tags Array de strings con las etiquetas.
   * @param opts Opciones de reintento y trazabilidad.
   */
  async addTags(type: NoteTagField, tags: string[], opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, `addTags(${type})`)
    };

    if (!tags?.length) return;

    const locator = this.LOCATORS[type];

    try {
      for (const tag of tags) {
        const sanitizedTag = tag.trim();
        if (!sanitizedTag) continue;

        logger.debug(`Procesando tag: "${sanitizedTag}"`, { label: config.label });

        // El salto de línea \n actúa como la tecla ENTER para confirmar el tag en el componente UI
        await writeSafe(this.driver, locator, `${sanitizedTag}\n`, config);
      }

      logger.debug(`Se agregaron ${tags.length} etiquetas exitosamente al campo ${type}`, { label: config.label });
    } catch (error) {
      // Propagamos: writeSafe ya reportó cuál tag falló o si el campo no era interactuable
      throw error;
    }
  }
}