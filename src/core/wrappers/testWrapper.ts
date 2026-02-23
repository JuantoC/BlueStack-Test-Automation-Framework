// src/core/testWrapper.ts
import * as allure from "allure-js-commons";

/**
 * Wrapper de Inversión de Control para ejecutar sesiones E2E en paralelo.
 * Abstrae el bloque test() de Jest y maneja la metadata de Allure.
 */
export function runSession(sessionLabel: string, testLogic: (label: string) => Promise<void>) {
    const targetFile = process.env.TEST_FILE;

    // Filtro estricto: Si hay un targetFile en el .env y no coincide con esta sesión, 
    // retornamos silenciosamente. Al NO declarar el bloque test(), Jest simplemente 
    // lo ignora y Allure NO registra un test "Skipped", manteniendo métricas limpias.
    if (targetFile && !sessionLabel.includes(targetFile)) {
        return;
    }

    // Si pasa el filtro (o no hay filtro), le entregamos el bloque nativo a Jest
    test(`Sesión: ${sessionLabel}`, async () => {
        // Metadata para Allure
        await allure.owner("Automated Runner");
        await allure.tag("Parallel-Execution");
        await allure.parameter("Session", sessionLabel);

        let monitorHandle: any = null;
        let networkSummary: any = null;
        try {
            /** * NOTA: Para que esto funcione, necesitas pasar el driver al monitor.
             * Si tu testLogic crea el driver, podrías inicializar el monitor ahí dentro,
             * o pasar una referencia aquí. Asumiendo que el driver se gestiona 
             * dentro o se provee:
             */

            // Ejecutamos la lógica de negocio
            await testLogic(sessionLabel);

        } finally {
            // 2. Lógica de cierre y reporte de red
            // Intentamos recuperar el monitor (deberías guardarlo en una variable accesible)
            // Supongamos que lo guardas en un objeto global o lo recuperas del contexto
            if (global.activeMonitor) {
                networkSummary = await global.activeMonitor.stop();

                if (networkSummary && networkSummary.hasErrors) {
                    await allure.tag("network-issues");
                    // LANZAMOS EL ERROR AL FINAL: Esto pone el test en ROJO en Allure
                    throw new Error(
                        `Test completado, pero se detectaron ${networkSummary.count} errores de red (4xx/5xx). Ver adjunto 'Network_Issues' para detalles.`
                    );
                }
            }
        }
    });
}