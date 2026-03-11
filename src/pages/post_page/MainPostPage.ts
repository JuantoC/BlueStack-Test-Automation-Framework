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
    this.noteType = noteType || NoteType.POST;

    this.table = new PostTable(driver, this.config);
    this.createBtn = new NewNoteBtn(driver, this.config)
  }

  async changePostTitle(title: string) {
    await step(`Cambiando titulo de la nota inline: "${title}"`, async (stepContext) => {
      stepContext.parameter("Titulo de la nota", title);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug("Ejecutando busqueda del contenedor para el titulo de la nota...", this.config.label)
        const postContainer = await this.table.getPostContainerByTitle(title);

        logger.debug("Ejecutando el cambio de titulo.")
        await this.table.changePostTitle(postContainer);
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
    await step(`Entrando a la edicion de la nota: "${postTitle}"`, async (stepContext) => {
      stepContext.parameter("Titulo de la nota", postTitle);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        const postContainer = await this.table.getPostContainerByTitle(postTitle);

        logger.debug("Ejecutando el click en el boton de edicion", this.config.label)
        await this.table.clickEditorButton(postContainer);
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
    await step(`Crear nueva nota: ${this.noteType}`, async (stepContext) => {
      stepContext.parameter("Note Type", this.noteType);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.info(`Abriendo editor para nueva nota: ${this.noteType}`, { label: this.config.label });
        await this.createBtn.selectNoteType(this.noteType);
        logger.debug(`Editor de nota abierto exitosamente para tipo: ${this.noteType}`, { label: this.config.label });
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
import { NoteType } from './NewNoteBtn.js';
import { PostTable } from './PostTable.js';
import { NewNoteBtn } from './NewNoteBtn.js';

