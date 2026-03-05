import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";
import { NoteData } from "../../../dataTest/noteDataInterface.js";
import { step } from "allure-js-commons";

export enum AuthorType {
  INTERNAL = 'internal',
  ANONYMOUS = 'anonymous',
  MANUAL = 'manual'
}
export type NoteAuthorData = Pick<NoteData, 'authorType' | 'authorName' | 'authorDescription'>;

/**
 * Representa la sección de autoría dentro del Editor de Notas.
 * Maneja la selección de tipo de autor y la carga de metadatos asociados.
 */
export class EditorAuthorSection {
  private driver: WebDriver;
  private config: RetryOptions;

  // ========== LOCATORS (Private & Readonly) ==========
  private readonly authorButtonMap: Record<AuthorType, Locator> = {
    [AuthorType.INTERNAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='check_circle_outline']"),
    [AuthorType.ANONYMOUS]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='person_outline']"),
    [AuthorType.MANUAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='draw']"),
  };

  private readonly AUTHOR_DESCRIPTION: Locator = By.xpath("//div[contains(@class,'author-description')]//textarea[@type='text']");
  private readonly AUTHOR_NAME: Locator = By.css(".image-container_description input[type='text']");


  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "EditorAuthorSection") }
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
          authorType = AuthorType.MANUAL;
          logger.debug("Tipo de autor no especificado. Infiriendo MANUAL por presencia de datos.", { label: this.config.label });
        } else {
          return; // Nada que hacer
        }
      }

      try {
        switch (authorType) {
          case AuthorType.INTERNAL:
            return;

          case AuthorType.ANONYMOUS:
            await this.selectAuthorType(AuthorType.ANONYMOUS);
            break;

          case AuthorType.MANUAL:
            await this.selectAuthorType(AuthorType.MANUAL);
            if (hasName) await this.fillAuthorName(data.authorName!);
            if (hasDescription) await this.fillAuthorDescription(data.authorDescription!);
            break;
        }
        logger.debug(`Autor configurado exitosamente como: ${authorType}`, { label: this.config.label });
      } catch (error) {
        // Propagamos: el error detallado ya fue logueado en las piezas atómicas.
        throw error;
      }
    });
  }
  // ========== PIEZAS LEGO (Atómicas) ==========

  async selectAuthorType(type: AuthorType): Promise<void> {
    const locator = this.authorButtonMap[type];

    logger.debug(`Seleccionando tipo de autor: ${type}`, { label: this.config.label });
    await clickSafe(this.driver, locator, this.config);
  }

  async fillAuthorName(name: string): Promise<void> {
    logger.debug(`Escribiendo nombre de autor`, { label: this.config.label });
    const element = await writeSafe(this.driver, this.AUTHOR_NAME, name, this.config);
  }

  async fillAuthorDescription(description: string): Promise<void> {
    logger.debug(`Escribiendo descripción de autor`, { label: this.config.label });
    const element = await writeSafe(this.driver, this.AUTHOR_DESCRIPTION, description, this.config);
  }
}