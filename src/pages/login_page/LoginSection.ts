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

  private static readonly USERNAME_INPUT: Locator = By.id('username-field-log');
  private static readonly PASSWORD_INPUT: Locator = By.id('password-field-log');
  private static readonly LOGIN_BTN: Locator = By.css('button[data-testid="qa-login"]');
  private static readonly ERROR_LABEL: Locator = By.css('span.field-error')
  private static readonly VERSION_LABEL: Locator = By.css('div.security-footer-text')


  constructor(driver: WebDriver, opts: RetryOptions = {}) {
    this.driver = driver;
    this.config = { ...DefaultConfig, ...opts, label: stackLabel(opts.label, "LoginSection") };
  }

  /**
   * Escribe el nombre de usuario en el campo de login delegando en `writeSafe`.
   *
   * @param username - Nombre de usuario a ingresar en el campo, sin sanitizar.
   * @returns {Promise<WebElement>} El elemento input tras confirmar la escritura.
   */
  async fillUsername(username: string): Promise<WebElement> {
    logger.debug(`Ingresando nombre de usuario...`, { label: this.config.label });
    const element = await writeSafe(this.driver, LoginSection.USERNAME_INPUT, username, this.config);
    return element
  }

  /**
   * Escribe la contraseña en el campo de login delegando en `writeSafe`.
   *
   * @param password - Contraseña a ingresar en el campo, sin sanitizar.
   * @returns {Promise<WebElement>} El elemento input tras confirmar la escritura.
   */
  async fillPassword(password: string): Promise<WebElement> {
    logger.debug(`Ingresando contraseña...`, { label: this.config.label });
    const element = await writeSafe(this.driver, LoginSection.PASSWORD_INPUT, password, this.config);
    return element
  }

  /**
   * Hace click en el botón de acceso del formulario de login delegando en `clickSafe`.
   */
  async clickLoginBtn(): Promise<void> {
    logger.debug(`Ejecutando click en botón de acceso`, { label: this.config.label });
    await clickSafe(this.driver, LoginSection.LOGIN_BTN, this.config);
  }

  /**
   * Método atómico para verificar si existe un error en pantalla.
   * Utiliza findElements para no lanzar excepciones si el elemento no existe.
   *
   * @returns {Promise<string | null>} Texto del mensaje de error visible, o `null` si no hay error.
   */
  async getLoginErrorText(): Promise<string | null> {
    logger.debug('Verificando si se generaron labels de error en el login...', { label: this.config.label });
    const errors = await this.driver.findElements(LoginSection.ERROR_LABEL);
    if (errors.length > 0) {
      const errorMsg = await errors[0].getText();
      logger.debug(`Error detectado: ${errorMsg}`, { label: this.config.label });
      return errorMsg;
    }

    return null; // Si no hay error, retorna null
  }

  /**
   * Intención 1 — Login Estricto: ejecuta el flujo completo de credenciales y falla rápido si hay error.
   * Rellena usuario y contraseña, hace click en el botón de acceso, y verifica inmediatamente si la UI
   * muestra un mensaje de error. Si existe, lanza un `BusinessLogicError` con el texto del error visible.
   *
   * @param username - Nombre de usuario a ingresar.
   * @param password - Contraseña a ingresar.
   */
  async passLogin(username: string, password: string): Promise<void> {

    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginBtn();

    const errorMessage = await this.getLoginErrorText();

    if (errorMessage) {
      throw new BusinessLogicError(`El login falló por reglas de negocio. UI Error: ${errorMessage}`);
    }

    logger.info(`Login exitoso comprobado para: ${username}`, { label: this.config.label });
  }

  /**
   * Intención 2 — Intento de Login: ejecuta el flujo de credenciales y retorna el estado sin lanzar error.
   * Diseñado para flujos negativos o de validación donde el test necesita inspeccionar el resultado
   * en lugar de fallar automáticamente. Útil en tests que verifican múltiples intentos inválidos.
   *
   * @param username - Nombre de usuario a ingresar.
   * @param password - Contraseña a ingresar.
   * @returns {Promise<{ success: boolean, errorMessage: string | null }>} Objeto con el estado del intento y el mensaje de error de la UI si existe.
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

  /**
   * Obtiene el texto del label que muestra la versión actual del CMS en la pantalla de login.
   * Utilizado por `MainLoginPage` para registrarlo como parámetro Allure antes de autenticar.
   *
   * @param opts - Opciones de reintento y trazabilidad. Propagadas a las llamadas internas.
   * @returns {Promise<string>} Texto con la versión del CMS tal como aparece en pantalla.
   */
  async getVersionLabel(opts: RetryOptions): Promise<string> {

    logger.debug('Ejecutando busqueda del contenedor del label con la version del CMS...', { label: this.config.label })
    const labelField = await waitFind(this.driver, LoginSection.VERSION_LABEL, this.config)

    const version = labelField.getText()
    return version;
  }
}