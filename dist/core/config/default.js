export const DefaultConfig = {
    retry: {
        retries: 4,
        retryDelayMs: 300,
        maxRetryDelayMs: 5000,
        backoffFactor: 2,
        enableScreenshotsOnFail: true,
        logLevel: 'debug',
    },
    timeout: {
        short: 3000, // Interacciones rápidas (escritura, clicks en elementos visibles)
        medium: 60000, // Transiciones de UI (descarte de modal)
        long: 10000, // Redirecciones lentas (post-login, post-submit)
    }
};
//# sourceMappingURL=default.js.map