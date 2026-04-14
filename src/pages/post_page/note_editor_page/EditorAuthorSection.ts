import { Locator, WebDriver, By } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";
import { step } from "allure-js-commons";

import type { AuthorType } from '../../../interfaces/data.js';
export type { AuthorType } from '../../../interfaces/data.js';
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

/**
 * Representa la sección de autoría dentro del Editor de Notas.
 * Maneja la selección de tipo de autor y la carga de metadatos asociados.
 */
export class EditorAuthorSection {
  private config: RetryOptions;

  // ========== LOCATORS (Private & Readonly) ==========
  public static readonly AUTHOR_BUTTON_MAP = {
    INTERNAL: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='check_circle_outline']"),
    ANONYMOUS: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='person_outline']"),
    MANUAL: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='draw']"),
  } as const;

  private static readonly AUTHOR_DESCRIPTION: Locator = By.xpath("//div[contains(@class,'author-description')]//textarea[@type='text']");
  private static readonly AUTHOR_NAME: Locator = By.css(".image-container_description input[type='text']");


  constructor(private driver: WebDriver, opts: RetryOptions = {}) {
    this.config = resolveRetryConfig(opts, "EditorAuthorSection")
  }

  // ========== MÉTODOS PÚBLICOS (Orquestadores de Componente) ==========

  /**
   * Determina y ejecuta la configuración de autor según los datos proporcionados.
   * @param data Subconjunto de NoteData necesario para el autor.
   */
  async fillAll(
    data: { authorType?: AuthorType, authorName?: string, authorDescription?: string }
  ): Promise<void> {
    await step("Asignar Autor", async (stepContext) => {
      stepContext.parameter("Author Type", `${data.authorType || 'undefined'}`);
      stepContext.parameter("Author Name", `${data.authorName || 'undefined'}`);
      stepContext.parameter("Author Description", `${data.authorDescription || 'undefined'}`);

      const hasDescription = !!data.authorDescription?.trim();
      const hasName = !!data.authorName?.trim();

      // Inferencia de tipo de autor si no viene explícito
      let authorType: AuthorType | undefined = data.authorType;
      if (!authorType) {
        if (hasName || hasDescription) {
          authorType = 'MANUAL';
          logger.debug("Tipo de autor no especificado. Infiriendo MANUAL por presencia de datos.", { label: this.config.label });
        } else {
          return;
        }
      }

      try {
        switch (authorType) {
          case 'INTERNAL':
            return;

          case 'ANONYMOUS':
            await this.selectAuthorType('ANONYMOUS');
            break;

          case 'MANUAL':
            await this.selectAuthorType('MANUAL');
            if (hasName) await this.fillAuthorName(data.authorName!);
            if (hasDescription) await this.fillAuthorDescription(data.authorDescription!);
            break;
        }
        logger.debug(`Autor configurado exitosamente como: ${authorType}`, { label: this.config.label });
      } catch (error: unknown) {
        logger.error(`Error en fillAll de EditorAuthorSection: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }
  // ========== PIEZAS LEGO (Atómicas) ==========

  /**
   * Selecciona el tipo de autor haciendo click en el botón correspondiente del mapa `AUTHOR_BUTTON_MAP`.
   *
   * @param type - Tipo de autor a seleccionar (INTERNAL, ANONYMOUS, MANUAL).
   */
  public async selectAuthorType(type: AuthorType): Promise<void> {
    const locator = EditorAuthorSection.AUTHOR_BUTTON_MAP[type];

    logger.debug(`Seleccionando tipo de autor: ${type}`, { label: this.config.label });
    await clickSafe(this.driver, locator, this.config);
  }

  /**
   * Escribe el nombre del autor en el campo de texto correspondiente.
   *
   * @param name - Nombre del autor a ingresar.
   */
  public async fillAuthorName(name: string): Promise<void> {
    logger.debug(`Escribiendo nombre de autor`, { label: this.config.label });
    const element = await writeSafe(this.driver, EditorAuthorSection.AUTHOR_NAME, name, this.config);
  }

  /**
   * Escribe la descripción del autor en el textarea correspondiente.
   *
   * @param description - Descripción del autor a ingresar.
   */
  public async fillAuthorDescription(description: string): Promise<void> {
    logger.debug(`Escribiendo descripción de autor`, { label: this.config.label });
    const element = await writeSafe(this.driver, EditorAuthorSection.AUTHOR_DESCRIPTION, description, this.config);
  }
}