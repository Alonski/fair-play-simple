import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('app loads and shows My Cards tab by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');
    await page.screenshot({ path: 'test-results/my-cards-empty.png', fullPage: true });
  });

  test('clicking Deal tab navigates to /deal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('nav').getByRole('link', { name: /deal/i }).click();
    await expect(page).toHaveURL('/deal');
    await page.screenshot({ path: 'test-results/deal-screen.png', fullPage: true });
  });

  test('clicking More tab navigates to /more', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('nav').getByRole('link', { name: /more/i }).click();
    await expect(page).toHaveURL('/more');
    await page.screenshot({ path: 'test-results/more-screen.png', fullPage: true });
  });

  test('browser back button works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('nav').getByRole('link', { name: /deal/i }).click();
    await expect(page).toHaveURL('/deal');
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});
