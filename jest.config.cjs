require('dotenv').config();

// Si no hay variable, usamos 1 worker.
const maxInstances = parseInt(process.env.MAX_INSTANCES || "1", 10);

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',

    testEnvironment: "allure-jest/node",

    testTimeout: (1000 * 60 * 20),

    testEnvironmentOptions: {
        resultsDir: "allure-results",
    },

    // Dónde buscar archivos
    roots: ['<rootDir>'],

    // PATRÓN DE DESCUBRIMIENTO
    // Descubre archivos .test.ts en cualquier subdirectorio de sessions/
    // Ejecutar una suite por dominio: jest <nombre-carpeta>
    //   Ejemplos: jest video | jest post | jest stress
    // Ejecutar un test puntual:      jest <NombreArchivo>
    //   Ejemplo:  jest NewPost
    // Ejecutar múltiples dominios:   jest "post|video"
    testMatch: [
        "**/sessions/**/*.test.ts"
    ],

    // Ignorar librerías y build output
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],

    maxWorkers: maxInstances,

    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '@/(.*)': '<rootDir>/src/$1'
    },

    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },

    verbose: true,
};