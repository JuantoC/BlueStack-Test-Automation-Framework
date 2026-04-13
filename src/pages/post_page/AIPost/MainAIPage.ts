import { WebDriver } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../../core/config/defaultConfig.js";
import { step } from "allure-js-commons";
import logger from "../../../core/utils/logger.js";
import { AIDataNote } from "../../../interfaces/data.js";
import { AIPostModal } from "./AIPostModal.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

/**
 * Page Object Maestro para la sección de generación de notas con IA del CMS.
 * Coordina el flujo completo de generación delegando en `AIPostModal`:
 * relleno del formulario, disparo de la generación, espera del preview y confirmación.
 * Es el único punto de entrada para tests que involucren la creación asistida por IA.
 *
 * @example
 * const page = new MainAIPage(driver, opts);
 * await page.generateNewAINote(aiNoteData);
 */
export class MainAIPage {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private readonly ai_post: AIPostModal;

  constructor(driver: WebDriver, config: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(config, 'MainAIPage');
    this.ai_post = new AIPostModal(this.driver, this.config);
  }

  /**
   * Orquesta el flujo completo de generación de una nota IA.
   * Secuencia: rellena los campos del modal → dispara la generación → espera el preview →
   * verifica que no haya error → confirma con el botón "Done".
   *
   * @param data - Datos parciales de la nota IA (prompt, contexto, sección, tono, idioma, etc.).
   * @returns {Promise<any>} Resuelve cuando el flujo de generación ha finalizado correctamente.
   */
  async generateNewAINote(data: Partial<AIDataNote>): Promise<any> {
    await step("Generar nueva nota IA", async () => {
      try {
        await this.ai_post.fillAll(data);
        await this.ai_post.clickOnGenerateBtn();
        await this.ai_post.isAIFailed();
        await this.ai_post.clickOnDoneBtn();
      } catch (error: unknown) {
        logger.error(`Error al generar nueva nota IA`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }
}