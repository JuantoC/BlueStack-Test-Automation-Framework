import { postUrl } from "../utils/routes.js";
/** Navega a la página de un post específico en el panel de administración.
 * @param driver La instancia de WebDriver.
 * @param baseURL La URL base del ambiente.
 * @param id El ID del post al que se desea navegar.
 */
export async function goToPost(driver, baseURL, id) {
    const url = postUrl(baseURL, id);
    console.log(`[goToPost] Navegando a ${url} ...`);
    await driver.navigate().to(url);
}
//# sourceMappingURL=goToPost.js.map