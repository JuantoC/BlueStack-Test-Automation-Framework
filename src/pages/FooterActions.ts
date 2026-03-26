import { By, WebDriver, WebElement } from "selenium-webdriver";
import { DefaultConfig, RetryOptions } from "../core/config/defaultConfig.js";
import { stackLabel } from "../core/utils/stackLabel.js";
import logger from "../core/utils/logger.js";
import { waitFind } from "../core/actions/waitFind.js";
import { clickSafe } from "../core/actions/clickSafe.js";
import { PublishModal } from "./modals/PublishModal.js";
import { Banners } from "./modals/Banners.js";

export type FooterActionType = keyof typeof FooterActions.FOOTER_ACTIONS;

export class FooterActions {
  private readonly driver: WebDriver;
  private readonly config: RetryOptions;
  private readonly publishModal: PublishModal;
  private readonly banner: Banners;

  private static readonly FOOTER_PUBLISH_BTN = By.css('div.cmsmedios-table-content button[data-testid="dropdown-action"]');
  private static readonly FOOTER_DROPDOWN_BTN = By.css('div.cmsmedios-table-content button[data-testid="dropdown-actions"]');
  private static readonly FOOTER_DROPDOWN_SCHEDULE = By.xpath("//div[@data-testid='dropdown-item']//mat-icon[contains(text(), 'access_alarm')]");
  private static readonly SCHEDULE_LABEL = 'access_alarm'

  // ========== LOCATORS ( Readonly) ==========
  public static readonly FOOTER_ACTIONS = {
    PUBLISH_ONLY: FooterActions.FOOTER_PUBLISH_BTN,
    SCHEDULE: FooterActions.FOOTER_DROPDOWN_BTN
  }

  constructor(driver: WebDriver, opts: RetryOptions) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "FooterActions") }

    this.publishModal = new PublishModal(this.driver, this.config)
    this.banner = new Banners(this.driver, { ...this.config, timeoutMs: 10000 })
  }

  async clickFooterAction(action: FooterActionType): Promise<void> {
    const isEnabled = await this.isPublishBtnEnabled()
    if (!isEnabled) {
      logger.error('Acciones del footer se encuentran deshabilitadas para interactuar con ellas...', { label: this.config.label })
      throw new Error(`Botones del footer deshabilitados: ${action}`);
    }

    const initialLocator = FooterActions.FOOTER_ACTIONS[action];
    if (!initialLocator) {
      logger.error(`La acción del footer no se encuentra mapeada en la clase: ${action}`, { label: this.config.label })
      throw new Error(`Acción del footer no mapeada en el componente: ${action}`);
    }

    try {
      logger.debug('Iniciando secuencia de acciones en el footer...', { label: this.config.label });
      await clickSafe(this.driver, initialLocator, { ...this.config, initialDelayMs: 10000 });

      switch (action) {
        case 'PUBLISH_ONLY':
          await this.publishModal.clickOnPublishBtn();
          await this.banner.checkBanners(true);
          break;
        case 'SCHEDULE':
          await clickSafe(this.driver, FooterActions.FOOTER_DROPDOWN_SCHEDULE, this.config);
          await this.publishModal.clickOnPublishBtn();
          await this.banner.checkBanners(true);
          break

      }
    } catch (error: any) {
      logger.error(`Error realizando accion en el footer: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }

  async isPublishBtnEnabled(): Promise<boolean> {
    try {
      logger.debug('Revisisando que el boton de publicar en el footer se encuentre habilitado...', { label: this.config.label })
      const publishBtn = await waitFind(this.driver, FooterActions.FOOTER_PUBLISH_BTN, this.config);
      const isEnabled = await publishBtn.getAttribute('disabled');
      return isEnabled === null;
    } catch (error: any) {
      logger.error(`Error revisando el btn de publicar: ${error.message}`, { label: this.config.label, error: error.message })
      throw error;
    }
  }
}