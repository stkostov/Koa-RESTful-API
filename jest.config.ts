import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  coverageThreshold: {
    "global": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    }
  },
  testMatch: ['**/tests/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  clearMocks: true,
  transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true }] },
  extensionsToTreatAsEsm: ['.ts'],
};
export default config;