require('dotenv').config();

// 1. CORRECCIÓN SDET: Agregamos parseInt para que lea el .env correctamente
const maxInstances = parseInt(process.env.MAX_INSTANCES || "1", 10);

module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: "allure-jest/node",
    testTimeout: 1200000,
    testEnvironmentOptions: {
        resultsDir: "allure-results",
    },
    roots: ['<rootDir>/tests', '<rootDir>/src'],

    // 2. ARQUITECTURA:
    // Jest descubre cada sesión como un ente independiente.
    // Si hay 5 archivos acá, levantará hasta 5 workers (según maxInstances).
    testMatch: [
        "**/src/sessions/**/*.test.ts"
    ],

    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    maxWorkers: maxInstances,
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
        }],
    },
};