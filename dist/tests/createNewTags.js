import { By, Key } from "selenium-webdriver";
import { clickSafe } from "../core/actions/clickSafe.js";
import { initializeDriver } from "../core/actions/driverManager.js";
import { getAuthUrl } from "../core/actions/getAuthURL.js";
import { adminCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js";
import { MainConfig } from "../environments/Dev_SAAS/env.config.js";
import { passLogin } from "../flows/manageAuth.js";
import { writeSafe } from "../core/actions/writeSafe.js";
import { goToPost } from "../core/actions/goToPost.js";
const tags = [
    "Último momento",
    "Cobertura especial",
    "Noticias del día",
    "Editorial",
    "Opinión",
    "Investigación",
    "Fotogalería",
    "Multimedia",
    "Informe exclusivo",
    "Actualidad",
    "Tendencias",
    "Internacionales",
    "Política",
    "Economía",
    "Tecnología",
    "Sociedad",
    "Cultura",
    "Deportes",
    "Salud",
    "Medio ambiente",
    "Breaking News",
    "Análisis",
    "Columna",
    "Entrevista",
    "Archivo",
    "Destacadas",
    "Portada",
    "Visualización",
    "Contenido premium",
    "Reportaje"
];
async function runSession() {
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password);
    const driver = await initializeDriver({ isHeadless: false });
    await driver.get(authUrl);
    await passLogin(driver, adminCredentials, 1500, {});
    await goToPost(driver, MainConfig.BASE_URL, "16");
    await clickSafe(driver, By.css('a[title="Tags"]'));
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const element = await clickSafe(driver, By.css(`div[id="aside-main"] button[type="button"]`));
        await writeSafe(driver, By.css("textarea.tags-modal__input-title"), tag);
        await element.sendKeys(Key.TAB);
        await clickSafe(driver, By.css('div.button-primary__four button[data-testid="btn-calendar-confirm"]'));
    }
}
runSession();
//# sourceMappingURL=createNewTags.js.map