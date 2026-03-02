import { WebDriver } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../core/config/default.js";
import { PostTable } from "../pages/post_page/postTable.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import logger from "../core/utils/logger.js";

export async function changePostTitle(driver: WebDriver, title: string, opts: RetryOptions): Promise<any> {
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "changePostTitle")
    };

    const page = new PostTable(driver)

    await step(`Cambiando titulo de la nota: "${title}"`, async (stepContext) => {
        stepContext.parameter("Titulo de la nota", title);
        stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

        try {
            logger.debug("Ejecutando busqueda del contenedor para el titulo de la nota...", config.label)
            const postContainer = await page.getPostContainerByTitle(title, config);

            logger.debug("Ejecutando el cambio de titulo.")
            await page.changePostTitle(postContainer, config);
            return page;
        } catch (error: any) {
            logger.error(`Error al cambiar el titulo de la nota: ${error.message}`, {
                label: config.label,
                title: title,
                error: error.message
            })
            throw error;
        }
    });
}

export async function enterToEditorPage(driver: WebDriver, postTitle: string, opts: RetryOptions): Promise<any> {
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "createNewNote")
    };

    const page = new PostTable(driver)

    await step(`Entrando a la edicion de la nota: "${postTitle}"`, async (stepContext) => {
        stepContext.parameter("Titulo de la nota", postTitle);
        stepContext.parameter("Timeout", `${config.timeoutMs}ms`);

        try {
            const postContainer = await page.getPostContainerByTitle(postTitle, config);

            logger.debug("Ejecutando el click en el boton de edicion", config.label)
            await page.clickEditorButton(postContainer, config);
            return page;
        } catch (error: any) {
            logger.error(`Error al cambiar el titulo de la nota: ${error.message}`, {
                label: config.label,
                title: postTitle,
                error: error.message
            })
            throw error;
        }
    });
}
