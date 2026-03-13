import { DefaultConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { stackLabel } from "../../core/utils/stackLabel.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { UploadVideoBtn, VideoType } from "./UploadVideoBtn.js";
import { UploadVideoModal } from "./UploadVideoModal.js";
import { VideoTable } from "./VideoTable.js";
import { step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { VideoData } from "../../interfaces/data.js";
import { ActionType, VideoActions } from "./VideoActions.js";
import { FooterVideoActions } from "./FooterVideoActions.js";

/**
 * Page Object Maestro para la pagina de videos.
 * Centraliza y coordina todas las secciones de la pagina de videos.
*/
export class MainVideoPage {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly uploadBtn: UploadVideoBtn
  private readonly uploadModal: UploadVideoModal
  private readonly table: VideoTable
  private readonly actions: VideoActions
  private readonly footer: FooterVideoActions

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "MainVideoPage") }

    this.uploadBtn = new UploadVideoBtn(this.driver, this.config);
    this.uploadModal = new UploadVideoModal(this.driver, this.config);
    this.table = new VideoTable(this.driver, this.config);
    this.actions = new VideoActions(this.driver, this.config);
    this.footer = new FooterVideoActions(this.driver, this.config)
  }

  async uploadNewVideo(videoData: VideoData): Promise<any> {
    await step(`Subiendo nuevo video con datos dinámicos`, async (stepContext) => {
      stepContext.parameter("Data Keys", Object.keys(videoData).join(", "));
      videoData.video_type && stepContext.parameter("Video Type", videoData.video_type)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Abriendo modal de subida para videos: ${videoData.video_type}`, { label: this.config.label })
        await this.uploadBtn.selectVideoType(videoData.video_type)

        logger.info(`Iniciando llenado dinámico de campos presentes en data`, { label: this.config.label });
        await this.uploadModal.fillAll(videoData);
        await this.uploadModal.clickOnUploadBtn();

        logger.info(`Llenado finalizado, comenzando subida...`, { label: this.config.label });
        if (videoData.video_type === VideoType.NATIVO) {
          await this.uploadModal.checkProgressBar()
        }

        await this.table.waitForNewVideoAtIndex0(videoData.title);

        logger.info(`Subida finalizada`, { label: this.config.label });

        await this.table.skipInlineTitleEdit();

      } catch (error: any) {
        logger.error(`Fallo en la subida de nuevo video: ${videoData.video_type} ${error.message}`, {
          label: this.config.label,
          error: error.message
        });
        throw error;
      }
    });
  }


  async changeVideoTitle(titleID: string): Promise<any> {
    await step(`Cambiando titulo del video inline`, async (stepContext) => {
      stepContext.parameter("Titulo del video", titleID);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug("Ejecutando busqueda del contenedor para el titulo del video...", { label: this.config.label })
        const videoContainer = await this.table.getVideoContainerByTitle(titleID);

        logger.debug("Ejecutando el cambio de titulo.", { label: this.config.label })
        await this.table.changeVideoTitle(videoContainer);

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

  async clickOnActionVideo(postTitle: string, action: ActionType): Promise<any> {
    await step(`Clickeando en la accion: "${action}" del video: "${postTitle}"`, async (stepContext) => {
      stepContext.parameter("Titulo del video", postTitle);
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);
      try {
        const videoContainer = await this.table.getVideoContainerByTitle(postTitle);
        logger.debug(`Ejecutando el click en el boton de ${action}`, { label: this.config.label })
        await this.actions.clickOnAction(videoContainer, action);
        logger.debug(`Click en la accion: "${action}" completado.`, { label: this.config.label })
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

  async selectAndPublishFooter(videos: WebElement[]): Promise<any> {
    try {
      logger.debug('Seleccionando el/los videos enviados...', { label: this.config.label })
      for (const video of videos) {
        await this.table.selectVideo(video);
      }
      logger.debug('Video/s seleccionados correctamente, procediendo a su publicacion...', { label: this.config.label })
      await this.footer.clickOnPublishBtn()


    } catch (error: any) {

    }
  }
}