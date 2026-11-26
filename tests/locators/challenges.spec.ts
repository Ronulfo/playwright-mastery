import { test, expect } from '@playwright/test';

const CHALLENGES = {
  product: 'Wireless Keyboard',
  notificationSaveMessage: 'Notification settings saved',
  deleteMessage: 'Deleted the selected item',
  overdueTasks: ['Fix flaky login test', 'Update CI pipeline'],
  archivedPrefix: 'Archived: ',
  docsSearch: 'locators',
  searchMessage: 'No toolbar action yet · Searching for: locators',
  settingsMessage: 'Settings opened · Searching for: locators',
  logoAlt: 'QA Playground logo',
};

test.describe('Locator Challenges', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/locators/challenges');
  });

  test('adds Wireless Keyboard to the cart', async ({ page }) => {
    const productCards = page.getByRole('region', { name: '1. Product cards' });
    const product = productCards
      .getByRole('article')
      .filter({ has: page.getByRole('heading', { name: CHALLENGES.product, exact: true }) });

    await product.getByRole('button', { name: 'Add to cart' }).click();

    await expect(productCards.getByRole('status')).toHaveText(`Cart (1): ${CHALLENGES.product}`);
  });

  test('saves Notification settings', async ({ page }) => {
    const settingsSection = page.getByRole('region', {
      name: '2. Same button, different sections',
    });
    const notificationSettings = settingsSection.getByRole('region', {
      name: 'Notification settings',
    });

    await notificationSettings.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(settingsSection.getByRole('status')).toHaveText(
      CHALLENGES.notificationSaveMessage,
    );
  });

  test('clicks exactly Delete', async ({ page }) => {
    const exactNames = page.getByRole('region', { name: '3. Exact names' });

    await exactNames.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(exactNames.getByRole('status')).toHaveText(CHALLENGES.deleteMessage);
  });

  test('archives all Overdue tasks and leaves the Done task untouched', async ({ page }) => {
    const taskRegion = page.getByRole('region', { name: '4. Filter by state' });
    const tasks = taskRegion.getByRole('list', { name: 'Team tasks' });
    const overdueTasks = tasks
      .getByRole('listitem')
      .filter({ has: page.getByText('Overdue', { exact: true }) });
    const archiveStatus = taskRegion.getByRole('status');
    const doneTask = tasks
      .getByRole('listitem')
      .filter({ has: page.getByText('Write test plan', { exact: true }) });
    const archivedTaskNames: string[] = [];

    for (let attempt = 0; attempt < 10 && (await overdueTasks.count()) > 0; attempt++) {
      await overdueTasks.first().getByRole('button', { name: 'Archive' }).click();
    }

    await expect(overdueTasks).toHaveCount(0);
    await expect(archiveStatus).toContainText(CHALLENGES.overdueTasks[0]);
    await expect(archiveStatus).toContainText(CHALLENGES.overdueTasks[1]);

    await expect(doneTask).toHaveCount(1);
    await expect(doneTask).toContainText('Done');
  });

  test('searches docs for locators and opens settings', async ({ page }) => {
    const toolbar = page.getByRole('region', { name: '5. Elements without text' });
    const docsSearch = toolbar.getByRole('searchbox', { name: 'Search the docs' });

    await docsSearch.fill(CHALLENGES.docsSearch);
    await docsSearch.press('Enter');
    await expect(toolbar.getByRole('status')).toHaveText(CHALLENGES.searchMessage);

    await toolbar.getByTitle('Open settings').click();

    await expect(toolbar.getByRole('status')).toHaveText(CHALLENGES.settingsMessage);
  });

  test('shows the QA Playground logo', async ({ page }) => {
    await expect(page.getByAltText(CHALLENGES.logoAlt)).toBeVisible();
  });
});
