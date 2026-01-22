import { By, Key } from "selenium-webdriver"
import { clickSafe } from "../core/actions/clickSafe.js"
import { initializeDriver } from "../core/actions/driverManager.js"
import { getAuthUrl } from "../core/actions/getAuthURL.js"
import { adminCredentials, basicAuthCredentials } from "../environments/Dev_SAAS/credentials.js"
import { MainConfig } from "../environments/Dev_SAAS/env.config.js"
import { passLogin } from "../flows/manageAuth.js"
import { writeSafe } from "../core/actions/writeSafe.js"
import { goToPost } from "../core/actions/goToPost.js"



async function createNewTags(): Promise<void> {
    const authUrl = getAuthUrl(MainConfig.BASE_URL, basicAuthCredentials.username, basicAuthCredentials.password)

    const driver = await initializeDriver({ isHeadless: false })
    await driver.get(authUrl);
    await passLogin(driver, adminCredentials, 1500, {});
    await goToPost(driver, MainConfig.BASE_URL, "16")
    await clickSafe(driver, By.css('a[title="Tags"]'))
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const element = await clickSafe(driver, By.css(`div[id="aside-main"] button[type="button"]`));
        await writeSafe(driver, By.css("textarea.tags-modal__input-title"), tag);
        await element.sendKeys(Key.TAB);
        await clickSafe(driver, By.css('div.button-primary__four button[data-testid="btn-calendar-confirm"]'));
    }
}
createNewTags()

const tags = [
    "Investigación periodística",
    "Cobertura en vivo",
    "Especiales",
    "Contexto",
    "Explicador",
    "Resumen del día",
    "Historias humanas",
    "Agenda pública",
    "Emergencia",
    "Transparencia",
    "Género",
    "Justicia",
    "Seguridad",
    "Educación",
    "Infraestructura",
    "Turismo",
    "Mercados",
    "Consumo",
    "Innovación",
    "Ciencia",
    "Astronomía",
    "Meteorología",
    "Cambio climático",
    "Sostenibilidad",
    "Agro",
    "Empresas",
    "PyMEs",
    "Movilidad",
    "Urbanismo",
    "Elecciones",
    "Congreso",
    "Gobierno",
    "Opinión pública",
    "Tendencia social",
    "Cultura digital",
    "Entretenimiento",
    "Streaming",
    "Crítica",
    "Literatura",
    "Arte",
    "Historia",
    "Religión",
    "Derechos humanos",
    "Migración",
    "Conflicto",
    "Finanzas personales",
    "Investigaciones especiales",
    "Datos abiertos",
    "Transporte",
    "Tecnología médica",
    "Acceso público",
    "Balance anual",
    "Campañas electorales",
    "Desempeño fiscal",
    "Evaluación social",
    "Factor humano",
    "Gestión pública",
    "Hechos relevantes",
    "Identidad cultural",
    "Juventud",
    "Kilómetros urbanos",
    "Legislación",
    "Movimientos sociales",
    "Narrativa",
    "Observatorio",
    "Patrimonio",
    "Quebranto económico",
    "Riesgo país",
    "Sindicatos",
    "Tecnopolítica",
    "Urbanización",
    "Vivienda",
    "Web y medios",
    "Xenofobia",
    "Yacimientos",
    "Zonificación",
    "Análisis electoral",
    "Brecha salarial",
    "Crecimiento urbano",
    "Diversidad",
    "Equidad",
    "Fiscalización",
    "Gobernanza",
    "Hitos",
    "Industrias creativas",
    "Jurisprudencia",
    "Kits educativos",
    "Labor educativa",
    "Movilidad eléctrica",
    "Normativa",
    "Opinión experta",
    "Participación ciudadana",
    "Quiebre institucional",
    "Regulación",
    "Soberanía",
    "Territorio",
    "Uso del suelo",
    "Vulnerabilidad",
    "Wind power",
    "Youth policy",
    "Zona crítica"
];