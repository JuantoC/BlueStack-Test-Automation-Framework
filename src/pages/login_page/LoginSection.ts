import { By, Locator, WebDriver, WebElement } from 'selenium-webdriver';
import { stackLabel } from "../../core/utils/stackLabel.js";
import { writeSafe } from "../../core/actions/writeSafe.js";
import { RetryOptions, DefaultConfig } from "../../core/config/defaultConfig.js";
import { clickSafe } from "../../core/actions/clickSafe.js";
import logger from "../../core/utils/logger.js";
import { waitFind } from '../../core/actions/waitFind.js';
import { BusinessLogicError } from '../../core/errors/bussinesLogicError.js';

/**
 * Componente de campos de Login.
 * Maneja la interacción atómica con los inputs de credenciales y el botón de acceso.
 */
export class LoginSection {
  private driver: WebDriver;
  private config: RetryOptions;

  private readonly USERNAME_INPUT: Locator = By.id('username-field-log');
  private readonly PASSWORD_INPUT: Locator = By.id('password-field-log');
  private readonly LOGIN_BTN: Locator = By.css('button[data-testid="qa-login"]');
  private readonly ERROR_LABEL: Locator = By.css('span.field-error')
  private readonly VERSION_LABEL: Locator = By.css('div.security-footer-text')


  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "LoginSection") };
  }

  async fillUsername(username: string): Promise<WebElement> {

    logger.debug(`Ingresando nombre de usuario...`, { label: this.config.label });
    const element = await writeSafe(this.driver, this.USERNAME_INPUT, username, this.config);

    return element
  }

  async fillPassword(password: string): Promise<WebElement> {

    logger.debug(`Ingresando contraseña...`, { label: this.config.label });
    const element = await writeSafe(this.driver, this.PASSWORD_INPUT, password, this.config);

    return element
  }

  async clickLoginBtn(): Promise<void> {

    logger.debug(`Ejecutando click en botón de acceso`, { label: this.config.label });
    await clickSafe(this.driver, this.LOGIN_BTN, this.config);
  }

  /**
   * Método atómico para verificar si existe un error en pantalla.
   * Utiliza findElements para no lanzar excepciones si el elemento no existe.
   */
  async getLoginErrorText(): Promise<string | null> {
    logger.debug('Verificando si se generaron labels de error en el login...');
    // Pausa muy breve para dar tiempo al renderizado del DOM (ajustar según tu app)
    await this.driver.sleep(500);

    const errors = await this.driver.findElements(this.ERROR_LABEL);
    if (errors.length > 0) {
      const errorMsg = await errors[0].getText();
      logger.debug(`Error detectado: ${errorMsg}`);
      return errorMsg;
    }

    return null; // Si no hay error, retorna null
  }

  /**
   * Intención 1: Login Estricto (Falla rápido si hay error)
   */
  async passLogin(username: string, password: string): Promise<void> {

    // 1. Llenamos campos y enviamos
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginBtn();

    // 2. Revisamos si hay error en pantalla
    const errorMessage = await this.getLoginErrorText();

    // 3. Match sistema de resiliencia
    if (errorMessage) {
      // retry() lanzará el error en el intento 1.
      throw new BusinessLogicError(`El login falló intencionalmente por reglas de negocio. UI Error: ${errorMessage}`);
    }

    logger.debug(`Login exitoso comprobado para: ${username}`, { label: this.config.label });
  }

  /**
   * Intención 2: Intento de Login (Retorna el estado, no lanza error - Para flujos negativos/retries lógicos)
   */
  async attemptLogin(username: string, password: string): Promise<{ success: boolean, errorMessage: string | null }> {

    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginBtn();

    const errorMessage = await this.getLoginErrorText();

    return {
      success: errorMessage === null,
      errorMessage: errorMessage
    };
  }

  async getVersionLabel(opts: RetryOptions): Promise<string> {

    logger.debug('Ejecutando busqueda del contenedor del label con la version del CMS...')
    const labelField = await waitFind(this.driver, this.VERSION_LABEL, this.config)

    const version = labelField.getText()
    return version;
  }
}