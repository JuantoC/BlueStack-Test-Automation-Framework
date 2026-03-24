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
  private readonly footer: FooterActions
  private readonly banner: Banners;

  constructor(driver: WebDriver, noteType: NoteType, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "MainPostPage") };
    this.noteType = noteType || 'POST';

    this.table = new PostTable(driver, this.config);
    this.createBtn = new NewNoteBtn(driver, this.config)
    this.footer = new FooterActions(this.driver, this.config)
    this.banner = new Banners(driver, this.config);
  }

  /**
   * Selecciona uno o varios Posts en la tabla y los publica mediante la acción del footer.
   * Itera sobre cada contenedor de post recibido y delega la selección en `PostTable.selectPost`.
   * Finaliza con una acción de publicación mediante `FooterActions.clickFooterAction`.
   *
   * @param posts - Array de contenedores WebElement de los posts que se desean seleccionar y publicar.
   */
  async selectAndPublishFooter(posts: WebElement[]): Promise<any> {
    await step("Seleccionar y publicar posts", async (stepContext) => {
      stepContext.parameter("Cantidad", posts.length.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug('Seleccionando el/los posts enviados...', { label: this.config.label })
        for (const post of posts) {
          await this.table.selectPost(post);
        }
        logger.debug('Post/s seleccionados correctamente, procediendo a su publicacion...', { label: this.config.label })
        await this.footer.clickFooterAction('PUBLISH_ONLY')
        logger.info('Post/s publicados exitosamente', { label: this.config.label })

      } catch (error: any) {
        logger.error(`Error al seleccionar y publicar posts: ${error.message}`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  async changePostTitle(title: string) {
    await step(`Cambiando titulo de la nota inline: "${title}"`, async () => {
      try {
        await retry(async () => {
          const postContainer = await this.table.getPostContainerByTitle(title);
          await this.table.changePostTitle(postContainer);

          await this.banner.checkBanners(true);
          await this.table.waitForLoadingContainerDisappear();

          logger.info('Cambio de titulo ejecutado correctamente', { label: this.config.label })
        }, this.config);
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

        await this.banner.checkBanners(false);

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

  async createNewNote() {
    await step(`Crear nueva nota ${this.noteType}`, async () => {
      try {
        logger.info(`Abriendo modal para nueva nota: ${this.noteType}`, { label: this.config.label });
        await this.createBtn.selectNoteType(this.noteType);

        await this.banner.checkBanners(false);

        logger.info(`Nueva nota tipo: ${this.noteType} creada exitosamente`, { label: this.config.label });
      } catch (error: any) {
        logger.error(`Error en flujo de creación [${this.noteType}]: ${error.message}`, { label: this.config.label });
        throw error;
      }
    });
  }

  /**
   * Obtiene un array de contenedores WebElement de los primeros N posts de la tabla.
   * Itera por índice comenzando desde 0 y delega cada búsqueda en `PostTable.getVideoContainerByIndex`.
   *
   * @param numberOfPosts - Cantidad de posts a recuperar desde la parte superior de la tabla.
   * @returns {Promise<WebElement[]>} Array con los contenedores DOM de los posts solicitados.
   */
  async getPostContainers(numberOfPosts: number): Promise<WebElement[]> {
    try {
      let posts = []
      for (let i = 0; i < numberOfPosts; i++) {
        const post = await this.table.getPostContainerByIndex(i);
        posts.push(post)
      }
      return posts
    } catch (error: any) {
      logger.error(`Error al obtener los ultimos ${numberOfPosts} posts: ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }
}

import { WebDriver, WebElement } from 'selenium-webdriver';
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from '../../core/utils/stackLabel.js';
import { step } from "allure-js-commons";
import logger from '../../core/utils/logger.js';
import { PostTable } from './PostTable.js';
import { NewNoteBtn, NoteType } from './NewNoteBtn.js';
import { FooterActions } from '../FooterActions.js';
import { retry } from '../../core/wrappers/retry.js';
import { Banners } from '../modals/Banners.js';

