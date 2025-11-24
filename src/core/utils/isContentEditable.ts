import { WebElement } from "selenium-webdriver";

/**
 * Verifica si un elemento es editable (contenteditable, role=textbox o CKEditor).
 * @param element El WebElement a verificar.
 * @returns Una promesa que resuelve con true si es editable, false en caso contrario.
 */
export async function isContentEditable(element: WebElement): Promise<boolean> {
    return (
        (await element.getAttribute("contenteditable")) === "true" ||
        (await element.getAttribute("role")) === "textbox" ||
        (await element.getAttribute("class"))?.includes("ck-editor__editable")
    );
}