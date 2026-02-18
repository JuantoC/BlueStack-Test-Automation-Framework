import { By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { DefaultConfig } from "../../../core/config/default.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import logger from "../../../core/utils/logger.js";
export var AuthorType;
(function (AuthorType) {
    AuthorType["INTERNAL"] = "internal";
    AuthorType["ANONYMOUS"] = "anonymous";
    AuthorType["MANUAL"] = "manual";
})(AuthorType || (AuthorType = {}));
/**
 * Representa la sección de autoría dentro del Editor de Notas.
 * Maneja la selección de tipo de autor y la carga de metadatos asociados.
 */
export class NoteAuthorSection {
    // ========== LOCATORS (Private & Readonly) ==========
    authorButtonMap = {
        [AuthorType.INTERNAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='check_circle_outline']"),
        [AuthorType.ANONYMOUS]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='person_outline']"),
        [AuthorType.MANUAL]: By.xpath("//div[contains(@class,'icon-preview')]//mat-icon[normalize-space()='draw']"),
    };
    authorDescriptionField = By.xpath("//div[contains(@class,'author-description')]//textarea[@type='text']");
    authorNameField = By.css(".image-container_description input[type='text']");
    driver;
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS PÚBLICOS (Orquestadores de Componente) ==========
    /**
     * Determina y ejecuta la configuración de autor según los datos proporcionados.
     * @param data Subconjunto de NoteData necesario para el autor.
     */
    async fillAuthorData(data, opts = {}) {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, "fillAuthorData")
        };
        const hasDescription = !!data.authorDescription?.trim();
        const hasName = !!data.authorName?.trim();
        // Inferencia de tipo de autor si no viene explícito
        let authorType = data.authorType;
        if (!authorType) {
            if (hasName || hasDescription) {
                authorType = AuthorType.MANUAL;
                logger.debug("Tipo de autor no especificado. Infiriendo MANUAL por presencia de datos.", { label: config.label });
            }
            else {
                return; // Nada que hacer
            }
        }
        try {
            switch (authorType) {
                case AuthorType.INTERNAL:
                    return;
                case AuthorType.ANONYMOUS:
                    await this.selectAuthorType(AuthorType.ANONYMOUS, config);
                    break;
                case AuthorType.MANUAL:
                    await this.selectAuthorType(AuthorType.MANUAL, config);
                    if (hasName)
                        await this.fillAuthorName(data.authorName, config);
                    if (hasDescription)
                        await this.fillAuthorDescription(data.authorDescription, config);
                    break;
            }
            logger.debug(`Autor configurado exitosamente como: ${authorType}`, { label: config.label });
        }
        catch (error) {
            // Propagamos: el error detallado ya fue logueado en las piezas atómicas.
            throw error;
        }
    }
    // ========== PIEZAS LEGO (Atómicas) ==========
    async selectAuthorType(type, opts = {}) {
        const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "selectAuthorType") };
        const locator = this.authorButtonMap[type];
        logger.debug(`Seleccionando tipo de autor: ${type}`, { label: config.label });
        await clickSafe(this.driver, locator, config);
    }
    async fillAuthorName(name, opts = {}) {
        const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "fillAuthorName") };
        logger.debug(`Escribiendo nombre de autor`, { label: config.label });
        const element = await writeSafe(this.driver, this.authorNameField, name, config);
    }
    async fillAuthorDescription(description, opts = {}) {
        const config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "fillAuthorDescription") };
        logger.debug(`Escribiendo descripción de autor`, { label: config.label });
        const element = await writeSafe(this.driver, this.authorDescriptionField, description, config);
    }
}
//# sourceMappingURL=NoteAuthorSection.js.map