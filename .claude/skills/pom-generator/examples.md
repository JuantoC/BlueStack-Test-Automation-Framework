# Ejemplos de Referencia — Clases POM del Repositorio

Este archivo contiene ejemplos reales del repositorio que funcionan como gold standard. Usá estos ejemplos para calibrar el estilo, nivel de detalle y patrones al generar nuevas clases.

---

## Índice

1. [Clase Maestro — MainVideoPage](#1-clase-maestro--mainvideopage)
2. [Subcomponente Modal — PublishModal](#2-subcomponente-modal--publishmodal)
3. [Patrones clave extraídos](#3-patrones-clave-extraídos)

---

## 1. Clase Maestro — MainVideoPage

Este es el patrón canónico de un Orquestador. Observá:
- Cómo importa y compone subcomponentes propios + compartidos.
- Cómo cada método orquestador usa `step()` + `attachment()` de Allure.
- Cómo delega toda lógica granular a subcomponentes.
- Cómo verifica banners después de acciones destructivas o de creación.
- Cómo expone `table` como `public readonly` para acceso desde tests.

```typescript
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { UploadVideoBtn } from "./UploadVideoBtn.js";
import { UploadVideoModal } from "./UploadVideoModal.js";
import { VideoTable } from "./VideoTable.js";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { VideoData } from "../../interfaces/data.js";
import { ActionType, VideoActions } from "./VideoActions.js";
import { FooterActions } from "../FooterActions.js";
import { CKEditorImageModal } from "../modals/CKEditorImageModal.js";
import { Banners } from "../modals/Banners.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object Maestro para la sección de Videos del CMS.
 * Actúa como Orquestador central que coordina las sub-secciones de videos.
 * Es el punto de entrada para cualquier flujo de pruebas que involucre la creación,
 * edición, publicación o interacción con videos en la tabla multimedia.
 *
 * @example
 * const page = new MainVideoPage(driver, { timeoutMs: 10000 });
 * await page.uploadNewVideo(videoData);
 */
export class MainVideoPage {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly uploadBtn: UploadVideoBtn
  private readonly uploadModal: UploadVideoModal
  public readonly table: VideoTable
  private readonly actions: VideoActions
  private readonly footer: FooterActions
  private readonly image: CKEditorImageModal;
  private readonly banner: Banners;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainVideoPage")

    this.uploadBtn = new UploadVideoBtn(this.driver, this.config);
    this.uploadModal = new UploadVideoModal(this.driver, this.config);
    this.table = new VideoTable(this.driver, this.config);
    this.actions = new VideoActions(this.driver, this.config);
    this.footer = new FooterActions(this.driver, this.config)
    this.image = new CKEditorImageModal(this.driver, this.config)
    this.banner = new Banners(this.driver, this.config);
  }

  /**
   * Orquesta el flujo completo de subida de un nuevo video.
   * Selecciona el tipo de video, rellena todos los campos del modal, dispara la subida
   * y espera a que el nuevo video aparezca en la primera posición de la tabla.
   * Para videos de tipo `NATIVO`, también verifica la barra de progreso de carga.
   *
   * @param videoData - Datos completos del video a subir, incluyendo tipo, título, URL o ruta de archivo.
   */
  async uploadNewVideo(videoData: VideoData): Promise<any> {
    await step(`Subiendo nuevo video con datos dinámicos`, async (stepContext) => {
      attachment(`${videoData.video_type} Data`, JSON.stringify(videoData, null, 2), "application/json");
      videoData.video_type && stepContext.parameter("Video Type", videoData.video_type)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Abriendo modal de subida para videos: ${videoData.video_type}`, { label: this.config.label })
        await this.uploadBtn.selectVideoType(videoData.video_type)

        logger.info(`Iniciando llenado dinámico de campos presentes en data`, { label: this.config.label });
        await this.uploadModal.fillAll(videoData);

        logger.info(`Llenado finalizado, comenzando subida...`, { label: this.config.label });
        await this.uploadModal.clickOnUploadBtn();

        const isError = await this.banner.checkBanners(false);
        if (isError) {
          return
        }

        if (videoData.video_type === 'NATIVO') {
          await this.uploadModal.checkProgressBar()
        }

        await this.table.waitForNewVideoAtIndex0(videoData.title);
        await this.table.skipInlineTitleEdit();

        logger.info(`Subida finalizada`, { label: this.config.label });

      } catch (error: unknown) {
        logger.error(`Fallo en la subida de nuevo video: ${videoData.video_type} ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }

  /**
   * Ejecuta el cambio de título inline de un video a partir de su contenedor ya localizado.
   * Delega la edición en `VideoTable.changeVideoTitle` y verifica el resultado con `Banners`.
   *
   * @param videoContainer - Contenedor WebElement del video a modificar.
   */
  async changeVideoTitle(videoContainer: WebElement): Promise<any> {
    await step(`Cambiando título del video`, async () => {
      try {
        logger.debug("Ejecutando el cambio de titulo.", { label: this.config.label })
        await this.table.changeVideoTitle(videoContainer);
        await this.banner.checkBanners(true);
        logger.info('Cambio de titulo del video ejecutado correctamente', { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al cambiar el titulo del video: ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  /**
   * Ejecuta una acción del menú desplegable sobre un video.
   * Delega la interacción con el menú en `VideoActions.clickOnAction`.
   *
   * @param videoContainer - Contenedor WebElement del video sobre el que se ejecuta la acción.
   * @param action - Tipo de acción a ejecutar (EDIT, DELETE, UNPUBLISH).
   */
  async clickOnActionVideo(videoContainer: WebElement, action: ActionType): Promise<any> {
    await step(`Clickeando en la acción: "${action}" sobre el video`, async (stepContext) => {
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug(`Ejecutando el click en el boton de ${action}`, { label: this.config.label })
        await this.actions.clickOnAction(videoContainer, action);
        await this.banner.checkBanners(false)
        logger.info(`Click en la accion: "${action}" completado.`, { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al clickear la accion: "${action}" en el video: ${getErrorMessage(error)}`, {
          label: this.config.label,
          action,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  /**
   * Selecciona uno o varios videos y los publica mediante la acción del footer.
   *
   * @param Videos - Array de contenedores WebElement de los videos a publicar.
   */
  async selectAndPublishFooter(Videos: WebElement[]): Promise<any> {
    await step("Seleccionar y publicar Videos", async (stepContext) => {
      stepContext.parameter("Cantidad", Videos.length.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug('Seleccionando el/los Videos enviados...', { label: this.config.label })
        for (const video of Videos) {
          await this.table.selectVideo(video);
        }
        logger.debug('Video/s seleccionados correctamente, procediendo a su publicacion...', { label: this.config.label })
        await this.footer.clickFooterAction('PUBLISH_ONLY')
        logger.info('Video/s publicados exitosamente', { label: this.config.label })

      } catch (error: unknown) {
        logger.error(`Error al seleccionar y publicar Videos: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Obtiene un array de contenedores WebElement de los primeros N videos de la tabla.
   *
   * @param NumberOfVideos - Cantidad de videos a recuperar desde la parte superior de la tabla.
   * @returns {Promise<WebElement[]>} Array con los contenedores DOM de los videos solicitados.
   */
  async getVideoContainers(NumberOfVideos: number): Promise<WebElement[]> {
    try {
      let videos = []
      for (let i = 0; i < NumberOfVideos; i++) {
        const video = await this.table.getVideoContainerByIndex(i);
        videos.push(video)
      }
      return videos
    } catch (error: unknown) {
      logger.error(`Error al obtener los ultimos ${NumberOfVideos} videos: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
```

---

## 2. Subcomponente Modal — PublishModal

Este es el patrón canónico de un subcomponente modal. Observá:
- Override de timeout en el constructor (`timeoutMs: 10000`).
- Locators como `private static readonly`.
- Métodos `private` de utilidad (`waitUntilIsReady`).
- Polling custom con `driver.wait()` para condiciones asíncronas.
- JSDoc indicando que es consumido internamente y no desde tests.

```typescript
import { By, Locator, WebDriver, WebElement } from "selenium-webdriver";
import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from "../../core/actions/waitFind.js";
import { waitEnabled } from "../../core/actions/waitEnabled.js";
import { waitVisible } from "../../core/actions/waitVisible.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Sub-componente modal que gestiona la confirmación de publicación de notas y videos en el CMS.
 * Espera a que el resumen generado por IA desaparezca antes de habilitar
 * el botón de confirmar, evitando clics prematuros durante la generación del contenido IA.
 * Consumido internamente por `FooterActions` y `EditorHeaderActions`; no debe invocarse desde tests.
 */
export class PublishModal {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;

  private static readonly PUBLISH_CONFIRM_BTN: Locator = By.css('div.button-primary__four button[data-testid="btn-calendar-confirm"]');
  private static readonly PUBLISH_CANCEL_BTN: Locator
  private static readonly CKEDITOR_LOAD_SUMMARY: Locator = By.css('div.loadSummary')

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig({ ...opts, timeoutMs: 10000 }, "PublishModal")
  }

  /**
   * Espera a que el resumen IA termine de generarse y hace click en confirmar publicación.
   */
  async clickOnPublishBtn(): Promise<void> {
    try {
      logger.debug('Intentando clickar en el boton de publicar...', { label: this.config.label })
      await this.waitUntilAISummaryGenerated()
      await clickSafe(this.driver, PublishModal.PUBLISH_CONFIRM_BTN, this.config)
      logger.debug('Clickado el boton de publicar', { label: this.config.label })
    } catch (error: unknown) {
      logger.error(`Error clickeando el boton de publicar: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) })
      throw error;
    }
  }

  /**
   * Hace click en el botón de cancelar del modal de publicación.
   */
  async clickOnCancelBtn(): Promise<void> {
    try {
      logger.debug('Intentando clickar en el boton de cancelar...', { label: this.config.label })
      const elementToClick = await this.waitUntilIsReady(PublishModal.PUBLISH_CANCEL_BTN)
      await clickSafe(this.driver, elementToClick, this.config)
      logger.debug('Clickado el boton de cancelar', { label: this.config.label })
    } catch (error: unknown) {
      logger.error(`Error clickeando el boton de cancelar: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) })
      throw error;
    }
  }

  /**
   * Aguarda hasta que el indicador de generación del resumen IA desaparezca del DOM.
   * Hace polling hasta que `div.loadSummary` ya no esté presente, con timeout de 30 segundos.
   */
  async waitUntilAISummaryGenerated(): Promise<any> {
    try {
      logger.debug('Esperando a que se genere el resumen por IA...', { label: this.config.label })
      await this.driver.wait(async () => {
        const summaryLoading = await this.driver.findElements(PublishModal.CKEDITOR_LOAD_SUMMARY)
        if (summaryLoading.length === 0) {
          logger.debug('Resumen por IA generado', { label: this.config.label })
          return true;
        }
        return false;
      }, 30000)
    } catch (error: unknown) {
      logger.error(`Error esperando a que se genere el resumen por IA: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) })
      throw error;
    }
  }

  private async waitUntilIsReady(locator: Locator): Promise<WebElement> {
    logger.debug(`Esperando a que el elemento ${JSON.stringify(locator)} este listo`, { label: this.config.label })
    const element = await waitFind(this.driver, locator, this.config)
    await waitEnabled(this.driver, element, this.config)
    await waitVisible(this.driver, element, this.config)
    return element
  }
}
```

---

## 3. Patrones clave extraídos

### Patrón: Flujo orquestado con step() de Allure
Usado en clases Maestro. Envuelve un flujo completo en `step()` para reporting.
```
step(descripción) → attachment(data) → parameters → try { delegación a subcomponentes → banner check → log } catch { log error → throw }
```

### Patrón: Método simple de subcomponente
Usado en subcomponentes. Una acción atómica.
```
try { log debug → acción con clickSafe/waitFind/etc → log info } catch { log error → throw }
```

### Patrón: Iteración sobre WebElements
Usado cuando se opera sobre múltiples elementos (ej: seleccionar varios videos).
```
for (const item of items) { await this.subcomp.accion(item); }
```

### Patrón: Verificación post-acción con Banners
Después de acciones que pueden fallar en el server:
```typescript
const isError = await this.banner.checkBanners(false); // false = no esperamos éxito obligatorio
if (isError) return;
```
Después de acciones que deben ser exitosas:
```typescript
await this.banner.checkBanners(true); // true = esperamos banner de éxito
```

### Patrón: Getters de contenedores para tests
Métodos que retornan WebElements para que los tests operen sobre ellos:
```typescript
async getContainerByIndex(index: number): Promise<WebElement> { ... }
async getContainerByTitle(title: string): Promise<WebElement> { ... }
```
