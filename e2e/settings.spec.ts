import { test, expect } from '@playwright/test';

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/more');
    await page.waitForLoadState('networkidle');
  });

  test('shows language and theme toggles', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'עברית' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Light' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Dark' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Auto' })).toBeVisible();
    await page.screenshot({ path: 'test-results/settings-screen.png', fullPage: true });
  });

  test('toggling dark mode adds .dark class to html', async ({ page }) => {
    await page.getByRole('tab', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.screenshot({ path: 'test-results/settings-dark-mode.png', fullPage: true });
  });

  test('toggling back to light removes .dark class', async ({ page }) => {
    await page.getByRole('tab', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByRole('tab', { name: 'Light' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('switching language to Hebrew sets RTL direction', async ({ page }) => {
    await page.getByRole('tab', { name: 'עברית' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.screenshot({ path: 'test-results/settings-hebrew.png', fullPage: true });
  });

  test('switching back to English sets LTR direction', async ({ page }) => {
    await page.getByRole('tab', { name: 'עברית' }).click();
    await page.getByRole('tab', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });
});
