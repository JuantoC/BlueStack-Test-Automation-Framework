import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as allure from "allure-js-commons";

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const sessionsPath = join(__dirname, '../src/sessions');

// 1. Capturamos la variable de entorno si el usuario quiere correr algo específico
const targetFile = process.env.TEST_FILE;

const sessionFiles = readdirSync(sessionsPath).filter(file => {
    const isScript = file.endsWith('.ts') || file.endsWith('.js');
    if (!isScript) return false;

    // Si pasamos un archivo específico, ignoramos el resto
    if (targetFile) {
        return file.includes(targetFile);
    }
    return true; // Si no hay filtro, corremos todos
});


describe("CMS Dynamic Session Executor", () => {
    for (const file of sessionFiles) {
        const sessionLabel = file.replace(/\.(ts|js)$/, '');

        test(`Sesión: ${sessionLabel}`, async () => {
            // Metadata Pro para Allure
            await allure.owner("Automated Runner");
            await allure.tag("Parallel-Execution");
            await allure.parameter("File", file);

            const modulePath = join(sessionsPath, file);
            const sessionModule = await import(pathToFileURL(modulePath).href);

            // Mantenemos la validación de seguridad
            if (typeof sessionModule.run !== 'function') {
                throw new Error(`❌ El archivo ${file} no exporta 'run(label: string)'`);
            }

            await sessionModule.run(sessionLabel);
        }, 180000);
    }
});