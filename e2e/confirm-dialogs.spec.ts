import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('Confirmation Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
  });

  test('Deal button shows confirmation dialog', async ({ page }) => {
    await page.locator('button', { hasText: 'Deal' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/randomly assign/i)).toBeVisible();
    await page.screenshot({ path: 'test-results/deal-confirm-dialog.png', fullPage: true });
  });

  test('Cancel on deal confirmation returns to deal screen', async ({ page }) => {
    await page.locator('button', { hasText: 'Deal' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    // Cards should still be unassigned
    await expect(page.getByRole('tab', { name: /unassigned/i })).toContainText('6');
  });

  test('Confirming deal shows success toast', async ({ page }) => {
    await page.locator('button', { hasText: 'Deal' }).click();
    // Confirm in dialog
    await page.getByRole('dialog').getByRole('button', { name: 'Deal' }).click();
    // Toast should appear
    await expect(page.getByText(/cards dealt/i)).toBeVisible();
    await page.screenshot({ path: 'test-results/deal-toast.png', fullPage: true });
  });

  test('Reset shows confirmation dialog with destructive styling', async ({ page }) => {
    // Deal first so there are cards to reset
    await page.locator('button', { hasText: 'Deal' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Deal' }).click();
    // Wait for toast to clear
    await page.waitForTimeout(500);
    // Click Reset
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/unassign all cards/i)).toBeVisible();
    await page.screenshot({ path: 'test-results/reset-confirm-dialog.png', fullPage: true });
  });

  test('Confirming reset shows reset toast', async ({ page }) => {
    // Deal first
    await page.locator('button', { hasText: 'Deal' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Deal' }).click();
    await page.waitForTimeout(500);
    // Reset
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByText(/cards reset/i)).toBeVisible();
  });
});
