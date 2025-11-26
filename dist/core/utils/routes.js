export const AdminRoutes = {
    POSTS: "/admin/posts",
    COMMENTS: "/admin/comments",
    IMAGES: "/admin/images",
    PROFILE: "/admin/user_profile",
};
/** Construye la URL para acceder a un post específico en el panel de administración.
 * @param base La URL base del ambiente.
 * @param id El ID del post.
 * @returns La URL completa para el post en el panel de administración.
 */
export function postUrl(base, id) {
    return `${base.replace(/\/$/, "")}/admin/post/${id}`;
}
/** Une una URL base con un path específico
 * @param base La URL base.
 * @param path El path a unir.
 * @returns La URL completa unida.
 */
export function joinUrl(base, path) {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
//# sourceMappingURL=routes.js.map