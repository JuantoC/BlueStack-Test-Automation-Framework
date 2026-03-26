import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../../../core/config/defaultConfig.js";
import { attachment, step } from "allure-js-commons";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
import { AIDataNote } from "../../../interfaces/data.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";

export type AIPostField = keyof typeof AIPostModal.LOCATORS;

export class AIPostModal {
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
  private static readonly ERROR_STATUS_CONTAINER: Locator = By.css('div.status-container')
  private static readonly DONE_BTN: Locator = By.css('div.button-primary__four button')

  constructor(driver: WebDriver, config: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...config, label: stackLabel(config.label, 'AIPostModal') };
  }

  async clickOnDoneBtn() {
    await step("Click en el boton done", async () => {
      try {
        await clickSafe(this.driver, AIPostModal.DONE_BTN, this.config);
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
          await clickSafe(this.driver, AIPostModal.GENERATE_BTN, this.config);
        } else {
          throw new Error("El boton generar esta deshabilitado");
        }
      } catch (error: any) {
        logger.error(`Error al hacer click en el boton generar`, { label: this.config.label, error: error.message });
        throw error;
      }
    });
  }

  async fillAll(data: Partial<AIDataNote>) {
    await step("Rellenar campos de promtps, contexto y opciones", async () => {
      const fields = Object.keys(AIPostModal.LOCATORS) as AIPostField[];

      for (const field of fields) {
        const value = data[field];
        if (value === null || value === undefined) continue;
        await this.fillField(field, value);
      }
    });
  }

  async fillField(field: AIPostField, value: string | number) {
    await step(`Llenar campo ${field}`, async () => {
      const locator = AIPostModal.LOCATORS[field];

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
      const elements = await this.driver.findElements(AIPostModal.COMBO_OPTION);
      if (elements.length === 0) {
        throw new Error(`No se encontro ningun elemento en el selector: ${AIPostModal.COMBO_OPTION}`);
      }
      return elements[index];
    } catch (error: any) {
      throw new Error(`No se encontró la opción "${index}" en el menú.`);
    }
  }

  async getCheckboxCheck(): Promise<any> {
    logger.debug("Verificando si el checkbox esta seleccionado", { label: this.config.label });
    const checkbox = await waitFind(this.driver, AIPostModal.CHECKBOX, this.config);
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
      const btn = await waitFind(this.driver, AIPostModal.GENERATE_BTN, this.config);
      const disabledAttr = await btn.getAttribute('disabled');
      return disabledAttr === null;
    }, 5000, "El boton generar no se habilito");
    return true;
  }

  async waitForLoadingPreview(timeout: number = 1000 * 60 * 3) {
    logger.debug("Esperando a que termine de cargar la preview", { label: this.config.label });
    await this.driver.wait(async () => {
      const loading = await this.driver.findElements(AIPostModal.LOADING_PREVIEW);
      return loading.length === 0;
    }, timeout, "La preview no termino de cargar");
    logger.debug("Preview cargada", { label: this.config.label });
  }

  async isAIFailed() {
    logger.debug("Esperando a que termine de cargar el preview", { label: this.config.label });
    const error = await this.driver.findElements(AIPostModal.ERROR_STATUS_CONTAINER);
    if (error.length > 0) {
      const errorH3 = await error[0].findElement(By.css('h3')).getText();
      const errorP = await error[0].findElement(By.css('p')).getText();
      await attachment("Detalles del error", Buffer.from(`${errorH3} - ${errorP}`, "utf-8"), "text/plain");
      throw new Error(`Hubo un error en la generacion del preview: ${errorH3}`);
    }
    logger.debug("No hay errores en la generacion del preview", { label: this.config.label });
  }
}