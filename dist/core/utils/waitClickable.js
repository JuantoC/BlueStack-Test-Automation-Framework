import { error } from "selenium-webdriver";
import { stackLabel } from "./stackLabel.js";
import { waitVisible } from "./waitVisible.js";
import { waitEnabled } from "./waitEnabled.js";
export async function waitClickable(driver, element, timeout = 1500, opts = {}) {
    if (!element || typeof element.getId !== "function") {
        throw new Error("Expected a WebElement but received: " + element.toString());
    }
    const fullOpts = { ...opts, label: stackLabel(opts.label, `[waitClickable]: ${(await element.getTagName())}`) };
    console.log(`[waitClickable]`);
    try {
        console.log(`[waitClickable] Esperando disponibilidad...`);
        await waitVisible(driver, element, timeout, fullOpts);
        await waitEnabled(driver, element, timeout, fullOpts);
        console.log(`[waitClickable] Elemento clickable.`);
    }
    catch (err) {
        if (err instanceof error.TimeoutError) {
            console.error(`[${fullOpts.label}] ERROR TIMEOUT. Elemento no clickable`);
            throw err;
        }
    }
    return element;
}
//# sourceMappingURL=waitClickable.js.map