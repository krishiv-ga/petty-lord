import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'unit',
      environment: 'node',
      include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
      exclude: ['tests/sim/**', 'tests/e2e/**'],
      passWithNoTests: false,
      reporters: ['default'],
    },
  }),
);
