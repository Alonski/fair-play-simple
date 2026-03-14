import { test, expect } from '@playwright/test';
import { injectStoreData, SAMPLE_CARDS, CARD_STORE_STATE, GAME_STORE_STATE } from './fixtures';

test.describe('MSC Notes', () => {
  test.beforeEach(async ({ page }) => {
    await injectStoreData(page);
    await page.goto('/deal');
    await page.waitForLoadState('networkidle');
  });

  test('expanded card shows MSC Notes section with placeholder', async ({ page }) => {
    const firstCardHeader = page.locator('[class*="border-l-4"]').first().getByRole('button').first();
    await firstCardHeader.click();
    await expect(page.getByText('MSC Notes').first()).toBeVisible();
    await expect(page.getByText(/add msc notes/i).first()).toBeVisible();
    await page.screenshot({ path: 'test-results/msc-notes-placeholder.png', fullPage: true });
  });

  test('clicking placeholder opens textarea for editing', async ({ page }) => {
    const firstCardHeader = page.locator('[class*="border-l-4"]').first().getByRole('button').first();
    await firstCardHeader.click();
    await page.getByText(/add msc notes/i).first().click();
    await expect(page.locator('textarea[placeholder*="done right"]')).toBeVisible();
    await page.screenshot({ path: 'test-results/msc-notes-editing.png', fullPage: true });
  });

  test('typing a note and blurring saves it', async ({ page }) => {
    const firstCardHeader = page.locator('[class*="border-l-4"]').first().getByRole('button').first();
    await firstCardHeader.click();
    await page.getByText(/add msc notes/i).first().click();
    const textarea = page.locator('textarea[placeholder*="done right"]');
    await textarea.fill('Whites separated, folded same day');
    // Blur by pressing Tab
    await textarea.press('Tab');
    // Note text should now be shown as a button
    await expect(page.getByText('Whites separated, folded same day')).toBeVisible();
    await page.screenshot({ path: 'test-results/msc-notes-saved.png', fullPage: true });
  });

  test('saved note persists after collapse and re-expand', async ({ page }) => {
    const firstCardHeader = page.locator('[class*="border-l-4"]').first().getByRole('button').first();
    // Expand, type note, save
    await firstCardHeader.click();
    await page.getByText(/add msc notes/i).first().click();
    await page.locator('textarea[placeholder*="done right"]').fill('Test MSC note');
    await page.locator('textarea[placeholder*="done right"]').press('Tab');
    // Collapse
    await firstCardHeader.click();
    // Re-expand
    await firstCardHeader.click();
    // Note should still be there
    await expect(page.getByText('Test MSC note')).toBeVisible();
  });

  test('card header shows MSC indicator dot when note is set', async ({ page }) => {
    // Pre-populate a card with an existing MSC note
    const cardsWithNote = SAMPLE_CARDS.map((c, i) =>
      i === 0 ? { ...c, details: { en: 'Pre-set note', he: 'Pre-set note' } } : c
    );
    await page.evaluate((data) => {
      localStorage.setItem('card-store', JSON.stringify(data.cards));
      localStorage.setItem('game-store', JSON.stringify(data.game));
    }, {
      cards: { ...CARD_STORE_STATE, state: { ...CARD_STORE_STATE.state, cards: cardsWithNote } },
      game: GAME_STORE_STATE,
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    // The first card should show the "MSC" label in the header
    await expect(page.getByText('MSC').first()).toBeVisible();
  });
});
