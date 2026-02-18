import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Preferences, Type, Level } from 'selenium-webdriver/lib/logging.js';

export interface DriverOptions {
    isHeadless: boolean;
}

/**
 * Define las opciones específicas para Chrome.
 * @param options Opciones de configuración del driver.
 * @returns Un objeto ChromeOptions configurado para silencio total.
 */
export function setChromeOptions(options: DriverOptions): ChromeOptions {
    const chromeOptions = new ChromeOptions();

    if (options.isHeadless) {
        chromeOptions.addArguments('--headless=new');
    }

    chromeOptions.addArguments(
        // --- 1. Argumentos de Silenciado (ANTI-RUIDO) ---
        '--log-level=3',           // Solo errores fatales
        '--silent',                // Minimizar output
        '--disable-logging',       // Deshabilitar logging interno
        '--disable-in-process-stack-traces', // Evitar stack traces internos
        '--disable-crash-reporter',

        // Esta línea mata los errores de: PHONE_REGISTRATION_ERROR y DEPRECATED_ENDPOINT
        // (Desactiva la búsqueda de dispositivos Chromecast y optimizaciones de red)
        '--disable-features=OptimizationHints,MediaRouter,NetworkService',

        // --- 2. Estabilidad y Configuración Original ---
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-default-apps',
        '--incognito',
        '--start-maximized',
        '--force-device-scale-factor=0.8',
        '--no-sandbox',
        '--disable-gpu',           // Ayuda con errores de Compositor/GL
        '--disable-dev-shm-usage',
        'window-size=1400,900'
    );

    // --- 3. Preferencias para eliminar popups ---
    chromeOptions.setUserPreferences({
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false,
        'intl.accept_languages': 'en-US,en',
        'profile.default_content_setting_values.notifications': 2 // Bloquear notificaciones
    });

    // --- 4. Excluir switches ruidosos ---
    // Esto evita que Chrome habilite el logging automáticamente
    chromeOptions.excludeSwitches('enable-logging', 'enable-automation');

    // --- 5. Apagar logs de Selenium ---
    // Esto evita que Selenium capture y te muestre logs de consola del navegador
    const logPrefs = new Preferences();
    logPrefs.setLevel(Type.BROWSER, Level.ALL); 
    logPrefs.setLevel(Type.DRIVER, Level.OFF);
    logPrefs.setLevel(Type.PERFORMANCE, Level.OFF);
    chromeOptions.setLoggingPrefs(logPrefs);

    return chromeOptions;
}