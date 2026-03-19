import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { RetryOptions } from "../../../core/config/defaultConfig.js";
import { step } from "allure-js-commons";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
import { AINoteData } from "../../../interfaces/data.js";

export type AIPostField = keyof typeof MainAIPostPage.LOCATORS;

export class MainAIPostPage {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  public static readonly LOCATORS = {
    task: By.css('textarea#promptText'),
    context: By.css('textarea#contexto'),
    section: By.css('ng-select#seccion'),
    paragraph: By.css('ng-select#parrafos'),
    tone: By.css('ng-select#tono'),
    language: By.css('ng-select#languaje')
  }

  private static readonly COMBO_OPTION: Locator = By.css('div[role="option"]')
  private static readonly CHECKBOX: Locator = By.css('mat-checkbox#checkGenerate')
  private static readonly GENERATE_BTN: Locator = By.css('button#btnCropped')
  private static readonly LOADING_PREVIEW: Locator = By.css('div.container-preview app-loading-css')
  private static readonly DONE_BTN: Locator = By.css('div.button-primary__four button')

  constructor(driver: WebDriver, config: RetryOptions) {
    this.driver = driver;
    this.config = config;
  }

  async clickOnDoneBtn() {
    await step("Click en el boton done", async () => {
      try {
        await clickSafe(this.driver, MainAIPostPage.DONE_BTN, this.config);
      } catch (error: any) {
        logger.error(`Error al hacer click en el boton done`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  async clickOnGenerateBtn() {
    await step("Click en el boton generar", async () => {
      try {
        await this.getCheckboxCheck();
        logger.debug("Haciendo click en el boton generar", { label: this.config.label });
        if (await this.isGenerateBtnEnabled()) {
          await clickSafe(this.driver, MainAIPostPage.GENERATE_BTN, this.config);
        } else {
          throw new Error("El boton generar esta deshabilitado");
        }
      } catch (error: any) {
        logger.error(`Error al hacer click en el boton generar`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  async fillAll(data: Partial<AINoteData>) {
    await step("Rellenar campos de promtps, contexto y opciones", async () => {
      const fields = Object.keys(MainAIPostPage.LOCATORS) as AIPostField[];

      for (const field of fields) {
        const value = data[field];
        if (value === null || value === undefined) continue;
        await this.fillField(field, value);
      }
    });
  }

  async fillField(field: AIPostField, value: string | number) {
    await step(`Llenar campo ${field}`, async () => {
      const locator = MainAIPostPage.LOCATORS[field];

      if (field === 'task' || field === 'context') {
        await writeSafe(this.driver, locator, value as string, this.config);
        return
      }
      await clickSafe(this.driver, locator, this.config);
      await this.selectOption(value as number);
    });
  }

  async selectOption(value: number) {
    try {
      const elementToClick = await this.matchOption(value);

      logger.debug(`Intentando hacer click en la opción "${value}"...`, { label: this.config.label });
      await clickSafe(this.driver, elementToClick, this.config);
    } catch (error_any) {
      logger.error(`Error al seleccionar opción para ${value}`, { label: this.config.label, error: error_any });
      throw error_any;
    }
  }

  async matchOption(index: number): Promise<WebElement> {
    try {
      const elements = await this.driver.findElements(MainAIPostPage.COMBO_OPTION);
      if (elements.length === 0) {
        throw new Error(`No se encontro ningun elemento en el selector: ${MainAIPostPage.COMBO_OPTION}`);
      }
      return elements[index];
    } catch (error: any) {
      throw new Error(`No se encontró la opción "${index}" en el menú.`);
    }
  }

  async getCheckboxCheck(): Promise<any> {
    logger.debug("Verificando si el checkbox esta seleccionado", { label: this.config.label });
    const checkbox = await waitFind(this.driver, MainAIPostPage.CHECKBOX, this.config);
    const classAttribute = await checkbox.getAttribute('class');

    if (!classAttribute.includes('mdc-checkbox--selected')) {
      logger.debug("El checkbox no esta seleccionado, haciendo click", { label: this.config.label });
      await clickSafe(this.driver, checkbox, this.config);
    }
    logger.debug("Checkbox seleccionado", { label: this.config.label });
  }

  async isGenerateBtnEnabled(): Promise<boolean> {
    logger.debug("Verificando si el boton generar esta habilitado", { label: this.config.label });
    await this.driver.wait(async () => {
      const btn = await waitFind(this.driver, MainAIPostPage.GENERATE_BTN, this.config);
      const disabledAttr = await btn.getAttribute('disabled');
      return disabledAttr === null;
    }, 5000, "El boton generar no se habilito");
    return true;
  }

  async waitForLoadingPreview() {
    logger.debug("Esperando a que termine de cargar la preview", { label: this.config.label });
    await this.driver.wait(async () => {
      const loading = await this.driver.findElements(MainAIPostPage.LOADING_PREVIEW);
      return loading.length === 0;
    }, 1000 * 60 * 3, "La preview no termino de cargar");
    logger.debug("Preview cargada", { label: this.config.label });
  }
}