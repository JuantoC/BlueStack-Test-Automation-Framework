import { WebDriver } from "selenium-webdriver";
import { RetryOptions } from "../../../interfaces/config.js";
import { EditorHeaderActions, VideoExitAction } from "./EditorHeaderActions.js";
import { resolveRetryConfig } from "../../../core/config/defaultConfig.js";
import { step } from "allure-js-commons";
import logger from "../../../core/utils/logger.js";
import { VideoType } from "../UploadVideoBtn.js";
import { getErrorMessage } from "../../../core/utils/errorUtils.js";

export class MainEditorPage {
    private driver: WebDriver;
    private config: RetryOptions

    private readonly videoType: VideoType;
    public readonly header: EditorHeaderActions;

    constructor(driver: WebDriver, videoType: VideoType, opts: RetryOptions) {
        this.driver = driver;
        this.config = resolveRetryConfig(opts, "MainEditorPage");
        this.videoType = videoType || 'YOUTUBE';
        this.header = new EditorHeaderActions(this.driver, this.config);
    }

    /**
 * Ejecuta la acción de cierre del editor (guardar, publicar o salir) delegando en `EditorHeaderActions`.
 * Para acciones de publicación o guardado simple (`PUBLISH_ONLY`, `SAVE_ONLY`), también
 * verifica el banner de éxito obligatorio antes de resolver.
 *
 * @param exitAction - Tipo de acción de cierre del editor (SAVE_ONLY, PUBLISH_AND_EXIT, etc.).
 */
    async closeNoteEditor(exitAction: VideoExitAction): Promise<void> {
        await step(`Cerrar editor de nota con acción ${exitAction}`, async () => {
            try {
                logger.info(`Ejecutando salida del editor: ${exitAction}`, { label: this.config.label });
                await this.header.clickExitAction(exitAction);

                if (exitAction === "PUBLISH_ONLY" || exitAction === "SAVE_ONLY") {
                    await global.activeToastMonitor?.waitForSuccess(this.config.timeoutMs);
                }
                logger.info(`Editor ejecuto accion del header correctamente.`, { label: this.config.label });

            } catch (error: unknown) {
                logger.error(`Error en flujo de cierre (${exitAction}): ${getErrorMessage(error)}`, {
                    label: this.config.label,
                    exitAction: exitAction,
                    error: getErrorMessage(error)
                });
                throw error;
            }
        });
    }
}