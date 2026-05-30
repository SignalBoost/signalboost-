import { expect, test } from '@playwright/test';

const routes = ['/promote', '/reviews', '/calendar', '/spreadsheets', '/outreach', '/assistant', '/pricing'];

test.describe('SignalBoost SaaS cockpit', () => {
  for (const route of routes) {
    test(`${route} renders NASA cockpit and localized navigation`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('.site-header')).toBeVisible();
      await expect(page.locator('.cockpit-hero')).toBeVisible();
      await expect(page.locator('.site-nav a[href="/reviews"]')).toBeVisible();
    });
  }

  test('reviews module exposes submission, sentiment, moderation, and locale formatting', async ({ page }) => {
    await page.goto('/reviews');
    await expect(page.getByRole('radiogroup', { name: /star rating/i })).toBeVisible();
    await expect(page.getByLabel(/Admin Console reviews telemetry/i)).toBeVisible();
    await expect(page.getByLabel(/Sentiment trend chart/i)).toBeVisible();
    await expect(page.getByText(/Moderation|moderación|moderação|moderacji|модерац/i)).toBeVisible();
  });
});
