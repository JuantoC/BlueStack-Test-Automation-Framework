import { By, Key } from "selenium-webdriver";
import { clickSafe } from "../core/actions/clickSafe.js";
import { initializeDriver, quitDriver } from "../core/actions/driverManager.js";
import { getAuthUrl } from "../core/utils/getAuthURL.js";
import { adminCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { passLogin } from "../flows/manageAuth.js";
import { writeSafe } from "../core/actions/writeSafe.js";
import { goToPost } from "../core/actions/goToPost.js";
import { DefaultConfig } from "../core/config/default.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import logger from "../core/utils/logger.js";
async function createNewTags(tagsList) {
    const sessionLabel = "DEV_UTILITY:CreateTags";
    const opts = { ...DefaultConfig, label: sessionLabel };
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password);
    let driver;
    try {
        driver = await initializeDriver({ isHeadless: false }, opts);
        logger.info(`Iniciando utilidad de creación de ${tagsList.length} tags`, { label: sessionLabel });
        await driver.get(authUrl);
        await passLogin(driver, adminCredentials, opts);
        // Navegación a la entidad específica (ID: 16)
        await goToPost(driver, MainConfig.BASE_URL, 16, opts);
        // Abrir panel de Tags
        await clickSafe(driver, By.css('a[title="Tags"]'), opts);
        for (let i = 0; i < tagsList.length; i++) {
            const tag = tagsList[i];
            const iterOpts = { ...opts, label: stackLabel(opts.label, `tag[${i}]`) };
            logger.debug(`Procesando tag: ${tag}`, { label: iterOpts.label });
            // 1. Click en botón añadir
            await clickSafe(driver, By.css(`div[id="aside-main"] button[type="button"]`), iterOpts);
            // 2. Escribir nombre del tag
            const input = await writeSafe(driver, By.css("textarea.tags-modal__input-title"), tag, iterOpts);
            // 3. Confirmar (Simulamos Tab y Click en confirmación)
            await input.sendKeys(Key.TAB);
            await clickSafe(driver, By.css('div.button-primary__four button[data-testid="btn-calendar-confirm"]'), iterOpts);
            logger.info(`Tag "${tag}" creado exitosamente`, { label: iterOpts.label });
        }
    }
    catch (error) {
        logger.error(`Fallo en el script de utilidad: ${error.message}`, { label: sessionLabel });
    }
    finally {
        if (driver) {
            await quitDriver(driver, { ...opts, timeoutMs: 3000 });
        }
    }
}
// Data de ejecución
const tagsToCreate = [
    "Tag Automatizado 1",
    "Tag Automatizado 2"
];
// Disparo del script
createNewTags(tagsToCreate).catch(err => console.error("Error fatal:", err));
//# sourceMappingURL=03_createNewTags.js.map