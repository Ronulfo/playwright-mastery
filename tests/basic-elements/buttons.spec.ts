import { test, expect } from '@playwright/test';

const MESSAGES = {
  click: 'Button clicked',
  primary: 'Primary button clicked',
  double: 'Double click detected',
  right: 'Right click detected',
};

const STYLES = {
  primaryBackground: 'rgb(47, 95, 208)',
};

test.describe('Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/basic/buttons');
  });

  test('shows a message when Click me is clicked', async ({ page }) => {
    const clickMeButton = page.getByRole('button', { name: 'Click me', exact: true });

    await clickMeButton.click();

    await expect(page.getByText(MESSAGES.click, { exact: true })).toHaveText(MESSAGES.click);
  });

  test('shows a message when Primary action is clicked', async ({ page }) => {
    const primaryButton = page.getByRole('button', { name: 'Primary action' });

    await primaryButton.click();

    await expect(page.getByText(MESSAGES.primary, { exact: true })).toHaveText(MESSAGES.primary);
  });

  test('is disabled', async ({ page }) => {
    const disabledButton = page.getByRole('button', { name: 'Disabled button' });

    await expect(disabledButton).toBeDisabled();
  });

  test('shows a message only after a double click', async ({ page }) => {
    const doubleClickButton = page.getByRole('button', { name: 'Double click me' });

    await doubleClickButton.click();
    await expect(page.getByText(MESSAGES.double, { exact: true })).toBeHidden();

    await doubleClickButton.dblclick();

    await expect(page.getByText(MESSAGES.double, { exact: true })).toHaveText(MESSAGES.double);
  });

  test('shows a message only after a right click', async ({ page }) => {
    const rightClickButton = page.getByRole('button', { name: 'Right click me' });

    await rightClickButton.click();
    await expect(page.getByText(MESSAGES.right, { exact: true })).toBeHidden();

    await rightClickButton.click({ button: 'right' });

    await expect(page.getByText(MESSAGES.right, { exact: true })).toHaveText(MESSAGES.right);
  });

  test('has the secondary class while Primary action does not', async ({ page }) => {
    const clickMeButton = page.getByRole('button', { name: 'Click me', exact: true });
    const primaryButton = page.getByRole('button', { name: 'Primary action' });

    await expect(clickMeButton).toContainClass('secondary');
    await expect(primaryButton).not.toContainClass('secondary');
  });

  test('has the accent background color', async ({ page }) => {
    const primaryButton = page.getByRole('button', { name: 'Primary action' });

    await expect(primaryButton).toHaveCSS('background-color', STYLES.primaryBackground);
  });
});
