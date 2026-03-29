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
  public readonly creation: NewNoteBtn;
  public readonly images: EditorImageSection;
  public readonly banner: Banners;

  constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "MainEditorPage") };
    this.noteType = noteType || 'POST';
    this.tags = new EditorTagsSection(driver, this.config);
    this.author = new EditorAuthorSection(driver, this.config);
    this.header = new EditorHeaderActions(driver, this.config);
    this.settings = new EditorLateralSettings(driver, this.config);
    this.text = new EditorTextSection(driver, this.config);
    this.creation = new NewNoteBtn(driver, this.config);
    this.listicle = new ListicleSection(driver, this.config);
    this.liveBlog = new LiveBlogSection(driver, this.config);
    this.images = new EditorImageSection(driver, this.config);
    this.banner = new Banners(driver, { ...this.config, timeoutMs: 15000 });
  }

  /**
   * Orquestador Principal: Rellena la nota de forma integral coordinando todas las sub-secciones.
   * Secuencia: texto → tags → listicle/liveblog (si aplica) → autor → sección → imagen principal.
   * Monitorea banners entre cada sección para detectar errores de backend de forma temprana.
   * Adjunta los datos de la nota al reporte Allure como artefacto JSON para trazabilidad.
   *
   * @param data - Objeto parcial de `NoteData` con todos los campos a completar en el editor.
   */
  async fillFullNote(data: Partial<NoteData>): Promise<void> {
    await step(`Rellenado de la nota con datos dinámicos`, async (stepContext) => {
      attachment(`${this.noteType} Data`, JSON.stringify(data, null, 2), "application/json");
      this.noteType && stepContext.parameter("Note Type", this.noteType)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      logger.info(`Iniciando llenado dinámico de campos`, { label: this.config.label });
      try {
        await this.text.fillAll(data);
        await this.banner.checkBanners(false);

        await this.tags.fillAll(data);
        await this.banner.checkBanners(false);

        await this.fillListicleOrLiveblog(data);

        await this.author.fillAll(data);
        await this.banner.checkBanners(false);

        await this.settings.selectSectionOption();
        await this.banner.checkBanners(false);

        await this.images.selectAndWriteMainImage();
        await this.banner.checkBanners(false);

        logger.info('Todos los campos de la nota fueron completados exitosamente', { label: this.config.label })

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
   * Ejecuta la acción de cierre del editor (guardar, publicar o salir) delegando en `EditorHeaderActions`.
   * Para acciones de publicación o guardado simple (`PUBLISH_ONLY`, `SAVE_ONLY`), también
   * verifica el banner de éxito obligatorio antes de resolver.
   *
   * @param exitAction - Tipo de acción de cierre del editor (SAVE_ONLY, PUBLISH_AND_EXIT, etc.).
   */
  async closeNoteEditor(exitAction: NoteExitAction): Promise<void> {
    await step(`Cerrar editor de nota con acción ${exitAction}`, async () => {
      try {
        logger.info(`Ejecutando salida del editor: ${exitAction}`, { label: this.config.label });
        await this.header.clickExitAction(exitAction);

        if (exitAction === "PUBLISH_ONLY" || exitAction === "SAVE_ONLY") {
          await this.banner.checkBanners(true);
        }
        logger.info(`Editor ejecuto accion del header correctamente.`, { label: this.config.label });

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
    const hasEvent = this.noteType === 'LIVEBLOG' && data.eventLiveBlog;

    if (!hasItems && !hasEvent) return;

    // Selección de la estrategia
    const section = (this.noteType === 'LIVEBLOG') ? this.liveBlog : this.listicle;

    // Ejecutar
    await section.fillAll(data as LiveBlogData);
    await this.banner.checkBanners(false);
  }

  /**
   * Expone la instancia de `EditorHeaderActions` para acceso controlado desde tests.
   * Permite interactuar directamente con las acciones del header cuando se necesita granularidad.
   *
   * @returns {EditorHeaderActions} La instancia compartida del componente de acciones del header.
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
import { EditorTagsSection } from './EditorTagsSection.js';
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { NoteData } from "../../../interfaces/data.js";
import { stackLabel } from '../../../core/utils/stackLabel.js';
import { ListicleSection, LiveBlogSection } from './note_list/ListicleItemSection.js';
import { EditorImageSection } from './EditorImagesSection.js';
import { LiveBlogData } from './note_list/BaseListicleSection.js';
import { step, attachment } from "allure-js-commons";
import logger from '../../../core/utils/logger.js';
import { NewNoteBtn, NoteType } from '../NewNoteBtn.js';
import { Banners } from '../../modals/Banners.js';

