/**
 * Page Object Maestro para la edición de notas.
 * Centraliza y coordina todas las secciones del editor.
*/
export class NoteEditorPage {
    // ========== SECCIONES (Private para forzar uso del Orquestador) ==========
    driver;
    noteType;
    tags;
    listicle;
    liveBlog;
    author;
    header;
    settings;
    text;
    creation;
    constructor(driver, noteType) {
        this.driver = driver;
        this.noteType = noteType = NoteType.POST;
        this.tags = new NoteTagsSection(driver);
        this.author = new NoteAuthorSection(driver);
        this.header = new NoteHeaderActions(driver);
        this.settings = new NoteLateralSettings(driver);
        this.text = new NoteTextContentSection(driver);
        this.creation = new NoteCreationDropdown(driver);
        this.listicle = new ListicleSection(driver);
        this.liveBlog = new LiveBlogSection(driver);
    }
    /**
     * Orquestador Principal: Rellena la nota de forma integral.
     * Coordina la ejecución de cada sub-sección con trazabilidad completa.
    */
    async fillFullNote(data, opts = {}) {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, "NoteEditorPage")
        };
        logger.info(`Iniciando llenado integral de la nota: "${data.title || 'Sin Título'}"`, { label: config.label });
        try {
            // 1. Procesamiento de Textos Principales
            const textMapping = [
                { key: 'title', type: NoteTextField.TITLE },
                { key: 'secondaryTitle', type: NoteTextField.SECONDARY_TITLE },
                { key: 'subTitle', type: NoteTextField.SUB_TITLE },
                { key: 'halfTitle', type: NoteTextField.HALF_TITLE },
                { key: 'body', type: NoteTextField.BODY },
                { key: 'summary', type: NoteTextField.SUMMARY },
            ];
            for (const { key, type } of textMapping) {
                const value = data[key];
                if (typeof value === 'string' && value.trim()) {
                    await this.text.fillField(type, value, config);
                }
            }
            // 2. Tags
            if (data.tags?.length) {
                await this.tags.addTags(NoteTagField.TAGS, data.tags, config);
            }
            if (data.hiddenTags?.length) {
                await this.tags.addTags(NoteTagField.HIDDEN_TAGS, data.hiddenTags, config);
            }
            // 3. Listicle
            if (data.listicleItems?.length) {
                // Definimos qué sección usar basándonos en el tipo de nota
                const listSection = (this.noteType === NoteType.LIVEBLOG)
                    ? this.liveBlog
                    : this.listicle;
                await listSection.fillItems(data.listicleItems, config);
            }
            // 4. Autor y Configuración Lateral
            await this.author.fillAuthorData(data, config);
            await this.settings.selectFirstSectionOption(config);
            logger.info("Llenado integral de la nota finalizado exitosamente.", { label: config.label });
        }
        catch (error) {
            // Regla de Oro: No logueamos el error aquí porque las funciones hijas ya lo hicieron.
            // Solo propagamos para que el Test Runner marque la falla.
            throw error;
        }
    }
    /**
     * Expone acciones del header (Guardar/Publicar) de forma controlada.
     */
    get actions() {
        return this.header;
    }
}
import { NoteAuthorSection } from "./NoteAuthorSection.js";
import { NoteHeaderActions } from "./NoteHeaderActions.js";
import { NoteLateralSettings } from "./NoteLateralSettings.js";
import { NoteTextContentSection, NoteTextField } from "./NoteTextContentSection.js";
import { NoteCreationDropdown, NoteType } from "./NoteCreationDropdown.js";
import { NoteTagsSection, NoteTagField } from './NoteTagsSection.js';
import { DefaultConfig } from "../../../core/config/default.js";
import { stackLabel } from '../../../core/utils/stackLabel.js';
import logger from "../../../core/utils/logger.js";
import { ListicleSection, LiveBlogSection } from './noteList/NoteListicleItemSection.js';
//# sourceMappingURL=NoteEditorPage.js.map