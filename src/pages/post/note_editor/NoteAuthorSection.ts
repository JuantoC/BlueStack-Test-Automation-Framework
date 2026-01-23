import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions, DefaultConfig } from "../../../core/config/default.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { assertValueEquals } from "../../../core/utils/assertValueEquals.js";
import logger from "../../../core/utils/logger.js";

export enum AuthorType {
  INTERNAL = 'internal',
  ANONYMOUS = 'anonymous',
  MANUAL = 'manual'
}

/**
 * Representa la sección de autoría dentro del Editor de Notas.
 * Maneja la selección de tipo de autor y la carga de metadatos asociados.
 */
export class NoteAuthorSection {
  // ========== LOCATORS (Private & Readonly) ==========
  private readonly authorButtonMap: Record<AuthorType, Locator> = {
    [AuthorType.INTERNAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[text()='check_circle_outline']"),
    [AuthorType.ANONYMOUS]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[text()='person_outline']"),
    [AuthorType.MANUAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[text()='draw']"),
  };

  private readonly authorDescriptionField = By.xpath("//div[contains(@class,'author-description')]//textarea[@type='text']");
  private readonly authorNameField = By.css(".image-container_description input[type='text']");

  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  // ========== MÉTODOS PÚBLICOS (Orquestadores de Componente) ==========

  /**
   * Determina y ejecuta la configuración de autor según los datos proporcionados.
   * @param data Subconjunto de NoteData necesario para el autor.
   */
  async fillAuthorData(
    data: { authorType?: string, authorName?: string, authorDescription?: string },
    opts: RetryOptions = {}
  ): Promise<void> {
    const config = {
      ...DefaultConfig,
      ...opts,
      label: stackLabel(opts.label, "fillAuthorData")
    };

    const hasDescription = !!data.authorDescription?.trim();
    const hasName = !!data.authorName?.trim();

    // Inferencia de tipo de autor si no viene explícito
    let authorType: AuthorType | undefined = data.authorType as AuthorType;
    if (!authorType) {
      if (hasName || hasDescription) {
        authorType = AuthorType.MANUAL;
        logger.debug("Tipo de autor no especificado. Infiriendo MANUAL por presencia de datos.", { label: config.label });
      } else {
        return; // Nada que hacer
      }
    }

    try {
      switch (authorType) {
        case AuthorType.INTERNAL:
          logger.info("Configurando autor como tipo INTERNO", { label: config.label });
          return;

        case AuthorType.ANONYMOUS:
          await this.selectAuthorType(AuthorType.ANONYMOUS, config);
          break;

        case AuthorType.MANUAL:
          await this.selectAuthorType(AuthorType.MANUAL, config);
          if (hasName) await this.fillAuthorName(data.authorName!, config);
          if (hasDescription) await this.fillAuthorDescription(data.authorDescription!, config);
          break;
      }
      logger.info(`Autor configurado exitosamente como: ${authorType}`, { label: config.label });
    } catch (error) {
      // Propagamos: el error detallado ya fue logueado en las piezas atómicas.
      throw error;
    }
  }

  // ========== PIEZAS LEGO (Atómicas) ==========

  async selectAuthorType(type: AuthorType, opts: RetryOptions = {}): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "selectAuthorType") };
    const locator = this.authorButtonMap[type];

    logger.debug(`Seleccionando tipo de autor: ${type}`, { label: config.label });
    await clickSafe(this.driver, locator, config);
  }

  async fillAuthorName(name: string, opts: RetryOptions = {}): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "fillAuthorName") };

    logger.debug(`Escribiendo nombre de autor`, { label: config.label });
    const element = await writeSafe(this.driver, this.authorNameField, name, config);
    await assertValueEquals(element, this.authorNameField, name, config);
  }

  async fillAuthorDescription(description: string, opts: RetryOptions = {}): Promise<void> {
    const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "fillAuthorDescription") };

    logger.debug(`Escribiendo descripción de autor`, { label: config.label });
    const element = await writeSafe(this.driver, this.authorDescriptionField, description, config);
    await assertValueEquals(element, this.authorDescriptionField, description, config);
  }
}