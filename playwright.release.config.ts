import { defineConfig, devices } from '@playwright/test';

const releaseRoot = process.env.RELEASE_SMOKE_DIR ?? 'release-smoke/game';

export default defineConfig({
  testDir: './tests/release',
  outputDir: 'test-results/release',
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4174',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm exec vite preview --host 127.0.0.1 --port 4174 --outDir "${releaseRoot}"`,
    reuseExistingServer: false,
    url: 'http://127.0.0.1:4174',
  },
});
