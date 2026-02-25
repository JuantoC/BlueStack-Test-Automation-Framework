import { By, Locator, WebDriver, WebElement } from "selenium-webdriver"
import { RetryOptions } from "../../core/config/default.js";
import { waitFind } from "../../core/utils/waitFind.js";
import logger from "../../core/utils/logger.js";
import { clickSafe } from "../../core/actions/clickSafe.js";

export class PostContainer {
  private readonly driver: WebDriver;
  private readonly postContainerLocator: Locator = By.css('div[id="container-table-body"]');
  private readonly postTitleLocator: Locator = By.css('div[data-testid="div-edit-title"]');
  private readonly postEditBtnLocator: Locator = By.css('button[data-testid="btn-edit-post"]');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  getPostContainerByID(index: number): Locator {
    const baseValue = (this.postContainerLocator as any).value;
    const locString = `${baseValue} div[id="post-management-${index}"]`;
    return By.css(locString);
  }

  async getPostByTitle(title: string, config: RetryOptions): Promise<Locator> {
    try {
      for (let i = 0; i < 10; i++) {
        const loc = this.getPostContainerByID(i);
        const postContainer = await waitFind(this.driver, loc, config);

        if (postContainer) {
          const titleElement = await postContainer.findElement(this.postTitleLocator);
          const currentTitle = await titleElement.getText();
          const expectedTitle = `${title} | Creado por BlueStack_Test_Automation Framework`;

          if (currentTitle === expectedTitle) {
            logger.debug(`Nota encontrada en el índice ${i}.`, { label: config.label });
            return loc;
          }
        }
      }
      throw new Error(`No se encontró la nota con el título "${title}" en los primeros 10 índices.`);
    } catch (error) {
      throw new Error(`Error al buscar la nota: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async changePostTitleStandard(postContainerLoc: Locator, config: RetryOptions): Promise<void> {
    try {
      const titleElement = await clickSafe(this.driver, postContainerLoc, config);
      const currentTitle = await titleElement.getText();

      const newTitle = currentTitle.replace(" | Creado por BlueStack_Test_Automation Framework", " | Creado y modificado por BTAF");
    } catch (error) {
      throw new Error(`Fallo al cambiar el título de la nota: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async clickEditorButton(postContainerLoc: Locator, config: RetryOptions): Promise < void> {
      try {
        // 1. Extraemos el string del selector del contenedor que recibimos
        const containerValue = (postContainerLoc as any).value;
        // 2. Extraemos el string del selector del botón de editar
        const editBtnValue = (this.postEditBtnLocator as any).value;

        // 3. Concatenamos para crear un locator único: "Contenedor > Botón"
        const finalLocator = By.css(`${containerValue} ${editBtnValue}`);

        // 4. Ejecutamos el click seguro
        await clickSafe(this.driver, finalLocator, config);

        logger.debug(`Botón editar clickeado con locator: ${finalLocator}`, { label: config.label });
      } catch(error) {
        throw new Error(`Fallo al clickear botón editar: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }