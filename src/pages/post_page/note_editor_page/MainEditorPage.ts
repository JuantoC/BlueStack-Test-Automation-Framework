
/**
 * Page Object Maestro para la edición de notas.
 * Centraliza y coordina todas las secciones del editor.
*/
export class NoteEditorPage {
  // ========== SECCIONES (Private para forzar uso del Orquestador) ==========
  private driver: WebDriver;

  private readonly noteType: NoteType
  public readonly tags: EditorTagsSection;
  public readonly listicle: ListicleSection;
  public readonly liveBlog: LiveBlogSection;
  public readonly author: EditorAuthorSection;
  public readonly header: EditorHeaderActions;
  public readonly settings: EditorLateralSettings;
  public readonly text: EditorTextSection;
  public readonly creation: NewNoteBtn;
  public readonly images: EditorImageSection;

  constructor(driver: WebDriver, noteType: NoteType = NoteType.POST) {
    this.driver = driver;
    this.noteType = noteType;
    this.tags = new EditorTagsSection(driver);
    this.author = new EditorAuthorSection(driver);
    this.header = new EditorHeaderActions(driver);
    this.settings = new EditorLateralSettings(driver);
    this.text = new EditorTextSection(driver);
    this.creation = new NewNoteBtn(driver);
    this.listicle = new ListicleSection(driver);
    this.liveBlog = new LiveBlogSection(driver);
    this.images = new EditorImageSection(driver);
  }

  /**
   * Orquestador Principal: Rellena la nota de forma integral.
   * Coordina la ejecución de cada sub-sección con trazabilidad completa.
  */
  async fillFullNote(data: Partial<NoteData>, opts: RetryOptions = {}): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "NoteEditorPage") };

    await step("Completar formulario integral de la Nota", async (stepContext) => {
      // 1. Adjuntamos el payload completo de datos para tener contexto si falla
      attachment("Test Data (Payload)", JSON.stringify(data, null, 2), "application/json");
      stepContext.parameter("Note Type", this.noteType);

      try {
          await this.text.fillAll(data, config);
        
          await this.tags.fillAll(data, config);
        
          await this.fillListicleOrLiveblog(data, config);

          await this.author.fillAll(data, config);

          await this.settings.selectFirstSectionOption(config);

          await this.images.addFirstImage(config);

      } catch (error) {
        throw error;
      }
    });
  }

  // Método privado para manejar la bifurcación lógica sin ensuciar el flujo principal
  private async fillListicleOrLiveblog(data: Partial<NoteData>, config: any) {
    const hasItems = data.listicleItems && data.listicleItems.length > 0;
    const hasEvent = this.noteType === NoteType.LIVEBLOG && data.eventLiveBlog;

    if (!hasItems && !hasEvent) return;

    // Selección de la estrategia
    const section = (this.noteType === NoteType.LIVEBLOG) ? this.liveBlog : this.listicle;

    // Ejecutar
    await section.fillAll(data as LiveBlogData, config);
  }

  /**
   * Expone acciones del header (Guardar/Publicar) de forma controlada.
   */
  public get actions(): EditorHeaderActions {
    return this.header;
  }

}

import { WebDriver } from 'selenium-webdriver';
import { EditorAuthorSection } from "./EditorAuthorSection.js";
import { EditorHeaderActions } from "./EditorHeaderActions.js";
import { EditorLateralSettings } from "./EditorLateralSettings.js";
import { EditorTextSection } from "./EditorTextSection.js";
import { NewNoteBtn, NoteType } from "../../sidebar_options/NewNoteBtn.js";
import { EditorTagsSection } from './EditorTagsSection.js';
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";
import { stackLabel } from '../../../core/utils/stackLabel.js';
import { ListicleSection, LiveBlogSection } from './noteList/ListicleItemSection.js';
import { EditorImageSection } from './EditorImagesSection.js'; import { LiveBlogData } from './noteList/BaseListicleSection.js';
import { step, parameter, attachment } from "allure-js-commons";
