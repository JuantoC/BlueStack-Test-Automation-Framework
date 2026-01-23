import logger from "../utils/logger.js";
import { stackLabel } from "../utils/stackLabel.js";

export const AdminRoutes = {
    POSTS: "/admin/posts",
    COMMENTS: "/admin/comments",
    IMAGES: "/admin/images",
    PROFILE: "/admin/user_profile",
} as const; // 'as const' para asegurar que las rutas sean inmutables y literales

/**
 * Normaliza una URL base garantizando el protocolo https://.
 * @param url - La URL candidata.
 * @returns La URL con protocolo seguro.
 */
function ensureHttps(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    return url;
}

/**
 * Construye la URL para acceder a un post específico en el panel de administración.
 * @param base - La URL base del ambiente.
 * @param id - El ID del post.
 * @param label - Contexto para trazabilidad.
 * @returns La URL completa y normalizada.
 */
export function postUrl(base: string, id: number | string, label?: string): string {
    const configLabel = stackLabel(label, "postUrl");

    const normalized = ensureHttps(base).replace(/\/+$/, "");
    const finalUrl = `${normalized}/admin/post/${id}`;

    logger.debug(`URL de Post construida: ${finalUrl}`, { label: configLabel });

    return finalUrl;
}

/**
 * Une una URL base con un path específico de forma segura, evitando barras dobles.
 * @param base - La URL base o dominio.
 * @param path - El path relativo.
 * @param label - Contexto para trazabilidad.
 * @returns La URL completa unida.
 */
export function joinUrl(base: string, path: string, label?: string): string {
    const configLabel = stackLabel(label, "joinUrl");

    const normalizedBase = ensureHttps(base).replace(/\/+$/, "");
    const cleanedPath = path.replace(/^\/+/, "");
    const finalUrl = `${normalizedBase}/${cleanedPath}`;

    logger.debug(`URL compuesta: ${finalUrl}`, { label: configLabel });

    return finalUrl;
}