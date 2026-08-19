import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const stories = {
  decision:
    '/iframe.html?id=foundation-visual-language-decision-record--chancery-direction&viewMode=story',
  lords:
    '/iframe.html?id=compositions-political-foundation-spikes--lord-portrait-support-strip&viewMode=story',
  action:
    '/iframe.html?id=compositions-political-foundation-spikes--action-preview-letter-with-long-consequences&viewMode=story',
  crisis:
    '/iframe.html?id=compositions-political-foundation-spikes--compact-crisis-frame-at-minimum-height&viewMode=story',
  crisisPreferred:
    '/iframe.html?id=compositions-political-foundation-spikes--preferred-viewport-crisis-frame&viewMode=story',
  map: '/iframe.html?id=compositions-political-foundation-spikes--raster-map-with-keyboard-hotspots&viewMode=story',
  raster: '/iframe.html?id=primitives-rastericon--density-semantics-and-fallback&viewMode=story',
  behaviors:
    '/iframe.html?id=foundation-component-contracts--radix-behaviors-without-scripted-play&viewMode=story',
  loading: '/iframe.html?id=foundation-component-contracts--stable-loading-state&viewMode=story',
} as const;

async function openStory(page: import('@playwright/test').Page, url: string) {
  await page.goto(url);
  await page.locator('#storybook-root').waitFor();
  await page.waitForLoadState('networkidle');
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(
      images.map(
        (image) =>
          image.complete ||
          new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
          }),
      ),
    );
  });
}

async function expectNoAxeViolations(page: import('@playwright/test').Page) {
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
}

test.describe('WP-012 visual evidence', () => {
  test('captures authored compositions at 1280×720', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    for (const [name, url] of Object.entries({
      lords: stories.lords,
      action: stories.action,
      crisis: stories.crisis,
      map: stories.map,
    })) {
      await openStory(page, url);
      await expect(page).toHaveScreenshot(`${name}-1280x720.png`, {
        animations: 'disabled',
        fullPage: true,
      });
    }
  });

  test('captures decision record and preferred crisis at 1440×900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStory(page, stories.decision);
    await expect(page).toHaveScreenshot('decision-record-1440x900.png', {
      animations: 'disabled',
      fullPage: true,
    });
    await openStory(page, stories.crisisPreferred);
    await expect(page).toHaveScreenshot('crisis-1440x900.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('survives constrained height and reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 640 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, stories.crisis);
    await expect(page.getByRole('button', { name: 'Resolve the Capital decision' })).toBeVisible();
    await expect(page).toHaveScreenshot('crisis-1280x640-reduced-motion.png', {
      animations: 'disabled',
      fullPage: true,
    });
  });
});

