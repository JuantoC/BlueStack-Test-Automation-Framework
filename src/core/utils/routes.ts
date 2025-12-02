export const AdminRoutes = {
    POSTS: "/admin/posts",
    COMMENTS: "/admin/comments",
    IMAGES: "/admin/images",
    PROFILE: "/admin/user_profile",
};

/** Normaliza una base URL garantizando https:// */
function ensureHttps(url: string): string {
    return url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
}

/** Construye la URL para acceder a un post específico en el panel de administración.
 * @param base La URL base del ambiente.
 * @param id El ID del post.
 * @returns La URL completa para el post en el panel de administración.
 */
export function postUrl(base: string, id: number | string): string {
    const normalized = ensureHttps(base).replace(/\/$/, "");
    return `${normalized}/admin/post/${id}`;
}

/** Une una URL base con un path específico
 * @param base La URL base.
 * @param path El path a unir.
 * @returns La URL completa unida.
 */
export function joinUrl(base: string, path: string): string {
    const normalized = ensureHttps(base).replace(/\/+$/, "");
    const cleanedPath = path.replace(/^\/+/, "");
    return `${normalized}/${cleanedPath}`;
}