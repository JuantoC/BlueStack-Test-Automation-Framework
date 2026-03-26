import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { UploadVideoBtn, VideoType } from "./UploadVideoBtn.js";
import { UploadVideoModal } from "./UploadVideoModal.js";
import { VideoTable } from "./VideoTable.js";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { VideoData } from "../../interfaces/data.js";
import { ActionType, VideoActions } from "./VideoActions.js";
import { FooterActions } from "../FooterActions.js";
import { CKEditorImageModal } from "../modals/CKEditorImageModal.js";
import { Banners } from "../modals/Banners.js";

/**
 * Page Object Maestro para la sección de Videos del CMS.
 * Actúa como Orquestador central que coordina las sub-secciones de videos.
 * Es el punto de entrada para cualquier flujo de pruebas que involucre la creación,
 * edición, publicación o interacción con videos en la tabla multimedia.
 *
 * @example
 * const page = new MainVideoPage(driver, { timeoutMs: 10000 });
 * await page.uploadNewVideo(videoData);
 */
export class MainVideoPage {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly uploadBtn: UploadVideoBtn
  private readonly uploadModal: UploadVideoModal
  private readonly table: VideoTable
  private readonly actions: VideoActions
  private readonly footer: FooterActions
  private readonly image: CKEditorImageModal;
  private readonly banner: Banners;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "MainVideoPage") }

    this.uploadBtn = new UploadVideoBtn(this.driver, this.config);
    this.uploadModal = new UploadVideoModal(this.driver, this.config);
    this.table = new VideoTable(this.driver, this.config);
    this.actions = new VideoActions(this.driver, this.config);
    this.footer = new FooterActions(this.driver, this.config)
    this.image = new CKEditorImageModal(this.driver, this.config)
    this.banner = new Banners(this.driver, this.config);
  }

  /**
   * Orquesta el flujo completo de subida de un nuevo video.
   * Selecciona el tipo de video, rellena todos los campos del modal, dispara la subida
   * y espera a que el nuevo video aparezca en la primera posición de la tabla.
   * Para videos de tipo `NATIVO`, también verifica la barra de progreso de carga.
   *
   * @param videoData - Datos completos del video a subir, incluyendo tipo, título, URL o ruta de archivo.
   */
  async uploadNewVideo(videoData: VideoData): Promise<any> {
    await step(`Subiendo nuevo video con datos dinámicos`, async (stepContext) => {
      attachment(`${videoData.video_type} Data`, JSON.stringify(videoData, null, 2), "application/json");
      videoData.video_type && stepContext.parameter("Video Type", videoData.video_type)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Abriendo modal de subida para videos: ${videoData.video_type}`, { label: this.config.label })
        await this.uploadBtn.selectVideoType(videoData.video_type)

        logger.info(`Iniciando llenado dinámico de campos presentes en data`, { label: this.config.label });
        await this.uploadModal.fillAll(videoData);

        logger.info(`Llenado finalizado, comenzando subida...`, { label: this.config.label });
        await this.uploadModal.clickOnUploadBtn();

        if (videoData.video_type === VideoType.NATIVO) {
          const isError = await this.banner.checkBanners(false);
          if (isError) {
            return
          }
          await this.uploadModal.checkProgressBar()
        }

        await this.banner.checkBanners(true);

        await this.table.waitForNewVideoAtIndex0(videoData.title);

        await this.table.skipInlineTitleEdit();

        logger.info(`Subida finalizada`, { label: this.config.label });

      } catch (error: any) {
        logger.error(`Fallo en la subida de nuevo video: ${videoData.video_type} ${error.message}`, {
          label: this.config.label,
          error: error.message
        });
        throw error;
      }
    });
  }


  /**
   * Modifica el título de un video de forma inline directamente desde la tabla.
   * Localiza el contenedor del video por su título y delega en `VideoTable.changeVideoTitle`
   * para realizar la edición inline.
   *
   * @param titleID - Fragmento o título completo del video a modificar, usado para localizar su fila en la tabla.
   */
  async changeVideoTitle(titleID: string): Promise<any> {
    await step(`Cambiando titulo del video ${titleID}`, async () => {

      try {
        logger.debug("Ejecutando busqueda del contenedor para el titulo del video...", { label: this.config.label })
        const videoContainer = await this.table.getVideoContainerByTitle(titleID);

        logger.debug("Ejecutando el cambio de titulo.", { label: this.config.label })
        await this.table.changeVideoTitle(videoContainer);

        await this.banner.checkBanners(true);

        logger.info('Cambio de titulo del video ejecutado correctamente', { label: this.config.label })
      } catch (error: any) {
        logger.error(`Error al cambiar el titulo del video: ${error.message}`, {
          label: this.config.label,
          title: titleID,
          error: error.message
        })
        throw error;
      }
    });
  }

  /**
   * Localiza un video por su título en la tabla y ejecuta una acción del menú desplegable sobre él.
   * Delega la búsqueda del contenedor en `VideoTable.getVideoContainerByTitle` y
   * la interacción con el menú en `VideoActions.clickOnAction`.
   *
   * @param postTitle - Título del video objetivo, usado para identificar su fila en la tabla.
   * @param action - Tipo de acción a ejecutar sobre el video (EDIT, DELETE, UNPUBLISH).
   */
  async clickOnActionVideo(postTitle: string, action: ActionType): Promise<any> {
    await step(`Clickeando en la accion: "${action}" del video: "${postTitle}"`, async (stepContext) => {
      stepContext.parameter("Titulo del video", postTitle);
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        const videoContainer = await this.table.getVideoContainerByTitle(postTitle);
        logger.debug(`Ejecutando el click en el boton de ${action}`, { label: this.config.label })
        await this.actions.clickOnAction(videoContainer, action);

        await this.banner.checkBanners(false)
        logger.info(`Click en la accion: "${action}" completado.`, { label: this.config.label })
      } catch (error: any) {
        logger.error(`Error al clickear la accion: "${action}" en el video: ${error.message}`, {
          label: this.config.label,
          title: postTitle,
          action,
          error: error.message
        })
        throw error;
      }
    });
  }

  /**
   * Selecciona uno o varios videos en la tabla y los publica mediante la acción del footer.
   * Itera sobre cada contenedor de video recibido y delega la selección en `VideoTable.selectVideo`.
   * Finaliza con una acción de publicación mediante `FooterActions.clickFooterAction`.
   *
   * @param videos - Array de contenedores WebElement de los videos que se desean seleccionar y publicar.
   */
  async selectAndPublishFooter(videos: WebElement[]): Promise<any> {
    await step("Seleccionar y publicar videos", async (stepContext) => {
      stepContext.parameter("Cantidad", videos.length.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug('Seleccionando el/los videos enviados...', { label: this.config.label })
        for (const video of videos) {
          await this.table.selectVideo(video);
        }
        logger.debug('Video/s seleccionados correctamente, procediendo a su publicacion...', { label: this.config.label })
        await this.footer.clickFooterAction('PUBLISH_ONLY')
        logger.info('Video/s publicados exitosamente', { label: this.config.label })

      } catch (error: any) {
        logger.error(`Error al seleccionar y publicar videos: ${error.message}`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  /**
   * Obtiene un array de contenedores WebElement de los primeros N videos de la tabla.
   * Itera por índice comenzando desde 0 y delega cada búsqueda en `VideoTable.getVideoContainerByIndex`.
   *
   * @param numberOfVideos - Cantidad de videos a recuperar desde la parte superior de la tabla.
   * @returns {Promise<WebElement[]>} Array con los contenedores DOM de los videos solicitados.
   */
  async getVideoContainers(numberOfVideos: number): Promise<WebElement[]> {
    try {
      let videos = []
      for (let i = 0; i < numberOfVideos; i++) {
        const video = await this.table.getVideoContainerByIndex(i);
        videos.push(video)
      }
      return videos
    } catch (error: any) {
      logger.error(`Error al obtener los ultimos ${numberOfVideos} videos: ${error.message}`, { label: this.config.label, error: error.message });
      throw error;
    }
  }
}