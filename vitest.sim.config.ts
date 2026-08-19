import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'sim',
    environment: 'node',
    include: ['tests/sim/**/*.test.ts'],
    passWithNoTests: false,
    reporters: ['default'],
  },
});
