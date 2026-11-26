import { test, expect, type Page } from '@playwright/test';

const section2 = (page: Page) => page.getByRole('region', { name: "Names you can't see" });

test.describe('Accessibility Tree', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/locators/accessibility-tree');
  });

  test('count the links in the Product menu', async ({ page }) => {
    const productMenu = page.getByRole('navigation', { name: 'Product menu' });
    const links = productMenu.getByRole('link');
    console.log(await links.count());
    await expect(links).toHaveCount(3);
  });

  test('set Quantity to 3 and turn on Gift wrap', async ({ page }) => {
    const quantityInput = page.getByRole('spinbutton', { name: 'Quantity' });
    await quantityInput.fill('3');
    await expect(quantityInput).toHaveValue('3');

    const giftWrapSwitch = page.getByRole('switch', { name: 'Gift wrap' });
    await giftWrapSwitch.check();
    await expect(giftWrapSwitch).toBeChecked();
    await expect(page.getByText('Order: 3 × Desk lamp · Gift wrap: on')).toBeVisible();
  });

  test('dismiss the trial notice', async ({ page }) => {
    const trialMessage = section2(page).getByText('Your trial ends in 3 days.');
    const dismissButton = section2(page).getByRole('button', { name: 'Dismiss notice' });
    await expect(dismissButton).toBeVisible();
    await expect(dismissButton).toHaveAccessibleName('Dismiss notice');
    await dismissButton.click();
    await expect(trialMessage).not.toBeVisible();
    await expect(section2(page).getByRole('status')).toHaveText('Notice dismissed');
  });

  test('open the Trace Viewer post', async ({ page }) => {
    const readMoreButton = section2(page).getByRole('button', {
      name: 'Read more about Reading the Trace Viewer',
    });
    await readMoreButton.click();
    await expect(section2(page).getByRole('status')).toHaveText('Opened: Reading the Trace Viewer');
  });

  test('fill work phone and home email in Contact details', async ({ page }) => {
    const workPhoneInput = section2(page).getByRole('textbox', { name: 'Phone Work' });
    const homeEmailInput = section2(page).getByRole('textbox', { name: 'Email Home' });

    const workPhone = '123-456-7890';
    const homeEmail = 'home@example.com';
    await workPhoneInput.fill(workPhone);
    await homeEmailInput.fill(homeEmail);

    await section2(page).getByRole('button', { name: 'Save' }).click();

    await expect(section2(page).getByRole('status')).toHaveText(
      `Saved: work phone ${workPhone}, home email ${homeEmail}`,
    );
  });

  test('apply the discount code save10 and check notifications', async ({ page }) => {
    const discountInput = section2(page).getByRole('textbox', { name: 'Discount code' });
    await discountInput.fill('save10');
    await section2(page).getByRole('button', { name: 'Apply' }).click();
    await expect(section2(page).getByRole('status')).toHaveText('Code SAVE10 applied');
  });

  test('check notifications settings', async ({ page }) => {
    const notificationsSection = page.getByRole('region', { name: '3. Notifications' });

    await expect(
      notificationsSection.getByRole('checkbox', { checked: true, disabled: false }),
    ).toHaveCount(2);
    await expect(notificationsSection.getByRole('checkbox', { disabled: true })).toHaveCount(2);
  });

  test('count every checkbox in Notifications, including the ones in the collapsed Advanced section, without opening it', async ({
    page,
  }) => {
    const notificationsSection = page.getByRole('region', { name: '3. Notifications' });
    const allCheckboxes = notificationsSection.getByRole('checkbox', { includeHidden: true });
    await expect(allCheckboxes).toHaveCount(7);
  });
});
