import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, '../../..');

export default defineConfig({
  testDir: currentDirectory,
  testMatch: 'foundation.spec.ts',
  outputDir: path.join(repositoryRoot, 'test-results/wp-012-foundation'),
  snapshotDir: path.join(currentDirectory, 'baselines'),
  // Text rendering differs by operating system, so visual evidence must never
  // compare a Linux capture against a Windows-authored baseline.
  snapshotPathTemplate: '{snapshotDir}/{platform}/{arg}{ext}',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: path.join(repositoryRoot, 'playwright-report/wp-012-foundation'),
        open: 'never',
      },
    ],
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:6006',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'pnpm exec vite preview --outDir storybook-static --host 127.0.0.1 --port 6006',
    cwd: repositoryRoot,
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
  },
});
