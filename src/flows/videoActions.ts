import { WebDriver } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import logger from "../core/utils/logger.js";
import { VideoTable } from "../pages/videos_page/VideoTable.js";

export async function changeVideoTitle(driver: WebDriver, title: string, opts: RetryOptions): Promise<any> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "changeVideoTitle")
  };

  const page = new VideoTable(driver, config)

  await step(`Cambiando titulo del video: "${title}"`, async (stepContext) => {
    stepContext.parameter("Titulo del video", title);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      logger.debug("Ejecutando busqueda del contenedor para el titulo del video...", config.label)
      const postContainer = await page.getPostContainerByTitle(title);

      logger.debug("Ejecutando el cambio de titulo.")
      await page.changeVideoTitle(postContainer);
      return page;
    } catch (error: any) {
      logger.error(`Error al cambiar el titulo del video: ${error.message}`, {
        label: config.label,
        title: title,
        error: error.message
      })
      throw error;
    }
  });
}

/* export async function enterToEditorPage(driver: WebDriver, postTitle: string, opts: RetryOptions): Promise<any> {
  const config = {
    ...DefaultConfig,
    ...opts,
    label: stackLabel(opts.label, "createNewNote")
  };

  const page = new VideoTable(driver, config)

  await step(`Entrando a la edicion del video: "${postTitle}"`, async (stepContext) => {
    stepContext.parameter("Titulo del video", postTitle);
    stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

    try {
      const postContainer = await page.getPostContainerByTitle(postTitle);

      logger.debug("Ejecutando el click en el boton de edicion", config.label)
      await page.clickEditorButton(postContainer);
      return page;
    } catch (error: any) {
      logger.error(`Error al cambiar el titulo del video: ${error.message}`, {
        label: config.label,
        title: postTitle,
        error: error.message
      })
      throw error;
    }
  });
} */
