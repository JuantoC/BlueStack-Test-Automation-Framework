import { Locator, WebDriver } from "selenium-webdriver";
import { stackLabel } from "../../../core/utils/stackLabel";
import { RetryOptions } from "../../../core/wrappers/retry";
import { clickSafe } from "../../../core/actions/clickSafe";

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

  // ========== MÉTODOS ==========
  async clickSave(driver: WebDriver, timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSave') };
    await clickSafe(driver, this.saveBtn, timeout, fullOpts);
  }

  async clickSaveDropdown(driver: WebDriver, action: 'save and exit' | 'exit', timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSaveAndExit') };
    await clickSafe(driver, this.dropdownSave, timeout, fullOpts);
    switch (action) {
      case 'save and exit':
        await clickSafe(driver, this.saveAndExitBtn)
        break;
      case 'exit':
        await clickSafe(driver, this.exitBtn);
        break;
      default:
        throw new Error(`${action} no es una opcion correcta. "save and exit" o "exit" parametros permitidos `)
    }
    await clickSafe(driver, this.saveAndExitBtn, timeout, fullOpts);
  }
  
  async clickPublish(driver: WebDriver, timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickPublish') };
    await clickSafe(driver, this.publishBtn, timeout, fullOpts);
    await clickSafe(driver, this.publishBtnModal, timeout, fullOpts);
  }
  
  async clickBack(driver: WebDriver, action: 'save' | 'exit', timeout: number, opts: RetryOptions = {}): Promise<void> {
    const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickBack') };
    await clickSafe(driver, this.backBtn, timeout, fullOpts);
    switch (action) {
      case 'save':
        await clickSafe(driver, this.saveAndExitBtnModal)
        break;
        case 'exit':
          await clickSafe(driver, this.exitAnywayBtnModal);
          break;
          default:
            throw new Error(`${action} no es una opcion correcta. "save" o "exit" parametros permitidos `)
          }
        }
        async clickPublishDropdown(driver: WebDriver, action: 'publish and exit' | 'schedule', timeout: number, opts: RetryOptions = {}): Promise<void> {
          const fullOpts = { ...opts, label: stackLabel(opts.label, 'clickSaveAndExit') };
          await clickSafe(driver, this.dropdownPublish, timeout, fullOpts);
          switch (action) {
            case 'publish and exit':
              await clickSafe(driver, this.publishAndExitBtn)
              break;
            case 'schedule':
              await clickSafe(driver, this.scheduleBtn);
              break;
            default:
              throw new Error(`${action} no es una opcion correcta. "save and exit" o "exit" parametros permitidos `)
          }
          await clickSafe(driver, this.saveAndExitBtn, timeout, fullOpts);
        }
}