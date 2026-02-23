require('dotenv').config();

const maxInstances = (process.env.MAX_INSTANCES || "1", 10);

module.exports = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: "allure-jest/node",
    testEnvironmentOptions: {
        resultsDir: "allure-results",
    },
    // 1. LIMITAR BÚSQUEDA: Solo buscamos en la carpeta tests y src
    roots: ['<rootDir>/tests', '<rootDir>/src'],
    testMatch: [
        "**/runner.test.ts"
    ],
    // 2. IGNORAR CARPETAS PESADAS explícitamente
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    maxWorkers: maxInstances,
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            useESM: true,
            isolatedModules: true
        }],
    },
};