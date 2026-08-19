import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('bootstrap screen loads at the minimum supported viewport', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('The Petty Lord');
  await expect(page.getByRole('heading', { level: 1, name: 'The Petty Lord' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Repository foundation ready.');
  await expect(page.getByRole('navigation', { name: 'Project source documents' })).toBeVisible();

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);

  await page.screenshot({ path: 'test-results/wp-000-smoke.png', fullPage: true });
});
