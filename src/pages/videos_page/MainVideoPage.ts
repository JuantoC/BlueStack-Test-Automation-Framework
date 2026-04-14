import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { UploadVideoBtn } from "./UploadVideoBtn.js";
import { UploadVideoModal } from "./UploadVideoModal.js";
import { VideoTable } from "./VideoTable.js";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { VideoData } from "../../interfaces/data.js";
import { ActionType, VideoInlineActions, InlineActionType } from "./VideoInlineActions.js";
import { VideoTypeFilter, VideoFilterType } from "./VideoTypeFilter.js";
import { FooterActions } from "../FooterActions.js";
import { CKEditorImageModal } from "../modals/CKEditorImageModal.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

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
  private config: RetryOptions;

  private readonly uploadBtn: UploadVideoBtn
  private readonly uploadModal: UploadVideoModal
  public readonly table: VideoTable
  private readonly actions: VideoInlineActions
  private readonly typeFilter: VideoTypeFilter
  private readonly footer: FooterActions
  private readonly image: CKEditorImageModal;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.config = resolveRetryConfig(opts, "MainVideoPage")

    this.uploadBtn = new UploadVideoBtn(driver, this.config);
    this.uploadModal = new UploadVideoModal(driver, this.config);
    this.table = new VideoTable(driver, this.config);
    this.actions = new VideoInlineActions(driver, this.config);
    this.typeFilter = new VideoTypeFilter(driver, this.config);
    this.footer = new FooterActions(driver, this.config)
    this.image = new CKEditorImageModal(driver, this.config)
  }

  /**
   * Orquesta el flujo completo de subida de un nuevo video.
   * Selecciona el tipo de video, rellena todos los campos del modal, dispara la subida
   * y espera a que el nuevo video aparezca en la primera posición de la tabla.
   * Para videos de tipo `NATIVO`, también verifica la barra de progreso de carga.
   *
   * @param videoData - Datos completos del video a subir, incluyendo tipo, título, URL o ruta de archivo.
   * @returns {Promise<void>}
   */
  async uploadNewVideo(videoData: VideoData): Promise<any> {
    await step(`Subiendo nuevo video con datos dinámicos`, async (stepContext) => {
      attachment(`${videoData.videoType} Data`, JSON.stringify(videoData, null, 2), "application/json");
      videoData.videoType && stepContext.parameter("Video Type", videoData.videoType)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Abriendo modal de subida para videos: ${videoData.videoType}`, { label: this.config.label })
        await this.uploadBtn.selectVideoType(videoData.videoType)

        logger.info(`Iniciando llenado dinámico de campos presentes en data`, { label: this.config.label });
        await this.uploadModal.fillAll(videoData);

        logger.info(`Llenado finalizado, comenzando subida...`, { label: this.config.label });
        await this.uploadModal.clickOnUploadBtn();

        if (videoData.videoType === 'NATIVO') {
          await this.uploadModal.checkProgressBar()
        }

        await this.table.waitForNewVideoAtIndex0(videoData.title);

        await this.table.skipInlineTitleEdit();

        logger.info(`Subida finalizada`, { label: this.config.label });

      } catch (error: unknown) {
        logger.error(`Fallo en la subida de nuevo video: ${videoData.videoType} ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }


  /**
   * Ejecuta el cambio de título inline de un video a partir de su contenedor ya localizado.
   * Delega la edición en `VideoTable.changeVideoTitle` y verifica el resultado con el toast monitor CDP.
   *
   * @param videoContainer - Contenedor WebElement del video a modificar.
   *   Obtenerlo previamente con `this.table.getVideoContainerByTitle()` o `this.table.getVideoContainerByIndex()`.
   * @returns {Promise<void>}
   */
  async changeVideoTitle(videoContainer: WebElement): Promise<any> {
    await step(`Cambiando título del video`, async () => {

      try {
        logger.debug("Ejecutando el cambio de titulo.", { label: this.config.label })
        await this.table.changeVideoTitle(videoContainer);

        logger.info('Cambio de titulo del video ejecutado correctamente', { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al cambiar el titulo del video: ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  /**
   * Ejecuta una acción del menú desplegable sobre un video a partir de su contenedor ya localizado.
   * Delega la interacción con el menú en `VideoInlineActions.clickOnAction`.
   *
   * @param videoContainer - Contenedor WebElement del video sobre el que se ejecuta la acción.
   *   Obtenerlo previamente con `this.table.getVideoContainerByTitle()` o `this.table.getVideoContainerByIndex()`.
   * @param action - Tipo de acción a ejecutar sobre el video (EDIT, DELETE, UNPUBLISH).
   * @returns {Promise<void>}
   */
  async clickOnActionVideo(videoContainer: WebElement, action: ActionType): Promise<any> {
    await step(`Clickeando en la acción: "${action}" sobre el video`, async (stepContext) => {
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Ejecutando el click en el boton de ${action}`, { label: this.config.label })
        await this.actions.clickOnAction(videoContainer, action);

        logger.info(`Click en la accion: "${action}" completado.`, { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al clickear la accion: "${action}" en el video: ${getErrorMessage(error)}`, {
          label: this.config.label,
          action,
          error: getErrorMessage(error)
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
   * @param Videos - Array de contenedores WebElement de los videos que se desean seleccionar y publicar.
   * @returns {Promise<void>}
   */
  async selectAndPublishFooter(Videos: WebElement[]): Promise<any> {
    await step("Seleccionar y publicar Videos", async (stepContext) => {
      stepContext.parameter("Cantidad", Videos.length.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug('Seleccionando el/los Videos enviados...', { label: this.config.label })
        for (const video of Videos) {
          await this.table.selectVideo(video);
        }
        logger.debug('Video/s seleccionados correctamente, procediendo a su publicacion...', { label: this.config.label })
        await this.footer.clickFooterAction('PUBLISH_ONLY')
        logger.info('Video/s publicados exitosamente', { label: this.config.label })

      } catch (error: unknown) {
        logger.error(`Error al seleccionar y publicar Videos: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Cambia la vista de la tabla al tipo de video indicado activando la pestaña correspondiente.
   * Delega la interacción en `VideoTypeFilter.clickTab`.
   *
   * @param type - Tipo de video a seleccionar como filtro activo (NATIVO, EMBEDDED, YOUTUBE, SHORT).
   */
  async switchVideoTypeTab(type: VideoFilterType): Promise<void> {
    await step(`Cambiando vista a tipo de video: "${type}"`, async (stepContext) => {
      stepContext.parameter("Tipo", type);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Activando pestaña de tipo "${type}"`, { label: this.config.label });
        await this.typeFilter.clickTab(type);
        logger.info(`Vista cambiada a "${type}" correctamente.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al cambiar la pestaña a "${type}": ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error),
        });
        throw error;
      }
    });
  }

  /**
   * Ejecuta una acción del menú kebab (3 puntos) sobre un video a partir de su contenedor ya localizado.
   * Delega la interacción en `VideoInlineActions.clickOnKebabAction`.
   *
   * @param videoContainer - Contenedor WebElement del video sobre el que se ejecuta la acción.
   *   Obtenerlo previamente con `this.table.getVideoContainerByTitle()` o `this.table.getVideoContainerByIndex()`.
   * @param action - Acción a ejecutar: EDIT, DELETE, UNPUBLISH, SCHEDULE o PREVIEW.
   *
   * @remarks
   * DELETE y UNPUBLISH son mutuamente excluyentes según el estado del video:
   * DELETE está disponible para videos no publicados; UNPUBLISH para videos publicados.
   */
  async clickOnVideoKebabAction(videoContainer: WebElement, action: InlineActionType): Promise<void> {
    await step(`Ejecutando acción kebab: "${action}" sobre el video`, async (stepContext) => {
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Ejecutando acción kebab: "${action}"`, { label: this.config.label });
        await this.actions.clickOnKebabAction(videoContainer, action);
        logger.info(`Acción kebab "${action}" ejecutada correctamente.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al ejecutar acción kebab "${action}": ${getErrorMessage(error)}`, {
          label: this.config.label,
          action,
          error: getErrorMessage(error),
        });
        throw error;
      }
    });
  }

  /**
   * Obtiene un array de contenedores WebElement de los primeros N videos de la tabla.
   * Itera por índice comenzando desde 0 y delega cada búsqueda en `VideoTable.getVideoContainerByIndex`.
   *
   * @param NumberOfVideos - Cantidad de videos a recuperar desde la parte superior de la tabla.
   * @returns {Promise<WebElement[]>} Array con los contenedores DOM de los videos solicitados.
   */
  async getVideoContainers(NumberOfVideos: number): Promise<WebElement[]> {
    return await step(`Obteniendo ${NumberOfVideos} contenedores de video`, async (stepContext) => {
      stepContext.parameter("Cantidad", NumberOfVideos.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        let videos = []
        for (let i = 0; i < NumberOfVideos; i++) {
          const video = await this.table.getVideoContainerByIndex(i);
          videos.push(video)
        }
        return videos
      } catch (error: unknown) {
        logger.error(`Error al obtener los ultimos ${NumberOfVideos} videos: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }
}