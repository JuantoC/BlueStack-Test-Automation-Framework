import { Locator, WebDriver, By } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel.js";
import { RetryOptions } from "../../../core/wrappers/retry.js";
import { clickSafe } from "../../../core/actions/clickSafe.js";

/**
 * Clase para acciones del header
 */
export class NoteHeaderActions {
  // ========== LOCATORS ==========
  public saveBtn: Locator = By.css('button[data-testid="dropdown-actions"]');
  public dropdownSave: Locator = By.id('dropdown-save');
  public saveAndExitBtn: Locator = By.id("option-dropdown-0");
  public exitBtn: Locator = By.id("option-dropdown-1");
  public dropdownPublish: Locator = By.id('dropdown-publish');
  public publishBtn: Locator = By.css('button[data-testid="dropdown-action"]');
  public publishAndExitBtn: Locator = By.id("option-dropdown-0")
  public scheduleBtn: Locator = By.id("option-dropdown-1")
  public backBtn: Locator = By.css('a[data-testid="btn-exit-note"]');

  // Modales
  public exitAnywayBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="btn-cancel"]');
  public saveAndExitBtnModal: Locator = By.css('button[data-testid="btn-calendar-confirm"]');
  public publishBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="post-note-confirm"] button[data-testid="btn-calendar-confirm"]');
  public cancelBtnModal: Locator = By.css('app-cmsmedios-button[data-testid="post-note-cancel"] button[data-testid="btn-calendar-confirm"]')
  public driver: WebDriver

  constructor(driver: WebDriver){
    this.driver = driver
  }
  // ========== MÉTODOS ==========
  async clickSave(timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSave') };
    await clickSafe(this.driver, this.saveBtn, timeout, fullOpts);
  }

  async clickSaveDropdown(action: 'save and exit' | 'exit', timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSaveAndExit') };
    await clickSafe(this.driver, this.dropdownSave, timeout, fullOpts);
    switch (action) {
      case 'save and exit':
        await clickSafe(this.driver, this.saveAndExitBtn)
        break;
      case 'exit':
        await clickSafe(this.driver, this.exitBtn);
        break;
      default:
        throw new Error(`${action} no es una opcion correcta. "save and exit" o "exit" parametros permitidos `)
    }
  }
  
  async clickPublish(timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickPublish') };
    await clickSafe(this.driver, this.publishBtn, timeout, fullOpts);
    await clickSafe(this.driver, this.publishBtnModal, timeout, fullOpts);
  }
  
  async clickBack(action: 'save' | 'exit', timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickBack') };
    await clickSafe(this.driver, this.backBtn, timeout, fullOpts);
    switch (action
      
    ) {
      case 'save':
        await clickSafe(this.driver, this.saveAndExitBtnModal)
        break;
        case 'exit':
          await clickSafe(this.driver, this.exitAnywayBtnModal);
          break;
          default:
            throw new Error(`${action} no es una opcion correcta. "save" o "exit" parametros permitidos `)
          }
        }
        async clickPublishDropdown(action: 'publish and exit' | 'schedule', timeout: number, opts: RetryOptions = {}): Promise<void> {
          const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSaveAndExit') };
          await clickSafe(this.driver, this.dropdownPublish, timeout, fullOpts);
          switch (action) {
            case 'publish and exit':
              await clickSafe(this.driver, this.publishAndExitBtn)
              break;
            case 'schedule':
              await clickSafe(this.driver, this.scheduleBtn);
              break;
            default:
              throw new Error(`${action} no es una opcion correcta. "save and exit" o "exit" parametros permitidos `)
          }
          await clickSafe(this.driver, this.saveAndExitBtn, timeout, fullOpts);
        }
}