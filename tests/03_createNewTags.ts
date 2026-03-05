import { By, Key } from "selenium-webdriver";
import { clickSafe } from "../src/core/actions/clickSafe.js";
import { DriverSession, initializeDriver, quitDriver } from "../src/core/config/driverManager.js";
import { getAuthUrl } from "../src/core/utils/getAuthURL.js";
import { adminCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { MainConfig } from "../src/environments/Dev_SAAS/env.config.js";
import { passLogin } from "../src/flows/userSession.js";
import { writeSafe } from "../src/core/actions/writeSafe.js";
import { goToPost } from "../src/core/utils/goToPost.js";
import { DefaultConfig, RetryOptions } from "../src/core/config/defaultConfig.js";
import { stackLabel } from "../src/core/utils/stackLabel.js";
import logger from "../src/core/utils/logger.js";
import { checkConsoleErrors } from "../src/core/utils/browserLogs.js";

async function createNewTags(tagsList: string[]): Promise<void> {
    const sessionLabel = "DEV_UTILITY:CreateTags";
    const opts: RetryOptions = { ...DefaultConfig, label: sessionLabel };

    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password);
    let session: DriverSession | null = null;

    try {
        session = await initializeDriver({ isHeadless: false }, opts);
        const driver = session.driver

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

    } catch (error: any) {
        if (error instanceof Error) {
            let errorMessage = error.message;

            const diff = (error as any)?.diff;
            if (diff) {
                errorMessage += `\n>>> DETALLE DEL FALLO DE TEXTO <<<${diff}`;
            }

            logger.error(`❌ FALLO CRÍTICO en ${sessionLabel}`, {
                label: sessionLabel,
                stack: error.stack,
                details: errorMessage
            });

            throw error;
        }
    } finally {
        if (session) {
            await checkConsoleErrors(session.driver, sessionLabel)
            logger.info("Limpiando entorno y cerrando sesión...", { label: sessionLabel });
            await quitDriver(session, opts);
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