import { Locator, WebDriver, By } from "selenium-webdriver";
import { RetryOptions, resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";
import logger from "../../../core/utils/logger.js";
import { waitFind } from "../../../core/actions/waitFind.js";
import { PublishModal } from "../../modals/PublishModal.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

export type VideoExitAction = keyof typeof EditorHeaderActions.LOCATORS;

/**
 * Orquestador de acciones del Header en el Editor de Videos.
 * Gestiona secuencias complejas de clics (Dropdown -> Opción -> Modal).
 */
export class EditorHeaderActions {
    private driver: WebDriver;
    private config: RetryOptions;

    private readonly publishModal: PublishModal

    // ========== LOCATORS ==========
    private static readonly INFO_SECTION: Locator = By.css('div.info-image-container')

    private static readonly SAVE_BTN: Locator = By.css('button.white-btn[data-testid="dropdown-action"]');
    private static readonly PUBLISH_BTN: Locator = By.css('button.btn-info[data-testid="dropdown-action"]');
    private static readonly BACK_BTN: Locator = By.css('a.navbar-brand');

    private static readonly DROPDOWN_SAVE_CONTAINER: Locator = By.id('dropdown-save');
    private static readonly DROPDOWN_PUBLISH_CONTAINER: Locator = By.id('dropdown-publish');

    // Nota: IDs compartidos son un riesgo potencial en el DOM.
    private static readonly SAVE_AND_EXIT_OPT: Locator = By.id("option-dropdown-0");
    private static readonly EXIT_WITHOUT_SAVING_OPT: Locator = By.id("option-dropdown-1");
    private static readonly PUBLISH_AND_EXIT_OPT: Locator = By.id("option-dropdown-0");

    private static readonly MODAL_BACK_SAVE_AND_EXIT_BTN: Locator = By.css('[data-testid="btn-ok-confirmModal"] button');
    private static readonly MODAL_BACK_DISCARD_EXIT_BTN: Locator = By.css('[data-testid="btn-cancel"] button');

    public static readonly LOCATORS = {
        SAVE_ONLY: EditorHeaderActions.SAVE_BTN,
        SAVE_AND_EXIT: EditorHeaderActions.DROPDOWN_SAVE_CONTAINER,
        EXIT_WITHOUT_SAVING: EditorHeaderActions.DROPDOWN_SAVE_CONTAINER,
        PUBLISH_ONLY: EditorHeaderActions.PUBLISH_BTN,
        PUBLISH_AND_EXIT: EditorHeaderActions.DROPDOWN_PUBLISH_CONTAINER,
        BACK_SAVE_AND_EXIT: EditorHeaderActions.BACK_BTN,
        BACK_EXIT_DISCARD: EditorHeaderActions.BACK_BTN,
    } as const;

    constructor(driver: WebDriver, opts: RetryOptions = {}) {
        this.driver = driver;
        this.config = resolveRetryConfig(opts, "EditorHeaderActions")

        this.publishModal = new PublishModal(this.driver, this.config)
    }

    /**
     * Ejecuta la secuencia de guardado o salida del editor según la acción indicada.
     * Funciona como una máquina de estados: tras el click inicial (que puede abrir un dropdown
     * o hacer click directo), despacha la lógica secundaria específica de cada acción
     * (opciones del dropdown, confirmación del modal de publicación, etc.).
     *
     * @param action - Acción de salida o guardado a ejecutar (SAVE_ONLY, PUBLISH_AND_EXIT, etc.).
     */
    public async clickExitAction(action: VideoExitAction): Promise<void> {

        const initialLocator = EditorHeaderActions.LOCATORS[action];
        if (!initialLocator) {
            throw new Error(`Acción de salida no mapeada en el componente: ${action}`);
        }

        try {
            logger.debug(`Iniciando secuencia de salida: ${action}`, { label: this.config.label });

            // 1. Antes del Clic inicial (Abrir dropdown o clic directo) vamos a dar una espera explicita para que termine de cargar la pagina por completo.
            await waitFind(this.driver, EditorHeaderActions.INFO_SECTION, this.config)
            await clickSafe(this.driver, initialLocator, { ...this.config, initialDelayMs: 10000 });

            // 2. Manejo de sub-pasos (Máquina de estados)
            switch (action) {
                case "SAVE_ONLY":
                    break;

                case "SAVE_AND_EXIT":
                    await clickSafe(this.driver, EditorHeaderActions.SAVE_AND_EXIT_OPT, this.config);
                    break;

                case "EXIT_WITHOUT_SAVING":
                    await clickSafe(this.driver, EditorHeaderActions.EXIT_WITHOUT_SAVING_OPT, this.config);
                    await clickSafe(this.driver, EditorHeaderActions.MODAL_BACK_DISCARD_EXIT_BTN, this.config);
                    break;

                case "PUBLISH_ONLY":
                    await this.publishModal.clickOnPublishBtn();
                    break;

                case "PUBLISH_AND_EXIT":
                    await clickSafe(this.driver, EditorHeaderActions.PUBLISH_AND_EXIT_OPT, this.config);
                    await this.publishModal.clickOnPublishBtn();
                    break;

                case "BACK_SAVE_AND_EXIT":
                    await clickSafe(this.driver, EditorHeaderActions.MODAL_BACK_SAVE_AND_EXIT_BTN, this.config);
                    break;

                case "BACK_EXIT_DISCARD":
                    await clickSafe(this.driver, EditorHeaderActions.MODAL_BACK_DISCARD_EXIT_BTN, this.config);
                    break;
            }

            logger.debug(`Acción header ${action} ejecutada correctamente`, { label: this.config.label });

        } catch (error: unknown) {
            logger.error(`Error en clickExitAction: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
            throw error;
        }
    }
}