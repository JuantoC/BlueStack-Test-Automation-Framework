import { Builder, Capabilities } from 'selenium-webdriver';
import { Options as ChromeOptions, ServiceBuilder } from 'selenium-webdriver/chrome.js';
/**
 * Define las opciones específicas para Chrome.
 * @param options Opciones de configuración del driver.
 * @returns Un objeto ChromeOptions.
 */
function setChromeOptions(options) {
    const chromeOptions = new ChromeOptions();
    // Sin interfaz gráfica del navegador.
    if (options.isHeadless) {
        chromeOptions.addArguments('--headless=new');
    }
    // Estabilidad, limpieza y maximizado
    chromeOptions.addArguments('--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-default-apps', '--incognito', '--start-maximized', '--force-device-scale-factor=0.8', 
    // Recomendado para estabilidad en entornos CI/Docker
    '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', `--window-size=${options.windowSize.width},${options.windowSize.height}`);
    // Deshabilitar el gestor de contraseñas y pop-ups
    chromeOptions.setUserPreferences({
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false
    });
    return chromeOptions;
}
/**
 * Inicializa y configura la instancia de WebDriver.
 * @param options Opciones de configuración, incluyendo si debe ser Headless.
 * @returns Una promesa que resuelve con la instancia configurada de WebDriver.
 */
export async function initializeDriver(options) {
    console.log(`Inicializando WebDriver (Chrome, Headless: ${options.isHeadless})...`);
    const driverPath = './node_modules/chromedriver/lib/chromedriver/chromedriver';
    const serviceBuilder = new ServiceBuilder(driverPath);
    const chromeOptions = setChromeOptions(options);
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .withCapabilities(Capabilities.chrome())
        .setChromeService(serviceBuilder)
        .build();
    await driver.manage().setTimeouts({ implicit: 5000 });
    console.log('WebDriver inicializado.');
    return driver;
}
/**
 * Cierra el navegador y termina la sesión de WebDriver.
 * @param driver La instancia del WebDriver a cerrar.
 */
export async function quitDriver(driver) {
    console.log('Cerrando WebDriver...');
    if (driver) {
        await driver.quit();
        console.log('WebDriver cerrado exitosamente.');
    }
}
//# sourceMappingURL=DriverChrome-Config.js.map