import { expect, test, type Page } from '@playwright/test';

const EXPECTED = {
  signInBefore: 'Not signed in',
  logInResult: 'Signed in. You saw the "Log in" button.',
  signInResult: 'Signed in. You saw the "Sign in" button.',
  syncBefore: 'Not synced yet',
  synced: 'Synced',
  sendersWithoutUnreadBadge: ['Ada', 'Grace', 'Linus', 'Newsletter'],
  sendersWithoutAttachment: ['Ada', 'CI bot', 'Linus', 'Newsletter'],
  sendersWithAttachment: ['Billing', 'Grace', 'HR'],
  archiveResult:
    'Archived: Sprint notes, Build failed on main, Lunch on Friday?, What changed this month',
  exportBefore: 'Nothing exported yet',
  exportResult: 'Exported report.csv',
  addToCart: 'Add to cart',
  cartCount: '2',
};

const MAX_SYNC_ATTEMPTS = 5;

const VARIANTS = {
  'log-in': { button: 'Log in', otherButton: 'Sign in', result: EXPECTED.logInResult },
  'sign-in': { button: 'Sign in', otherButton: 'Log in', result: EXPECTED.signInResult },
} as const;

async function addTwoDeskLampsToCart(page: Page) {
  const shop = page.getByRole('region', { name: '5. Responsive header' });
  const addToCart = shop.getByRole('button', { name: EXPECTED.addToCart, exact: true });
  // The wide and narrow headers each render a cart count; only one is visible per viewport.
  const visibleCartCount = shop.getByTestId('cart-count').filter({ visible: true });

  await addToCart.click();
  await addToCart.click();

  await expect(visibleCartCount).toHaveText(EXPECTED.cartCount);
}

test.describe('Locator Logic', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // The A/B variant is random per visit; tests that need a fixed one declare it as an annotation.
    const variant = testInfo.annotations.find(
      (annotation) => annotation.type === 'variant',
    )?.description;
    await page.goto(variant ? `/locators/logic?variant=${variant}` : '/locators/logic');
  });

  for (const [variant, { button, otherButton, result }] of Object.entries(VARIANTS)) {
    test(
      `signs in with the ${variant} variant`,
      { annotation: { type: 'variant', description: variant } },
      async ({ page }) => {
        const signInSection = page.getByRole('region', { name: '1. A/B test' });
        const variantButton = signInSection.getByRole('button', { name: button, exact: true });
        const otherVariantButton = signInSection.getByRole('button', {
          name: otherButton,
          exact: true,
        });
        const signInStatus = signInSection.getByRole('status');

        await expect(variantButton).toBeVisible();
        await expect(otherVariantButton).toBeHidden();
        await expect(signInStatus).toHaveText(EXPECTED.signInBefore);

        await variantButton.click();

        await expect(signInStatus).toHaveText(result);
      },
    );
  }

  test('retries sync until it succeeds', async ({ page }) => {
    const syncSection = page.getByRole('region', { name: '2. One of two outcomes' });
    const syncStatus = syncSection.getByRole('status');
    const tryAgain = syncSection.getByRole('button', { name: 'Try again', exact: true });
    // Success renders a status, failure replaces it with an alert holding "Try again",
    // so exactly one side of this .or() exists once the sync has settled.
    const syncedStatus = syncStatus.filter({ hasText: new RegExp(`^${EXPECTED.synced}$`) });
    const settledOutcome = syncedStatus.or(tryAgain);

    await expect(syncStatus).toHaveText(EXPECTED.syncBefore);

    await syncSection.getByRole('button', { name: 'Sync now', exact: true }).click();

    for (let attempt = 1; attempt <= MAX_SYNC_ATTEMPTS; attempt += 1) {
      await expect(settledOutcome).toBeVisible();
      if (await syncedStatus.isVisible()) {
        break;
      }
      await tryAgain.click();
      // Wait until the retry has actually started, so the next check cannot see the old failure.
      await expect(tryAgain).toBeHidden();
    }

    await expect(
      syncStatus,
      `Sync did not succeed within ${MAX_SYNC_ATTEMPTS} attempts`,
    ).toHaveText(EXPECTED.synced);
  });

  test('counts inbox messages without an Unread badge', async ({ page }) => {
    const inbox = page.getByRole('list', { name: 'Inbox' });
    const messages = inbox.getByRole('listitem');
    const unreadBadge = page.getByText('Unread', { exact: true });
    const messagesWithoutUnreadBadge = messages.filter({ hasNot: unreadBadge });

    await expect(messagesWithoutUnreadBadge).toHaveCount(EXPECTED.sendersWithoutUnreadBadge.length);
    await expect(messagesWithoutUnreadBadge).toContainText(EXPECTED.sendersWithoutUnreadBadge);
  });

  test('archives messages without attachments and keeps attached messages', async ({ page }) => {
    const inboxSection = page.getByRole('region', { name: '3. Inbox' });
    const inbox = inboxSection.getByRole('list', { name: 'Inbox' });
    const archiveStatus = inboxSection.getByRole('status');
    const messages = inbox.getByRole('listitem');
    const attachment = page.getByRole('img', { name: 'Attachment' });
    const messagesWithoutAttachment = messages.filter({ hasNot: attachment });

    for (const sender of EXPECTED.sendersWithoutAttachment) {
      await messagesWithoutAttachment
        .filter({ has: page.getByText(sender, { exact: true }) })
        .getByRole('button', { name: 'Archive', exact: true })
        .click();
    }

    await expect(archiveStatus).toHaveText(EXPECTED.archiveResult);
    await expect(messagesWithoutAttachment).toHaveCount(0);
    await expect(messages).toHaveCount(EXPECTED.sendersWithAttachment.length);
    await expect(messages).toContainText(EXPECTED.sendersWithAttachment);
  });

  test('exports the CSV report', async ({ page }) => {
    const reports = page.getByRole('region', { name: '4. Reports' });
    const exportStatus = reports.getByRole('status');
    // Two buttons are named "Export" and a help link shares the CSV title; only the combination is unique.
    const exportCsvButton = reports
      .getByRole('button', { name: 'Export', exact: true })
      .and(reports.getByTitle('Export as CSV', { exact: true }));

    await expect(exportStatus).toHaveText(EXPECTED.exportBefore);

    await exportCsvButton.click();

    await expect(exportStatus).toHaveText(EXPECTED.exportResult);
  });

  test('adds two Desk lamps to the cart', async ({ page }) => {
    await addTwoDeskLampsToCart(page);
  });

  test.describe('mobile shop', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('adds two Desk lamps to the cart', async ({ page }) => {
      await addTwoDeskLampsToCart(page);
    });
  });
});
