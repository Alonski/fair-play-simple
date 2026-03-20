import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('Accessibility', () => {
  test('skip-to-content link is present and works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Skip link should exist but be visually hidden
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
    // Tab to it and it should become visible
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await page.screenshot({ path: 'test-results/skip-link-visible.png', fullPage: true });
  });

  test('navigation links have aria-current on active page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const myCardsLink = page.locator('nav a[href="/"]');
    await expect(myCardsLink).toHaveAttribute('aria-current', 'page');
    // Other links should not
    const dealLink = page.locator('nav a[href="/deal"]');
    await expect(dealLink).not.toHaveAttribute('aria-current', 'page');
  });

  test('segment controls have tablist role', async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('tablist').first()).toBeVisible();
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(3); // Alon, Moral, Unassigned
  });

  test('card row button has aria-expanded', async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    const firstCardBtn = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await expect(firstCardBtn).toHaveAttribute('aria-expanded', 'false');
    await firstCardBtn.click();
    await expect(firstCardBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('Escape closes card modal', async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Add new card' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('balance bar has descriptive aria-label', async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
    const balanceBar = page.locator('[role="img"][aria-label*="Card distribution"]');
    await expect(balanceBar).toBeVisible();
  });
});
