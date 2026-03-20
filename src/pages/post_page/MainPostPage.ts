/**
 * Page Object Maestro para la pagina de noticias.
 * Centraliza y coordina todas las secciones de la pagina de noticias.
*/
export class MainPostPage {
  private driver: WebDriver;
  private config: RetryOptions;
  private readonly noteType: NoteType

  private readonly table: PostTable
  private readonly createBtn: NewNoteBtn

  constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "MainPostPage") };
    this.noteType = noteType || 'POST';

    this.table = new PostTable(driver, this.config);
    this.createBtn = new NewNoteBtn(driver, this.config)
  }

  async changePostTitle(title: string) {
    await step(`Cambiando titulo de la nota inline: "${title}"`, async () => {
      try {
        logger.debug("Ejecutando busqueda del contenedor para el titulo de la nota...", { label: this.config.label })
        const postContainer = await this.table.getPostContainerByTitle(title);

        logger.debug("Ejecutando el cambio de titulo.", { label: this.config.label })
        await this.table.changePostTitle(postContainer);
        logger.info('Cambio de titulo ejecutado correctamente', { label: this.config.label })
      } catch (error: any) {
        logger.error(`Error al cambiar el titulo de la nota: ${error.message}`, {
          label: this.config.label,
          title: title,
          error: error.message
        })
        throw error;
      }
    });
  }

  async enterToEditorPage(postTitle: string) {
    await step(`Entrando a la edicion de la nota: "${postTitle}"`, async () => {
      try {
        const postContainer = await this.table.getPostContainerByTitle(postTitle);

        logger.debug("Ejecutando el click en el boton de edicion", { label: this.config.label })
        await this.table.clickEditorButton(postContainer);
        logger.info('Entrada a la edicion de la nota exitosa.', { label: this.config.label })
      } catch (error: any) {
        logger.error(`Error al cambiar el titulo de la nota: ${error.message}`, {
          label: this.config.label,
          title: postTitle,
          error: error.message
        })
        throw error;
      }
    });
  }

  /** 
   * Inicio de creación de nota.
   * Centraliza el acceso al menú de creación a través del PO Maestro.
   */
  async createNewNote() {
    await step(`Crear nueva nota ${this.noteType}`, async () => {
      try {
        logger.info(`Abriendo modal para nueva nota: ${this.noteType}`, { label: this.config.label });
        await this.createBtn.selectNoteType(this.noteType);
        logger.info(`Nueva nota tipo: ${this.noteType} creada exitosamente`, { label: this.config.label });
      } catch (error: any) {
        logger.error(`Error en flujo de creación [${this.noteType}]: ${error.message}`, { label: this.config.label });
        throw error;
      }
    });
  }
}

import { WebDriver } from 'selenium-webdriver';
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from '../../core/utils/stackLabel.js';
import { step } from "allure-js-commons";
import logger from '../../core/utils/logger.js';
import { PostTable } from './PostTable.js';
import { NewNoteBtn, NoteType } from './NewNoteBtn.js';

