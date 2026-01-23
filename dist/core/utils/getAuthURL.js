/**
 * Función que construye la URL de autenticación HTTP (Basic Auth).
 * @param baseURL La URL base del ambiente.
 * @param username en string
 * @param password en string
 * @returns La URL completa con las credenciales inyectadas.
 */
export function getAuthUrl(baseURL, username, password) {
    return `https://${username}:${encodeURIComponent(password)}@${baseURL}`;
}
//# sourceMappingURL=getAuthURL.js.map