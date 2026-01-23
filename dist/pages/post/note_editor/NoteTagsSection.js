import { By } from "selenium-webdriver";
import { writeSafe } from "../../../core/actions/writeSafe.js";
import { DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import logger from "../../../core/utils/logger.js";
export var NoteTagField;
(function (NoteTagField) {
    NoteTagField["TAGS"] = "tags";
    NoteTagField["HIDDEN_TAGS"] = "hiddenTags";
})(NoteTagField || (NoteTagField = {}));
/**
 * Gestiona la sección de etiquetas (Tags) y etiquetas ocultas de la nota.
 */
export class NoteTagsSection {
    driver;
    // ========== LOCATORS (Private & Readonly) ==========
    LOCATORS = {
        [NoteTagField.TAGS]: By.css('div[id="claves-content"] input[role="combobox"]'),
        [NoteTagField.HIDDEN_TAGS]: By.css('div[id="clavesOcultas-content"] input[role="combobox"]')
    };
    constructor(driver) {
        this.driver = driver;
    }
    /**
     * Agrega múltiples tags presionando Enter después de cada uno para procesarlos.
     * @param type Tipo de tag (Visible u Oculto).
     * @param tags Array de strings con las etiquetas.
     * @param opts Opciones de reintento y trazabilidad.
     */
    async addTags(type, tags, opts = {}) {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, `addTags(${type})`)
        };
        if (!tags?.length)
            return;
        const locator = this.LOCATORS[type];
        try {
            for (const tag of tags) {
                const sanitizedTag = tag.trim();
                if (!sanitizedTag)
                    continue;
                logger.debug(`Procesando tag: "${sanitizedTag}"`, { label: config.label });
                // El salto de línea \n actúa como la tecla ENTER para confirmar el tag en el componente UI
                await writeSafe(this.driver, locator, `${sanitizedTag}\n`, config);
            }
            logger.info(`Se agregaron ${tags.length} etiquetas exitosamente al campo ${type}`, { label: config.label });
        }
        catch (error) {
            // Propagamos: writeSafe ya reportó cuál tag falló o si el campo no era interactuable
            throw error;
        }
    }
}
//# sourceMappingURL=NoteTagsSection.js.map