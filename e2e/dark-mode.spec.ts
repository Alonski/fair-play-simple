import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await injectStoreData(page);
    // Enable dark mode via settings
    await page.goto('/more');
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Dark' }).click();
  });

  test('My Cards in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({ path: 'test-results/dark-mycards.png', fullPage: true });
  });

  test('Deal screen in dark mode', async ({ page }) => {
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/dark-deal.png', fullPage: true });
  });

  test('Settings screen in dark mode', async ({ page }) => {
    await page.goto('/more');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/dark-settings.png', fullPage: true });
  });

  test('Card modal in dark mode', async ({ page }) => {
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add new card' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: 'test-results/dark-card-modal.png', fullPage: true });
  });

  test('Confirm dialog in dark mode', async ({ page }) => {
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.screenshot({ path: 'test-results/dark-confirm-dialog.png', fullPage: true });
  });
});
