import { WebDriver } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { VideoData } from "../interfaces/data.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import { UploadVideoBtn, VideoType } from "../pages/videos_page/UploadVideoBtn.js";
import logger from "../core/utils/logger.js";
import { UploadVideoModal } from "../pages/videos_page/UploadVideoModal.js";

export async function uploadNewVideo(driver: WebDriver, videoData: VideoData, opts: RetryOptions): Promise<any> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "uploadNewVideo")
  };

  const btn = new UploadVideoBtn(driver, config)
  const page = new UploadVideoModal(driver, config)
  await step(`Subiendo nuevo video con datos dinámicos`, async (stepContext) => {
    stepContext.parameter("Data Keys", Object.keys(videoData).join(", "));
    videoData.video_type && stepContext.parameter("Video Type", videoData.video_type)
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.debug(`Abriendo modal de subida para videos: ${videoData.video_type}`, { label: config.label })
      await btn.selectVideoType(videoData.video_type)

      logger.info(`Iniciando llenado dinámico de campos presentes en data`, { label: config.label });
      await page.fillAll(videoData)
      await page.clickOnUploadBtn()
      logger.info(`Llenado finalizado, comenzando subida...`, { label: config.label });
      if (videoData.video_type === VideoType.NATIVO) {
        await page.checkProgressBar()
        logger.info(`Subida finalizada`, { label: config.label });
      }

    } catch (error: any) {
      logger.error(`Fallo en el flow: ${error.message}`, {
        label: config.label,
        error: error.message
      });
      throw error;
    }
  });
}