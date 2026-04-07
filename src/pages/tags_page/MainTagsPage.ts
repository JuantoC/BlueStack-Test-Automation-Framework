import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";
import { TagTable } from "./TagTable.js";
import { TagActions } from "./TagActions.js";
import type { TagActionType } from "./TagActions.js";
import { TagAlphaFilter } from "./TagAlphaFilter.js";
import { NewTagBtn } from "./NewTagBtn.js";
import { NewTagModal } from "./NewTagModal.js";
import { TagFooterActions } from "./TagFooterActions.js";
import type { TagFooterActionType } from "./TagFooterActions.js";
import type { TagData } from "../../interfaces/data.js";

/**
 * Page Object Maestro para la sección Gestión de Tags del CMS.
 * Actúa como orquestador central que coordina todos los sub-componentes del Gestor de Tags.
 * Es el único punto de entrada para cualquier flujo de pruebas sobre esta sección.
 *
 * @example
 * const page = new MainTagsPage(driver, { timeoutMs: 10000 });
 * await page.createNewTag({ title: 'Gaming', estado: 'Aprobados' });
 */
export class MainTagsPage {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private readonly newTagBtn: NewTagBtn;
  private readonly newTagModal: NewTagModal;
  public readonly table: TagTable;
  private readonly actions: TagActions;
  private readonly alphaFilter: TagAlphaFilter;
  private readonly footer: TagFooterActions;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainTagsPage");

    this.newTagBtn = new NewTagBtn(this.driver, this.config);
    this.newTagModal = new NewTagModal(this.driver, this.config);
    this.table = new TagTable(this.driver, this.config);
    this.actions = new TagActions(this.driver, this.config);
    this.alphaFilter = new TagAlphaFilter(this.driver, this.config);
    this.footer = new TagFooterActions(this.driver, this.config);
  }

  /**
   * Orquesta el flujo completo de creación de un nuevo tag.
   * Abre el modal, llena los campos con los datos provistos y confirma la creación.
   * Espera el toast de éxito del sistema CDP tras confirmar.
   *
   * @param tagData - Datos del tag a crear. `title` es obligatorio; el resto son opcionales.
   */
  async createNewTag(tagData: TagData): Promise<void> {
    await step(`Crear nuevo tag: "${tagData.title}"`, async (stepContext) => {
      attachment('Tag Data', JSON.stringify(tagData, null, 2), 'application/json');
      stepContext.parameter('Título', tagData.title);
      stepContext.parameter('Timeout', `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Abriendo modal de nuevo tag para: "${tagData.title}"`, { label: this.config.label });
        await this.newTagBtn.clickNewTag();

        logger.debug('Modal abierto. Llenando campos...', { label: this.config.label });
        await this.newTagModal.fillAndCreate(tagData);

        await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
        logger.info(`Tag "${tagData.title}" creado exitosamente.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al crear el tag "${tagData.title}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Ejecuta una acción del menú desplegable (3 puntitos) sobre un tag específico.
   *
   * @param tagContainer - WebElement del contenedor de acciones del tag (`div#N-dropMenu`).
   *   Obtenerlo previamente con `this.table.getTagContainerByIndex()` o `getTagContainerByTitle()`.
   * @param action - Tipo de acción a ejecutar (PREVIEW, DELETE, EDIT, DISAPPROVE, APPROVE).
   */
  async clickOnTagAction(tagContainer: WebElement, action: TagActionType): Promise<void> {
    await step(`Ejecutar acción "${action}" sobre el tag`, async (stepContext) => {
      stepContext.parameter('Acción', action);
      stepContext.parameter('Timeout', `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Ejecutando acción "${action}"...`, { label: this.config.label });
        await this.actions.clickOnAction(tagContainer, action);
        logger.info(`Acción "${action}" ejecutada correctamente.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al ejecutar acción "${action}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Selecciona uno o varios tags por índice y ejecuta una acción masiva desde el footer.
   * Itera sobre cada índice provisto y delega la selección en `TagTable.selectTagByIndex`.
   *
   * @param indices - Array de índices de los tags a seleccionar (base 0).
   * @param action - Acción del footer a ejecutar sobre la selección (APPROVE, DISAPPROVE, DELETE).
   */
  async selectAndExecuteFooterAction(indices: number[], action: TagFooterActionType): Promise<void> {
    await step(`Seleccionar ${indices.length} tags y ejecutar "${action}"`, async (stepContext) => {
      stepContext.parameter('Cantidad', indices.length.toString());
      stepContext.parameter('Acción', action);
      stepContext.parameter('Timeout', `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Seleccionando ${indices.length} tags para acción: "${action}"`, { label: this.config.label });
        for (const index of indices) {
          await this.table.selectTagByIndex(index);
        }

        logger.debug(`Tags seleccionados. Ejecutando "${action}" en footer...`, { label: this.config.label });
        await this.footer.clickFooterAction(action);
        logger.info(`Acción de footer "${action}" ejecutada sobre ${indices.length} tag/s.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error en selectAndExecuteFooterAction: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Filtra la tabla de tags por la letra inicial indicada usando el filtro alfabético.
   *
   * @param letter - Letra del filtro a activar (A-Z, Ñ, 123#).
   */
  async filterTagsByLetter(letter: string): Promise<void> {
    await step(`Filtrar tags por letra: "${letter}"`, async (stepContext) => {
      stepContext.parameter('Letra', letter);

      try {
        logger.debug(`Aplicando filtro por letra: "${letter}"`, { label: this.config.label });
        await this.alphaFilter.filterByLetter(letter);
        logger.info(`Filtro por letra "${letter}" aplicado.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al filtrar por letra "${letter}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Busca tags por texto libre usando el campo de búsqueda de la tabla.
   *
   * @param text - Texto a buscar en la tabla de tags.
   */
  async searchTag(text: string): Promise<void> {
    await step(`Buscar tag: "${text}"`, async (stepContext) => {
      stepContext.parameter('Texto', text);

      try {
        logger.debug(`Buscando tag: "${text}"`, { label: this.config.label });
        await this.alphaFilter.searchByText(text);
        logger.info(`Búsqueda de tag "${text}" ejecutada.`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error al buscar tag "${text}": ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Obtiene un array de WebElements de los primeros N contenedores de acciones de tags.
   *
   * @param count - Cantidad de contenedores a recuperar desde el inicio de la tabla (base 0).
   * @returns {Promise<WebElement[]>} Array con los contenedores `div#N-dropMenu` de los tags.
   */
  async getTagContainers(count: number): Promise<WebElement[]> {
    try {
      const containers: WebElement[] = [];
      for (let i = 0; i < count; i++) {
        const container = await this.table.getTagContainerByIndex(i);
        containers.push(container);
      }
      return containers;
    } catch (error: unknown) {
      logger.error(`Error al obtener ${count} contenedores de tags: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
