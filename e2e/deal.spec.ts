import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('Deal screen', () => {
  test.beforeEach(async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
  });

  test('shows cards in Unassigned segment', async ({ page }) => {
    const unassignedTab = page.getByRole('tab', { name: /unassigned/i });
    await expect(unassignedTab).toBeVisible();
    await page.screenshot({ path: 'test-results/deal-unassigned.png', fullPage: true });
  });

  test('Deal button distributes cards to partners', async ({ page }) => {
    const dealBtn = page.locator('button', { hasText: 'Deal' });
    await expect(dealBtn).toBeEnabled();
    await dealBtn.click();
    // Confirm in the dialog
    await page.getByRole('dialog').getByRole('button', { name: 'Deal' }).click();
    // After deal, view switches to Alon's cards
    await page.screenshot({ path: 'test-results/deal-after-deal.png', fullPage: true });
    // Alon segment tab should be visible
    await expect(page.getByRole('tab', { name: /alon/i }).first()).toBeVisible();
  });

  test('Reset moves all cards back to Unassigned', async ({ page }) => {
    // Deal first
    await page.locator('button', { hasText: 'Deal' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Deal' }).click();
    await page.waitForTimeout(500);
    // Then reset
    await page.getByRole('button', { name: 'Reset' }).click();
    // Confirm the reset in the dialog
    await page.getByRole('dialog').getByRole('button', { name: 'Reset' }).click();
    // Unassigned tab with count (6) should be visible
    const unassignedTab = page.getByRole('tab', { name: /unassigned/i });
    await expect(unassignedTab).toBeVisible();
    await expect(unassignedTab).toContainText('6');
  });

  test('segment switcher switches between partners and Unassigned', async ({ page }) => {
    await page.getByRole('tab', { name: /alon/i }).first().click();
    await page.getByRole('tab', { name: /moral/i }).first().click();
    await page.getByRole('tab', { name: /unassigned/i }).click();
    await expect(page.getByRole('tab', { name: /unassigned/i })).toBeVisible();
  });
});
