
/**
 * Page Object Maestro para la edición de notas.
 * Centraliza y coordina todas las secciones del editor.
*/
export class NoteEditorPage {
  // ========== SECCIONES (Private para forzar uso del Orquestador) ==========
  private driver: WebDriver;

  private readonly noteType: NoteType
  public readonly tags: NoteTagsSection;
  public readonly listicle: ListicleSection;
  public readonly liveBlog: LiveBlogSection;
  public readonly author: NoteAuthorSection;
  public readonly header: NoteHeaderActions;
  public readonly settings: NoteLateralSettings;
  public readonly text: NoteTextContentSection;
  public readonly creation: NoteCreationDropdown;
  public readonly images: NoteImageSection;

  constructor(driver: WebDriver, noteType?: NoteType) {
    this.driver = driver;
    this.noteType = noteType = NoteType.POST;
    this.tags = new NoteTagsSection(driver);
    this.author = new NoteAuthorSection(driver);
    this.header = new NoteHeaderActions(driver);
    this.settings = new NoteLateralSettings(driver);
    this.text = new NoteTextContentSection(driver);
    this.creation = new NoteCreationDropdown(driver);
    this.listicle = new ListicleSection(driver);
    this.liveBlog = new LiveBlogSection(driver);
    this.images = new NoteImageSection(driver);
  }

  /**
   * Orquestador Principal: Rellena la nota de forma integral.
   * Coordina la ejecución de cada sub-sección con trazabilidad completa.
  */
  async fillFullNote(data: Partial<NoteData>, opts: RetryOptions = {}): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "NoteEditorPage") };

    try {
      // 1. Delegación total: El orquestador no sabe qué campos de texto existen
      await this.text.fillAll(data, config);

      // 2. Tags: La sección de tags debería manejar internamente si vienen vacíos
      await this.tags.fillAll(data, config);

      // 3. Lógica de tipo de nota: Encapsulada
      await this.fillListicleOrLiveblog(data, config);

      // 4. Autor
      await this.author.fillAll(data, config);

      // 5. Combo de secciones en settings
      await this.settings.selectFirstSectionOption(config);

      // 6. Imagenes
      await this.images.addFirstImage(config);

    } catch (error) {
      throw error;
    }
  }

  // Método privado para manejar la bifurcación lógica sin ensuciar el flujo principal
  private async fillListicleOrLiveblog(data: Partial<NoteData>, config: any) {
    if (!data.listicleItems?.length) return;

    const section = (this.noteType === NoteType.LIVEBLOG) ? this.liveBlog : this.listicle;
    await section.fillItems(data.listicleItems, config);
  }

  /**
   * Expone acciones del header (Guardar/Publicar) de forma controlada.
   */
  public get actions(): NoteHeaderActions {
    return this.header;
  }

}

import { WebDriver } from 'selenium-webdriver';
import { NoteAuthorSection } from "./NoteAuthorSection.js";
import { NoteHeaderActions } from "./NoteHeaderActions.js";
import { NoteLateralSettings } from "./NoteLateralSettings.js";
import { NoteTextContentSection, NoteTextField } from "./NoteTextContentSection.js";
import { NoteCreationDropdown, NoteType } from "./NoteCreationDropdown.js";
import { NoteTagsSection, NoteTagField } from './NoteTagsSection.js';
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";
import { stackLabel } from '../../../core/utils/stackLabel.js';
import { ListicleSection, LiveBlogSection } from './noteList/NoteListicleItemSection.js';
import { NoteImageSection } from './NoteImagesSection.js';
