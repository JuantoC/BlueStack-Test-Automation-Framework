/**
 * Función que construye la URL de autenticación HTTP (Basic Auth).
 * @param baseURL La URL base del ambiente.
 * @param username en string
 * @param password en string
 * @returns La URL completa con las credenciales inyectadas.
 */
export function getAuthUrl(baseURL: string, username: string, password: string): string {
    const hasProtocol = /^https?:\/\//i.test(baseURL);

    const urlWithoutProtocol = baseURL.replace(/^https?:\/\//i, '');

    const protocol = hasProtocol
        ? baseURL.match(/^https?:\/\//i)?.[0] ?? 'https://'
        : 'https://';

    return `${protocol}${username}:${encodeURIComponent(password)}@${urlWithoutProtocol}`;
}