test.describe('WP-012 keyboard and accessibility contract', () => {
  test('map hotspots are named, keyboard ordered, and visibly focused', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openStory(page, stories.map);

    const hotspots = page.getByRole('button');
    await expect(hotspots).toHaveCount(7);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Northkeep:/ })).toBeFocused();
    await expect(page.getByRole('button', { name: /Northkeep:/ })).toHaveCSS(
      'outline-style',
      'solid',
    );
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Capital:/ })).toBeFocused();
    await expect(page.getByRole('button', { name: /Capital:/ }).locator('small')).toHaveCSS(
      'font-size',
      '16px',
    );
    await expect(page).toHaveScreenshot('map-focus-1280x720.png', {
      animations: 'disabled',
      fullPage: true,
    });

    await expectNoAxeViolations(page);
  });

  test('mandatory dialog traps focus, resists escape, and returns focus after resolution', async ({
    page,
  }) => {
    await openStory(page, stories.crisis);
    const trigger = page.getByRole('button', { name: 'Resolve the Capital decision' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Choose before the next bell' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(page).toHaveScreenshot('mandatory-dialog-1280x720.png', {
      animations: 'disabled',
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Record a guarded withdrawal' }).click();
    await expect(trigger).toBeFocused();

    await expectNoAxeViolations(page);
  });

  test('missing raster fallback remains meaningful and icon-only control is named', async ({
    page,
  }) => {
    await openStory(page, stories.raster);
    await expect(page.locator('[data-asset-id="placeholder-blank-seal"]').first()).toHaveAttribute(
      'data-load-state',
      'loaded',
    );
    await expect(
      page.getByRole('img', { name: 'Missing clerk seal — image unavailable' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Seal the proclamation' })).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test('stable loading state remains announced and reduced-motion safe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, stories.loading);
    const loading = page.locator('[data-kind="loading"]');
    await expect(loading).toHaveAttribute('role', 'status');
    await expect(loading).toHaveAttribute('aria-live', 'polite');
    await expect(loading).toContainText('The clerk is opening the sealed register');
    await expect(loading.locator('span').first()).toHaveCSS('animation-name', 'none');
    await expectNoAxeViolations(page);
  });

  test('key public, private, stale, unknown and coerced labels are visible text', async ({
    page,
  }) => {
    await openStory(page, stories.lords);
    await expect(page.locator('[class*="portraitMedallion"]')).toHaveCount(6);
    await expect(page.locator('[class*="portraitMedallion"]').first()).toHaveCSS(
      'border-top-style',
      'double',
    );
    await expect(page.getByText('Candidate · Public Pledge', { exact: true })).toHaveCSS(
      'font-size',
      '16px',
    );
    await expect(page.getByText('Cordial · +22', { exact: true })).toHaveCSS('font-size', '16px');
    for (const id of ['edric', 'ysabel', 'renard', 'oswin', 'mara']) {
      await expect(
        page.locator(`[data-asset-id="character-${id}-bust-temporary-master-crop"]`),
      ).toHaveCount(1);
    }
    await expect(page.locator('[data-asset-id="placeholder-anonymous-portrait"]')).toHaveCount(1);
    for (const label of [
      'Public record',
      'Known privately',
      'Stale report',
      'Unknown',
      'Under duress',
      'Dispossessed · Vote retained',
    ]) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }
    await expectNoAxeViolations(page);
  });

  test('project-owned dialog, popover and tabs preserve Radix keyboard behavior', async ({
    page,
  }) => {
    await openStory(page, stories.behaviors);

    const dialogTrigger = page.getByRole('button', { name: 'Open the royal notice' });
    await dialogTrigger.click();
    await expect(page.getByRole('dialog', { name: 'A sealed demand awaits' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialogTrigger).toBeFocused();

    const popoverTrigger = page.getByRole('button', { name: 'Read consequence' });
    await popoverTrigger.click();
    await expect(page.getByText('The public offer will be visible')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(popoverTrigger).toBeFocused();

    const publicTab = page.getByRole('tab', { name: 'Public' });
    await publicTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Private' })).toBeFocused();
    await expect(page.getByRole('tab', { name: 'Private' })).toHaveAttribute(
      'data-state',
      'active',
    );

    await expectNoAxeViolations(page);
  });

  test('action preview and visual decision record are axe-clean', async ({ page }) => {
    await openStory(page, stories.action);
    expect(
      await page.evaluate(() => {
        const bodyElement = document.querySelector('.pl-foundation-scope');
        const displayElement = document.querySelector('.pl-foundation-scope h1');
        if (!(bodyElement instanceof HTMLElement) || !(displayElement instanceof HTMLElement)) {
          throw new Error('Foundation typography specimens are missing.');
        }
        return {
          body: getComputedStyle(bodyElement).fontFamily,
          display: getComputedStyle(displayElement).fontFamily,
          bodyLoaded: document.fonts.check('16px "PL Source Serif 4"'),
          displayLoaded: document.fonts.check('32px "PL Cormorant Garamond"'),
        };
      }),
    ).toMatchObject({
      body: expect.stringContaining('PL Source Serif 4'),
      display: expect.stringContaining('PL Cormorant Garamond'),
      bodyLoaded: true,
      displayLoaded: true,
    });
    await expectNoAxeViolations(page);
    await openStory(page, stories.decision);
    await expectNoAxeViolations(page);
  });

  test('foundation compositions reflow at a 200%-equivalent viewport', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 360 });
    for (const url of [stories.lords, stories.crisis, stories.map]) {
      await openStory(page, url);
      expect(
        await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        })),
      ).toEqual({ clientWidth: 640, scrollWidth: 640 });
    }
  });
});
