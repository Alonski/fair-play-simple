import { test, expect } from '@playwright/test';
import { injectStoreData } from './fixtures';

test.describe('Card Modal', () => {
  test.beforeEach(async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
  });

  test('Add button opens card modal with empty form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new card' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /edit card|create new card/i })).toBeVisible();
    await page.screenshot({ path: 'test-results/card-modal-add.png', fullPage: true });
  });

  test('Edit button on expanded card opens modal with pre-filled data', async ({ page }) => {
    // Expand first card
    const firstCard = page.locator('[class*="border-l-"]').first().getByRole('button').first();
    await firstCard.click();
    // Click Edit
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Title should be pre-filled
    await expect(page.locator('#card-title-en')).not.toHaveValue('');
    await page.screenshot({ path: 'test-results/card-modal-edit.png', fullPage: true });
  });

  test('Escape key closes the modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new card' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Cancel button closes the modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Add new card' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
