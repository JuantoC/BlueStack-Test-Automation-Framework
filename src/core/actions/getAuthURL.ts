import { basicAuthCredentials } from '../../environments/Dev_SAAS/credentials';

/**
 * Función que construye la URL de autenticación HTTP (Basic Auth).
 * @param baseURL La URL base del ambiente.
 * @returns La URL completa con las credenciales inyectadas.
 */
export function getAuthUrl(baseURL: string): string {
    const { username, password } = basicAuthCredentials;
    return `https://${username}:${encodeURIComponent(password)}@${baseURL}`;
}