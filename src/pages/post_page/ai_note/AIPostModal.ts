import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../../core/config/defaultConfig.js";
import { attachment } from "allure-js-commons";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
import { AIDataNote } from "../../../interfaces/data.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

export type AIPostField = keyof typeof AIPostModal.LOCATORS;

/**
 * Sub-componente modal para la generación de notas asistida por IA en el CMS.
 * Gestiona el formulario completo del modal IA: campos de texto libre (prompt, contexto),
 * selectores desplegables (sección, párrafos, tono, idioma), el checkbox de confirmación
 * y la espera del preview generado. Consumido por `MainAIPage` como única interfaz del modal.
 *
 * @example
 * const modal = new AIPostModal(driver, opts);
 * await modal.fillAll(aiData);
 * await modal.clickOnGenerateBtn();
 * await modal.waitForLoadingPreview();
 * await modal.clickOnDoneBtn();
 */
export class AIPostModal {
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

  constructor(private readonly driver: WebDriver, config: RetryOptions) {
    this.config = resolveRetryConfig(config, 'AIPostModal');
  }

  /**
   * Hace click en el botón "Done" del modal de IA para confirmar y cerrar el generador.
   * Punto final del flujo de generación; delega en `clickSafe`.
   */
  async clickOnDoneBtn() {
    try {
      await clickSafe(this.driver, AIPostModal.DONE_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error al hacer click en el boton done`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Hace click directamente sobre el botón de generar sin verificar precondiciones.
   * Acción atómica — no verifica el estado del checkbox ni si el botón está habilitado.
   */
  async clickGenerateBtn(): Promise<void> {
    try {
      await clickSafe(this.driver, AIPostModal.GENERATE_BTN, this.config);
    } catch (error: unknown) {
      logger.error(`Error al hacer click en el boton generar`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Verifica el estado del checkbox de confirmación y hace click en el botón de generar.
   * Primero asegura que el checkbox esté seleccionado vía `ensureCheckboxSelected` y luego
   * verifica que el botón esté habilitado antes de ejecutar el click.
   */
  async clickOnGenerateBtn() {
    try {
      await this.ensureCheckboxSelected();
      logger.debug("Haciendo click en el boton generar", { label: this.config.label });
      if (await this.isGenerateBtnEnabled()) {
        await this.clickGenerateBtn();
      } else {
        throw new Error("El boton generar esta deshabilitado");
      }
      await this.waitForLoadingPreview();
    } catch (error: unknown) {
      logger.error(`Error al hacer click en el boton generar`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Rellena todos los campos del modal IA que tengan un valor presente en `data`.
   * Itera sobre las claves de `LOCATORS` y delega cada campo en `fillField`.
   * Omite silenciosamente los campos con valor `null` o `undefined`.
   *
   * @param data - Objeto parcial de `AIDataNote` con los valores a completar en el formulario.
   */
  async fillAll(data: Partial<AIDataNote>) {
    const fields = Object.keys(AIPostModal.LOCATORS) as AIPostField[];

    for (const field of fields) {
      const value = data[field];
      if (value === null || value === undefined) continue;
      await this.fillField(field, value);
    }
  }

  /**
   * Rellena un campo individual del formulario IA según su tipo.
   * Para `task` y `context` usa `writeSafe` (textarea de texto libre).
   * Para el resto (selectores) hace click en el combo y luego llama a `selectOption`.
   *
   * @param field - Nombre del campo a rellenar, mapeado a un locator en `LOCATORS`.
   * @param value - Valor a escribir (string) o índice de opción a seleccionar (number).
   */
  async fillField(field: AIPostField, value: string | number) {
    const locator = AIPostModal.LOCATORS[field];

    if (field === 'task' || field === 'context') {
      await writeSafe(this.driver, locator, value as string, this.config);
      return
    }
    await this.clickComboField(field);
    await this.selectOption(value as number);
  }

  /**
   * Hace click en el combo (ng-select) del campo indicado para abrirlo.
   * Acción atómica independiente del paso de selección de opción.
   *
   * @param field - Campo cuyo combo debe abrirse, mapeado a un locator en `LOCATORS`.
   */
  async clickComboField(field: AIPostField): Promise<void> {
    try {
      const locator = AIPostModal.LOCATORS[field];
      logger.debug(`Abriendo combo del campo: ${field}`, { label: this.config.label });
      await clickSafe(this.driver, locator, this.config);
    } catch (error: unknown) {
      logger.error(`Error en clickComboField para ${field}: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Localiza y hace click en una opción del combo actualmente expandido por su índice.
   * Delega la resolución del WebElement en `matchOption`.
   *
   * @param value - Índice de la opción a seleccionar dentro del dropdown abierto (base 0).
   */
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

  /**
   * Retorna el WebElement de la opción en la posición indicada del combo activo.
   * Busca todos los elementos con el rol `option` y retorna el que corresponde al índice.
   *
   * @param index - Posición de la opción en la lista desplegada (base 0).
   * @returns {Promise<WebElement>} El WebElement de la opción a clickear.
   */
  private async matchOption(index: number): Promise<WebElement> {
    try {
      const elements = await this.driver.findElements(AIPostModal.COMBO_OPTION);
      if (elements.length === 0) {
        throw new Error(`No se encontro ningun elemento en el selector: ${AIPostModal.COMBO_OPTION}`);
      }
      return elements[index];
    } catch (error: unknown) {
      throw new Error(`No se encontró la opción "${index}" en el menú.`);
    }
  }

  /**
   * Verifica si el checkbox de confirmación del modal IA está seleccionado y lo activa si no lo está.
   * Comprueba el atributo `class` del checkbox buscando `mdc-checkbox--selected`.
   */
  async ensureCheckboxSelected(): Promise<void> {
    logger.debug("Verificando si el checkbox esta seleccionado", { label: this.config.label });
    const checkbox = await waitFind(this.driver, AIPostModal.CHECKBOX, this.config);
    const classAttribute = await checkbox.getAttribute('class');

    if (!classAttribute.includes('mdc-checkbox--selected')) {
      logger.debug("El checkbox no esta seleccionado, haciendo click", { label: this.config.label });
      await clickSafe(this.driver, checkbox, this.config);
    }
    logger.debug("Checkbox seleccionado", { label: this.config.label });
  }

  /**
   * Espera a que el botón de generar esté habilitado (atributo `disabled` ausente) antes de continuar.
   * Hace polling durante 5 segundos; lanza error si el botón no se habilita en ese tiempo.
   *
   * @returns {Promise<boolean>} Siempre `true` si el botón se habilita dentro del timeout.
   */
  async isGenerateBtnEnabled(): Promise<boolean> {
    logger.debug("Verificando si el boton generar esta habilitado", { label: this.config.label });
    await this.driver.wait(async () => {
      const btn = await waitFind(this.driver, AIPostModal.GENERATE_BTN, this.config);
      const disabledAttr = await btn.getAttribute('disabled');
      return disabledAttr === null;
    }, 5000, "El boton generar no se habilito");
    return true;
  }

  /**
   * Espera a que el indicador de carga del preview IA desaparezca del DOM.
   * Hace polling sobre `div.container-preview app-loading-css`; resuelve cuando no hay elementos.
   *
   * @param timeout - Tiempo máximo de espera en milisegundos. Por defecto 3 minutos.
   */
  async waitForLoadingPreview(timeout: number = 1000 * 60 * 3) {
    logger.debug("Esperando a que termine de cargar la preview", { label: this.config.label });
    await this.driver.wait(async () => {
      const loading = await this.driver.findElements(AIPostModal.LOADING_PREVIEW);
      return loading.length === 0;
    }, timeout, "La preview no termino de cargar");
    logger.debug("Preview cargada", { label: this.config.label });
  }

  /**
   * Verifica si la generación IA terminó en un estado de error visible en el preview.
   * Busca `div.status-container` en el DOM; si está presente, extrae el mensaje de error
   * del `h3` y `p` internos, lo adjunta al reporte Allure y lanza un error que detiene el flujo.
   */
  async isAIFailed() {
    logger.debug("Revisando si fallo el preview...", { label: this.config.label });
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