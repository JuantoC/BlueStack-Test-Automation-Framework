import { WebDriver } from 'selenium-webdriver';
import { NoteAuthorSection } from "./NoteAuthorSection.js";
// import { NoteFooterBtn } from "./footerBtn.js"; // Pendiente sanitizar
import { NoteHeaderActions } from "./NoteHeaderActions.js";
import { NoteLateralSettings } from "./NoteLateralSettings.js";
import { NoteTextContentSection, NoteTextField } from "./NoteTextContentSection.js";
// import { NoteImageFields } from "./imageFields.js"; // Pendiente sanitizar
import { NoteCreationDropdown } from "./NoteCreationDropdown.js";
import { NoteTagsSection, NoteTagField } from './NoteTagsSection.js';
import { NoteListicleSection } from './NoteListicleSection.js';

import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";
import { stackLabel } from '../../../core/utils/stackLabel.js';
import logger from "../../../core/utils/logger.js";

/**
 * Page Object Maestro para la edición de notas.
 * Centraliza y coordina todas las secciones del editor.
 */
export class NoteEditorPage {
  // ========== SECCIONES (Private para forzar uso del Orquestador) ==========
  private readonly tags: NoteTagsSection;
  private readonly listicle: NoteListicleSection;
  private readonly author: NoteAuthorSection;
  private readonly header: NoteHeaderActions;
  private readonly settings: NoteLateralSettings;
  private readonly text: NoteTextContentSection;
  private readonly creation: NoteCreationDropdown;

  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.tags = new NoteTagsSection(driver);
    this.listicle = new NoteListicleSection(driver);
    this.author = new NoteAuthorSection(driver);
    this.header = new NoteHeaderActions(driver);
    this.settings = new NoteLateralSettings(driver);
    this.text = new NoteTextContentSection(driver);
    this.creation = new NoteCreationDropdown(driver);
    // this.image = new NoteImageFields(driver); // Ajustar cuando se sanitice
  }

  /**
   * Orquestador Principal: Rellena la nota de forma integral.
   * Coordina la ejecución de cada sub-sección con trazabilidad completa.
   */
  async fillFullNote(data: Partial<NoteData>, opts: RetryOptions = {}): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "NoteEditorPage")
    };

    logger.info(`Iniciando llenado integral de la nota: "${data.title || 'Sin Título'}"`, { label: config.label });

    try {
      // 1. Procesamiento de Textos Principales
      const textMapping: Array<{ key: keyof NoteData; type: NoteTextField }> = [
        { key: 'title', type: NoteTextField.TITLE },
        { key: 'secondaryTitle', type: NoteTextField.SECONDARY_TITLE },
        { key: 'subTitle', type: NoteTextField.SUB_TITLE },
        { key: 'halfTitle', type: NoteTextField.HALF_TITLE },
        { key: 'body', type: NoteTextField.BODY },
        { key: 'summary', type: NoteTextField.SUMMARY },
      ];

      for (const { key, type } of textMapping) {
        const value = data[key];
        if (typeof value === 'string' && value.trim()) {
          await this.text.fillField(type, value, config);
        }
      }

      // 2. Tags
      if (data.tags?.length) {
        await this.tags.addTags(NoteTagField.TAGS, data.tags, config);
      }
      if (data.hiddenTags?.length) {
        await this.tags.addTags(NoteTagField.HIDDEN_TAGS, data.hiddenTags, config);
      }

      // 3. Listicle
      if (data.listicleItems?.length) {
        await this.listicle.fillListicleItems(data.listicleItems, config);
      }

      // 4. Autor y Configuración Lateral
      await this.author.fillAuthorData(data, config);
      await this.settings.selectFirstSectionOption(config);

      logger.info("Llenado integral de la nota finalizado exitosamente.", { label: config.label });

    } catch (error) {
      // Regla de Oro: No logueamos el error aquí porque las funciones hijas ya lo hicieron.
      // Solo propagamos para que el Test Runner marque la falla.
      throw error;
    }
  }

  /**
   * Expone acciones del header (Guardar/Publicar) de forma controlada.
   */
  public get actions(): NoteHeaderActions {
    return this.header;
  }
}