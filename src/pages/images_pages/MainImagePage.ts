import { resolveRetryConfig, RetryOptions } from "../../core/config/defaultConfig.js";
import { WebDriver, WebElement } from "selenium-webdriver";
import { ImageData } from "../../interfaces/data.js";
import { UploadImageBtn } from "./UploadImageBtn.js";
import { ImageTable } from "./ImageTable.js";
import { attachment, step } from "allure-js-commons";
import logger from "../../core/utils/logger.js";
import { ImageActionType, ImageActions } from "./ImageActions.js";
import { FooterActions } from "../FooterActions.js";
import { Banners } from "../modals/Banners.js";
import { getErrorMessage } from "../../core/utils/errorUtils.js";

/**
 * Page Object Maestro para la sección de Imágenes del CMS.
 * Actúa como Orquestador central que coordina las sub-secciones de imágenes.
 * Es el punto de entrada para cualquier flujo de pruebas que involucre la creación,
 * edición, publicación o interacción con imágenes en la tabla multimedia.
 *
 * @example
 * const page = new MainImagePage(driver, { timeoutMs: 10000 });
 * await page.uploadNewImage(imageData);
 */
export class MainImagePage {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly uploadBtn: UploadImageBtn
  private readonly table: ImageTable
  private readonly actions: ImageActions
  private readonly footer: FooterActions
  private readonly banner: Banners;

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = resolveRetryConfig(opts, "MainImagePage")

