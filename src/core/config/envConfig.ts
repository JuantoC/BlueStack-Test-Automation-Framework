import 'dotenv/config';

const isHeadlessEnv = process.env.IS_HEADLESS;
/**
 * Helper para centralizar la configuración del framework.
 * Lee las variables del .env y las expone de forma tipada.
 */
export const ENV_CONFIG = {
    // --- INFRAESTRUCTURA ---  
    grid: {
        url: process.env.GRID_URL || 'http://localhost:4444',
        useGrid: process.env.USE_GRID === 'true',
        maxInstances: parseInt(process.env.MAX_INSTANCES || '1', 10),
    },

    // --- NAVEGADOR ---
    browser: {
        isHeadless: isHeadlessEnv === 'false' ? false : true,
    },

    // --- ENTORNO DE PRUEBAS ---
    // Dentro del objeto ENV_CONFIG
    baseUrl: process.env.TESTING_URL || ((): string => {
        throw new Error("ERROR: TESTING_URL no definida en .env");
    })(),

    // --- CREDENCIALES (Centralizadas y seguras) ---
    auth: {
        basic: {
            user: process.env.BASIC_AUTH_USER || '',
            pass: process.env.BASIC_AUTH_PASS || '',
        },
        admin: {
            user: process.env.ADMIN_USER || '',
            pass: process.env.ADMIN_PASS || '',
        },
        editor: {
            user: process.env.EDITOR_USER || '',
            pass: process.env.EDITOR_PASS || '',
        },
    },

    /**
     * Helper para obtener las credenciales de un rol específico dinámicamente
     */
    getCredentials(role: 'admin' | 'editor' | 'basic') {
        return this.auth[role];
    }
};

export default ENV_CONFIG;