import { DefaultConfig } from "../core/config/default.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { NoteEditorPage } from "../pages/post/note_editor/NoteEditorPage.js";
import logger from "../core/utils/logger.js";
/**
 * Flow de Negocio: Rellenado Dinámico de Nota.
 * Procesa únicamente los campos presentes en el objeto 'data'.
 */
export async function fillNote(driver, data, opts = {}) {
    // 1. Configuración de trazabilidad
    const config = {
        ...DefaultConfig,
        ...opts,
        label: stackLabel(opts.label, "flow:fillNote")
    };
    const editor = new NoteEditorPage(driver);
    try {
        logger.info(`Iniciando llenado dinámico de campos presentes en data`, {
            label: config.label
        });
        /**
         * Delegamos la inteligencia al método maestro del NoteEditorPage.
         * Como usamos Partial<NoteData>, fillFullNote ya tiene la lógica de:
         * "Si el campo existe y tiene valor, lo escribo; si no, lo ignoro".
         */
        await editor.fillFullNote(data, config);
        logger.info(`Llenado dinámico finalizado con éxito`, { label: config.label });
    }
    catch (error) {
        // Captura de fallo en el nivel más alto del flujo de edición
        logger.error(`Fallo en el flow de edición: ${error.message}`, {
            label: config.label
        });
        throw error;
    }
}
//# sourceMappingURL=fillNote.js.map