    this.uploadBtn = new UploadImageBtn(this.driver, this.config);
    this.table = new ImageTable(this.driver, this.config);
    this.actions = new ImageActions(this.driver, this.config);
    this.footer = new FooterActions(this.driver, this.config)
    this.banner = new Banners(this.driver, this.config);
  }

  /**
   * Orquesta el flujo completo de subida de una nueva imagen vía input de archivo directo.
   * Envía el archivo al input correspondiente, espera que la imagen aparezca en index 0 de la tabla,
   * cierra la edición inline automática y deselecciona la imagen recién subida.
   *
   * @param imageData - Datos de la imagen a subir. Debe incluir `file_path` (ruta absoluta) y `title`.
   * @param btn - Origen del botón de subida: `'Sidebar'` (default) o `'Table'`.
   * @returns {Promise<void>}
   */
  async uploadNewImage(imageData: ImageData, btn = 'Sidebar'): Promise<void> {
    await step(`Subiendo nueva imagen con datos dinámicos`, async (stepContext) => {
      attachment(`${imageData.image_format} Data`, JSON.stringify(imageData, null, 2), "application/json");
      imageData.image_format && stepContext.parameter("Image Type", imageData.image_format)
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug("Iniciando el flujo de subida de imagen...", { label: this.config.label })
        await this.uploadBtn.sendFileToUploadInput(imageData.file_path, btn);

        await this.table.waitForNewImageAtIndex0(imageData.title);

        await this.table.skipInlineTitleEdit();

        await this.table.deselectImage(await this.table.getImageContainerByIndex(0))

        logger.info(`Subida finalizada`, { label: this.config.label });

      } catch (error: unknown) {
        logger.error(`Fallo en la subida de nueva imagen: ${imageData.image_format} ${getErrorMessage(error)}`, {
          label: this.config.label,
          error: getErrorMessage(error)
        });
        throw error;
      }
    });
  }


  /**
   * Modifica el título de una imagen de forma inline directamente desde la tabla.
   * Localiza el contenedor de la imagen por su título y delega en `ImageTable.changeImageTitle`
   * para realizar la edición inline.
   *
   * @param TitleID - Fragmento o título completo de la imagen a modificar, usado para localizar su fila en la tabla.
   * @returns {Promise<void>}
   */
  async changeImageTitle(TitleID: string): Promise<void> {
    await step(`Cambiando titulo de la imagen ${TitleID}`, async () => {

      try {
        logger.debug("Ejecutando busqueda del contenedor para el titulo de la imagen...", { label: this.config.label })
        const imageContainer = await this.table.getImageContainerByTitle(TitleID);

        logger.debug("Ejecutando el cambio de titulo.", { label: this.config.label })
        await this.table.changeImageTitle(imageContainer);

        await this.banner.checkBanners(true);

        logger.info('Cambio de titulo de la imagen ejecutado correctamente', { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al cambiar el titulo de la imagen: ${getErrorMessage(error)}`, {
          label: this.config.label,
          title: TitleID,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  /**
   * Localiza una imagen por su título en la tabla y ejecuta una acción del menú desplegable sobre ella.
   * Delega la búsqueda del contenedor en `ImageTable.getImageContainerByTitle` y
   * la interacción con el menú en `ImageActions.clickOnAction`.
   *
   * @param ImageTitle - Título de la imagen objetivo, usado para identificar su fila en la tabla.
   * @param action - Tipo de acción a ejecutar sobre la imagen (EDIT, DELETE, UNPUBLISH).
   * @returns {Promise<void>}
   */
  async clickOnActionImage(ImageTitle: string, action: ImageActionType): Promise<void> {
    await step(`Clickeando en la accion: "${action}" de la imagen: "${ImageTitle}"`, async (stepContext) => {
      stepContext.parameter("Titulo de la imagen", ImageTitle);
      stepContext.parameter("Acción", action);
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        const imageContainer = await this.table.getImageContainerByTitle(ImageTitle);
        logger.debug(`Ejecutando el click en el boton de ${action}`, { label: this.config.label })
        await this.actions.clickOnAction(imageContainer, action);

        await this.banner.checkBanners(false)
        logger.info(`Click en la accion: "${action}" completado.`, { label: this.config.label })
      } catch (error: unknown) {
        logger.error(`Error al clickear la accion: "${action}" en la imagen: ${getErrorMessage(error)}`, {
          label: this.config.label,
          title: ImageTitle,
          action,
          error: getErrorMessage(error)
        })
        throw error;
      }
    });
  }

  /**
   * Selecciona una o varias imágenes en la tabla y las publica mediante la acción del footer.
   * Itera sobre cada contenedor de imagen recibido y delega la selección en `ImageTable.selectImage`.
   * Finaliza con una acción de publicación mediante `FooterActions.clickFooterAction`.
   *
   * @param images - Array de contenedores WebElement de las imágenes que se desean seleccionar y publicar.
   * @returns {Promise<void>}
   */
  async selectAndPublishFooter(images: WebElement[]): Promise<void> {
    await step("Seleccionar y publicar imágenes", async (stepContext) => {
      stepContext.parameter("Cantidad", images.length.toString());
      stepContext.parameter("Timeout", `${this.config.timeoutMs}ms`);

      try {
        logger.debug('Seleccionando la/las imágenes enviadas...', { label: this.config.label })
        for (const image of images) {
          await this.table.selectImage(image);
        }
        logger.debug('Imagen/es seleccionadas correctamente, procediendo a su publicacion...', { label: this.config.label })
        await this.footer.clickFooterAction('PUBLISH_ONLY')
        logger.info('Imagen/es publicadas exitosamente', { label: this.config.label })

      } catch (error: unknown) {
        logger.error(`Error al seleccionar y publicar imágenes: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
        throw error;
      }
    });
  }

  /**
   * Obtiene un array de contenedores WebElement de las primeras N imágenes de la tabla.
   * Itera por índice comenzando desde 0 y delega cada búsqueda en `ImageTable.getImageContainerByIndex`.
   *
   * @param NumberOfImages - Cantidad de imágenes a recuperar desde la parte superior de la tabla.
   * @returns {Promise<WebElement[]>} Array con los contenedores DOM de las imágenes solicitadas.
   */
  async getImageContainers(NumberOfImages: number): Promise<WebElement[]> {
    try {
      let images = []
      for (let i = 0; i < NumberOfImages; i++) {
        const image = await this.table.getImageContainerByIndex(i);
        images.push(image)
      }
      return images
    } catch (error: unknown) {
      logger.error(`Error al obtener las ultimas ${NumberOfImages} imágenes: ${getErrorMessage(error)}`, { label: this.config.label, error: getErrorMessage(error) });
      throw error;
    }
  }
}
