/**
 * Page Object Maestro para la pagina de noticias.
 * Centraliza y coordina todas las secciones de la pagina de noticias.
*/
export class MainPostPage {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly NoteType: NoteType
  private readonly table: PostTable
  private readonly createBtn: NewNoteBtn
  private readonly footer: FooterActions
  private readonly banner: Banners;

  constructor(driver: WebDriver, NoteType: NoteType, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainPostPage");
    this.NoteType = NoteType || 'POST';

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

      } catch (error: unknown) {
        logger.error(`Error al seleccionar y publicar posts: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Localiza una nota en la tabla por su título y ejecuta el cambio de título inline.
   * Busca el contenedor con `PostTable.getPostContainerByTitle`, delega la edición en
   * `PostTable.changePostTitle`, verifica el resultado con `Banners` y espera que el
   * indicador de carga desaparezca. El flujo completo está envuelto en un `retry`.
   *
   * @param title - Fragmento del título actual de la nota a modificar.
   */
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
      } catch (error: unknown) {
        logger.error(`Error al cambiar el titulo de la nota: ${getErrorMessage(error)}`, {
          label: this.config.label,
          title: title,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  /**
   * Navega hacia el editor de una nota específica identificada por su título.
   * Busca el contenedor de la nota con `PostTable.getPostContainerByTitle` y hace click
   * en el botón de edición. Monitorea banners post-navegación sin esperar éxito obligatorio.
   *
   * @param postTitle - Fragmento del título de la nota a abrir en el editor.
   */
  async enterToEditorPage(postTitle: string) {
    await step(`Entrando a la edicion de la nota: "${postTitle}"`, async () => {
      try {
        const postContainer = await this.table.getPostContainerByTitle(postTitle);

        logger.debug("Ejecutando el click en el boton de edicion", { label: this.config.label })
        await this.table.clickEditorButton(postContainer);

        await this.banner.checkBanners(false);

        logger.info('Entrada a la edicion de la nota exitosa.', { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al cambiar el titulo de la nota: ${getErrorMessage(error)}`, {
          label: this.config.label,
          title: postTitle,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  /**
   * Crea una nueva nota del tipo indicado mediante el menú desplegable de creación.
   * Delega en `NewNoteBtn.selectNoteType` y monitorea banners tras la apertura del editor.
   * Si no se pasa un tipo explícito, usa el `NoteType` con el que fue instanciado el Maestro.
   *
   * @param newNoteType - Tipo de nota a crear. Por defecto usa el tipo del constructor.
   */
  async createNewNote(newNoteType: NoteType = this.NoteType) {
    await step(`Crear nueva nota ${newNoteType}`, async () => {
      try {
        logger.info(`Abriendo modal para nueva nota: ${newNoteType}`, { label: this.config.label });
        await this.createBtn.selectNoteType(newNoteType);

        await this.banner.checkBanners(false);

        logger.info(`Nueva nota tipo: ${newNoteType} creada exitosamente`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error en flujo de creación [${newNoteType}]: ${getErrorMessage(error)}`, { label: this.config.label });
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
    } catch (error: unknown) {
      logger.error(`Error al obtener los ultimos ${numberOfPosts} posts: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}

import { WebDriver, WebElement } from 'selenium-webdriver';
import { RetryOptions, DefaultConfig, resolveRetryConfig } from "../../core/config/defaultConfig.js";
import { stackLabel } from '../../core/utils/stackLabel.js';
import { step } from "allure-js-commons";
import logger from '../../core/utils/logger.js';
import { PostTable } from './PostTable.js';
import { NewNoteBtn, NoteType } from './NewNoteBtn.js';
import { FooterActions } from '../FooterActions.js';
import { retry } from '../../core/wrappers/retry.js';
import { Banners } from '../modals/Banners.js';
import { getErrorMessage } from '../../core/utils/errorUtils.js';

