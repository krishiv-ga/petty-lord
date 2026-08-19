import { expect, test } from '@playwright/test';

test('extracted game artifact boots with checkpoint identity', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await expect(page).toHaveTitle('The Petty Lord');
  await expect(page.getByRole('status')).toContainText('Foundation 0.1.0-alpha.1 ready');
  expect(await page.locator('svg').count()).toBe(0);
});
