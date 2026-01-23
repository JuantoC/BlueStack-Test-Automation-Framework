/**
 * Define la estructura de identidad para procesos de autenticación.
 */
export interface AuthCredentials {
    username: string;
    password: string;
    /** El MFA Token puede ser opcional dependiendo del ambiente */
    otpToken?: string;
    /** Identificador opcional para entornos empresariales */
    domain?: string;
}

/**
 * Configuraciones específicas para el ambiente DEV-SAAS.
 */
export const MainConfig = {
    // 1. URL base de la aplicación para este ambiente.
    BASE_URL: 'testing.d39hyz3zgpw7gd.amplifyapp.com',
};