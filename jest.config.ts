import type { Config } from 'jest';
import preset from 'jest-preset-angular/presets/index.js';

const { createCjsPreset } = preset;

const config: Config = {
  ...createCjsPreset({ tsconfig: '<rootDir>/tsconfig.spec.json' }),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;
