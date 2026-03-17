import { By, Locator, WebDriver } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import { step } from "allure-js-commons";
import logger from "../core/utils/logger.js";
import { clickSafe } from "../core/actions/clickSafe.js";
import { retry } from "../core/wrappers/retry.js";

export enum SidebarOption {
  COMMENTS = 'COMMENTS',
  PLANNING = 'PLANNING',
  NEWS = 'NEWS',
  TAGS = 'TAGS',
  IMAGES = 'IMAGES',
  VIDEOS = 'VIDEOS'
}

export class SidebarAndHeader {
  private driver: WebDriver;
  private config: RetryOptions;

  private static readonly MULTIMEDIA_FILE_BTN: Locator = By.css('a[title="Multimedia"]');

  private static readonly SIDEBAR_MAP: Record<SidebarOption, Locator> = {
    [SidebarOption.COMMENTS]: By.css('a[title="Comentarios"]'),
    [SidebarOption.PLANNING]: By.css('a[title="Planning"]'),
    [SidebarOption.NEWS]: By.css('a[title="Noticias"]'),
    [SidebarOption.TAGS]: By.css('a[title="Tags"]'),
    [SidebarOption.IMAGES]: By.css('a[title="Imagenes"]'),
    [SidebarOption.VIDEOS]: By.css('a[title="Videos"]')
  };

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "SidebarAndHeader") }
  }

  async goToComponent(component: SidebarOption): Promise<any> {
    await step(`Moverse hacia el componente`, async (stepContext) => {
      stepContext.parameter('Component', component)
      stepContext.parameter('Timeout', `${this.config.timeoutMs}`)

      const locator = SidebarAndHeader.SIDEBAR_MAP[component];
      try {
        logger.debug(`Ejecutando click en ${component}...`, { label: this.config.label })
        if (component === SidebarOption.IMAGES || component === SidebarOption.VIDEOS) {
          await this.clickOnMultimediaFileBtn(component)
          return
        }
        await clickSafe(this.driver, locator, this.config)
      } catch (error: any) {
        logger.error(`Fallo al navegar al componente ${component}: ${error.message}`, {
          label: this.config.label,
          error: error.message
        });
        throw error;
      }
    });
  }

  async clickOnMultimediaFileBtn(action: SidebarOption.IMAGES | SidebarOption.VIDEOS): Promise<void> {
    const newConfig = { ...this.config, supressRetry: true }
    return retry(async () => {
      try {
        logger.debug(`Ejecutando click en el botón de multimedia para ir a ${action}...`, { label: newConfig.label })
        await clickSafe(this.driver, SidebarAndHeader.MULTIMEDIA_FILE_BTN, newConfig)
        await clickSafe(this.driver, SidebarAndHeader.SIDEBAR_MAP[action], newConfig)
      } catch (error: any) {
        throw error;
      }
    }, this.config)
  }
}