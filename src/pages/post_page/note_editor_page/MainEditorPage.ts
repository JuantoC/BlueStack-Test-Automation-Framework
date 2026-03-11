/**
 * Page Object Maestro para la edición de notas.
 * Centraliza y coordina todas las secciones del editor.
*/
export class MainEditorPage {
  private driver: WebDriver;
  private config: RetryOptions;
  private readonly noteType: NoteType
  public readonly tags: EditorTagsSection;
  public readonly listicle: ListicleSection;
  public readonly liveBlog: LiveBlogSection;
  public readonly author: EditorAuthorSection;
  public readonly header: EditorHeaderActions;
  public readonly settings: EditorLateralSettings;
  public readonly text: EditorTextSection;
  public readonly creation: SidebarSection;
  public readonly images: EditorImageSection;

  constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "MainEditorPage") };
    this.noteType = noteType || NoteType.POST;
    this.tags = new EditorTagsSection(driver, this.config);
    this.author = new EditorAuthorSection(driver, this.config);
    this.header = new EditorHeaderActions(driver, this.config);
    this.settings = new EditorLateralSettings(driver, this.config);
    this.text = new EditorTextSection(driver, this.config);
    this.creation = new SidebarSection(driver, this.config);
    this.listicle = new ListicleSection(driver, this.config);
    this.liveBlog = new LiveBlogSection(driver, this.config);
    this.images = new EditorImageSection(driver, this.config);
  }

  /**
   * Orquestador Principal: Rellena la nota de forma integral.
   * Coordina la ejecución de cada sub-sección con trazabilidad completa.
  */
  async fillFullNote(data: Partial<NoteData>): Promise<void> {
    await step(`Rellenado de la nota con datos dinámicos`, async (stepContext) => {
      attachment("Test Data", JSON.stringify(data, null, 2), "application/json");
      this.noteType && stepContext.parameter("Note Type", this.noteType)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      logger.info(`Iniciando llenado dinámico de campos`, { label: this.config.label });
      try {
        await this.text.fillAll(data);

        await this.tags.fillAll(data);

        await this.fillListicleOrLiveblog(data);

        await this.author.fillAll(data);

        await this.settings.selectFirstSectionOption();

        await this.images.selectAndWriteMainImage();

      } catch (error: any) {
        logger.error(`Fallo en el rellenado dinámico de la nota: ${error.message}`, {
          label: this.config.label,
          error: error.message
        });
        throw error;
      }
      logger.info(`Llenado dinámico finalizado con éxito`, { label: this.config.label });
    });
  }


  /**
   * Flow: Finalización y salida del editor.
   * Utiliza el getter 'actions' para interactuar con el Header de forma segura.
   */
  async closeNoteEditor(exitAction: NoteExitAction): Promise<void> {
    await step(`Cerrar editor de nota con acción: ${exitAction}`, async (stepContext) => {
      stepContext.parameter("Exit Action", exitAction);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.info(`Ejecutando salida del editor: ${exitAction}`, { label: this.config.label });
        await this.header.clickExitAction(exitAction);
        logger.info(`Editor cerrado exitosamente.`, { label: this.config.label });

      } catch (error: any) {
        logger.error(`Error en flujo de cierre (${exitAction}): ${error.message}`, {
          label: this.config.label,
          exitAction: exitAction,
          error: error.message
        });
        throw error;
      }
    });
  }

  // ====================
  //      HELPERS
  // ====================
  // Método privado para manejar la bifurcación lógica sin ensuciar el flujo principal
  private async fillListicleOrLiveblog(data: Partial<NoteData>) {
    const hasItems = data.listicleItems && data.listicleItems.length > 0;
    const hasEvent = this.noteType === NoteType.LIVEBLOG && data.eventLiveBlog;

    if (!hasItems && !hasEvent) return;

    // Selección de la estrategia
    const section = (this.noteType === NoteType.LIVEBLOG) ? this.liveBlog : this.listicle;

    // Ejecutar
    await section.fillAll(data as LiveBlogData);
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
import { EditorHeaderActions, NoteExitAction } from "./EditorHeaderActions.js";
import { EditorLateralSettings } from "./EditorLateralSettings.js";
import { EditorTextSection } from "./EditorTextSection.js";
import { SidebarSection, NoteType } from "../SidebarSection.js";
import { EditorTagsSection } from './EditorTagsSection.js';
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { NoteData } from "../../../interfaces/data.js";
import { stackLabel } from '../../../core/utils/stackLabel.js';
import { ListicleSection, LiveBlogSection } from './noteList/ListicleItemSection.js';
import { EditorImageSection } from './EditorImagesSection.js'; import { LiveBlogData } from './noteList/BaseListicleSection.js';
import { step, parameter, attachment } from "allure-js-commons"; import logger from '../../../core/utils/logger.js';

