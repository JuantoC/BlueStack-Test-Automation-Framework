require('dotenv').config();

// SDET TIP: Fallback seguro. Si no hay variable, usamos 1 worker.
// parseInt asegura que Jest no reciba un string "4" y se confunda.
const maxInstances = parseInt(process.env.MAX_INSTANCES || "1", 10);

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    // Usamos el preset para ESM (ECMAScript Modules) ya que usas "import/export"
    preset: 'ts-jest/presets/default-esm',

    // Entorno Allure-Jest para inyectar los metadatos automáticamente
    testEnvironment: "allure-jest/node",
    
    // Timeout global generoso para Selenium (20 mins), controlamos timeouts finos en los tests
    testTimeout: 1200000, 

    testEnvironmentOptions: {
        resultsDir: "allure-results",
    },

    // Dónde buscar archivos
    roots: ['<rootDir>/src'],

    // PATRÓN DE DESCUBRIMIENTO
    // Solo ejecutamos archivos que terminen en .test.ts dentro de sessions/
    testMatch: [
        "**/sessions/**/*.test.ts"
    ],

    // Ignorar librerías y build output
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],

    // Paralelismo: Definido por tu .env
    maxWorkers: maxInstances,

    // Mapeo para imports limpios (si usas alias en tsconfig) y manejo de extensiones .js
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '@/(.*)': '<rootDir>/src/$1' // Opcional: si configuras paths en tsconfig
    },

    // Transformación de TypeScript
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },

    // Configuración de Reporte en Consola
    verbose: true,
};