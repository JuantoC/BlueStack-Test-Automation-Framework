import { By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { DefaultConfig } from "../../../core/config/default.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
/**
 * Maneja el panel lateral de configuración de la nota (Settings).
 * Incluye la gestión de secciones y metadatos laterales.
 */
export class NoteLateralSettings {
    driver;
    // ========== LOCATORS (Respetando originales y encapsulando) ==========
    SETTINGS_TOGGLE_BTN = By.css("a.btn-toggle button.btn-dropdown");
    SECTION_COMBO = By.css('mat-select[data-testid="section-options"]');
    FIRST_SECTION_OPT = By.css("div[role='listbox'] mat-option:first-of-type");
    constructor(driver) {
        this.driver = driver;
    }
    // ========== MÉTODOS ==========
    /**
     * Abre o cierra el panel lateral de configuraciones.
     */
    async toggleSettingsPanel(opts = {}) {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, "toggleSettingsPanel")
        };
        logger.debug("Cambiando estado del panel lateral de configuración", { label: config.label });
        await clickSafe(this.driver, this.SETTINGS_TOGGLE_BTN, config);
    }
    /**
     * Orquestador de componente: Abre el selector de secciones y selecciona la primera disponible.
     */
    async selectFirstSectionOption(opts = {}) {
        const config = {
            ...DefaultConfig,
            ...opts,
            label: stackLabel(opts.label, "selectFirstSectionOption")
        };
        try {
            logger.debug("Abriendo combo de selección de secciones", { label: config.label });
            await clickSafe(this.driver, this.SECTION_COMBO, config);
            logger.debug("Seleccionando la primera opción del listbox", { label: config.label });
            await clickSafe(this.driver, this.FIRST_SECTION_OPT, config);
            logger.info("Sección seleccionada exitosamente (primera de la lista)", { label: config.label });
        }
        catch (error) {
            // Propagamos el error; clickSafe ya se encargó del log detallado.
            throw error;
        }
    }
}
//# sourceMappingURL=NoteLateralSettings.js.map