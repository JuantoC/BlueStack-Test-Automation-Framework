import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';

export interface DriverOptions {
    isHeadless: boolean;
}

/**
 * Define las opciones específicas para Chrome.
 * @param options Opciones de configuración del driver (isHeadless....).
 * @returns Un objeto ChromeOptions.
 */
export function setChromeOptions(options: DriverOptions): ChromeOptions {
    const chromeOptions = new ChromeOptions();

    if (options.isHeadless) {
        chromeOptions.addArguments('--headless=new');
    }

    // Estabilidad, limpieza y maximizado
    chromeOptions.addArguments(
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-default-apps',
        '--incognito',
        '--start-maximized',
        '--force-device-scale-factor=0.8',

        // Estabilidad en entornos Docker
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        'window-size= 1400 , 900'
    );

    // Deshabilita el gestor de contraseñas y pop-ups
    chromeOptions.setUserPreferences({
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false
    });

    return chromeOptions;
}
