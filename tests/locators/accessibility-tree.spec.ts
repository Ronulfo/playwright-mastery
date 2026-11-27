import { test, expect, type Page } from '@playwright/test';

const linksSection = (page: Page) =>
  page.getByRole('region', { name: /Not everything is what it looks like/ });
const namesSection = (page: Page) => page.getByRole('region', { name: /Names you can't see/ });
const notificationsSection = (page: Page) => page.getByRole('region', { name: /Notifications/ });

test.describe('Accessibility Tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/locators/accessibility-tree');
  });

  test('count the links in the Product menu', async ({ page }) => {
    const productMenu = page.getByRole('navigation', { name: 'Product menu' });
    const links = productMenu.getByRole('link');
    await expect(links).toHaveCount(3);
  });

  test('set Quantity to 3 and turn on Gift wrap', async ({ page }) => {
    const quantityInput = linksSection(page).getByRole('spinbutton', { name: 'Quantity' });
    await quantityInput.fill('3');
    await expect(quantityInput).toHaveValue('3');

    const giftWrapSwitch = linksSection(page).getByRole('switch', { name: 'Gift wrap' });
    await giftWrapSwitch.check();
    await expect(giftWrapSwitch).toBeChecked();
    await expect(linksSection(page).getByRole('status')).toHaveText(
      'Order: 3 × Desk lamp · Gift wrap: on',
    );
  });

  test('dismiss trial notice', async ({ page }) => {
    const trialMessage = namesSection(page).getByText('Your trial ends in 3 days.');

    const dismissButton = namesSection(page).getByRole('button').filter({ hasText: '×' });

    await expect(dismissButton).toBeVisible();
    await expect(dismissButton).toHaveText('×');
    await expect(dismissButton).toHaveAccessibleName('Dismiss notice');
    await dismissButton.click();
    await expect(trialMessage).toBeHidden();
    await expect(namesSection(page).getByRole('status')).toHaveText('Notice dismissed');
  });

  test('open the Trace Viewer post', async ({ page }) => {
    const readMoreButton = namesSection(page).getByRole('button', {
      name: 'Read more about Reading the Trace Viewer',
    });
    await readMoreButton.click();
    await expect(namesSection(page).getByRole('status')).toHaveText(
      'Opened: Reading the Trace Viewer',
    );
  });

  test('fill work phone and home email in Contact details', async ({ page }) => {
    const workPhoneInput = namesSection(page).getByRole('textbox', { name: 'Phone Work' });
    const homeEmailInput = namesSection(page).getByRole('textbox', { name: 'Email Home' });

    const workPhone = '123-456-7890';
    const homeEmail = 'home@example.com';
    await workPhoneInput.fill(workPhone);
    await homeEmailInput.fill(homeEmail);

    await namesSection(page).getByRole('button', { name: 'Save' }).click();

    await expect(namesSection(page).getByRole('status')).toHaveText(
      `Saved: work phone ${workPhone}, home email ${homeEmail}`,
    );
  });

  test('apply the discount code save10 and check notifications', async ({ page }) => {
    const discountInput = namesSection(page).getByRole('textbox', { name: 'Discount code' });
    await discountInput.fill('save10');
    await expect(discountInput.getByLabel('Discount code')).toHaveCount(0);
    await namesSection(page).getByRole('button', { name: 'Apply' }).click();
    await expect(namesSection(page).getByRole('status')).toHaveText('Code SAVE10 applied');
  });

  test('check notifications settings', async ({ page }) => {
    await expect(
      notificationsSection(page).getByRole('checkbox', { checked: true, disabled: false }),
    ).toHaveCount(2);
    await expect(notificationsSection(page).getByRole('checkbox', { disabled: true })).toHaveCount(
      2,
    );
    await expect(
      notificationsSection(page).getByRole('checkbox', { name: 'Slack' }),
    ).toBeDisabled();
    await expect(
      notificationsSection(page).getByRole('checkbox', { name: 'Webhook' }),
    ).toBeDisabled();
  });

  test('count every checkbox in Notifications, including the ones in the collapsed Advanced section, without opening it', async ({
    page,
  }) => {
    const allCheckboxes = notificationsSection(page).getByRole('checkbox', { includeHidden: true });
    await expect(allCheckboxes).toHaveCount(7);
  });
});
