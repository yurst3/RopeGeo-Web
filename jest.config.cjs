/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    // Match TypeScript nodenext: imports use `.js`; map to extensionless so Jest resolves `.ts` sources.
    moduleNameMapper: {
        '^(\\.\\./.*)\\.js$': '$1',
    },
};
