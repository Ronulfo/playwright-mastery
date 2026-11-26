import {test, expect} from '@playwright/test';

const FORM = {
  username: 'Maria',
  email: 'example@correo.com',
  password: 'contraseña',
  number: '5',
  date: '2026-05-23',
  range: '75',
};

test.describe('Inputs', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/basic/inputs');
  });

  test('echoes the entered username below the field', async ({page}) => {
    const username = page.getByLabel('Username');

    await username.fill(FORM.username);

    await expect(username).toHaveValue(FORM.username);
    await expect(page.getByTestId('username-result'))
      .toHaveText(`You entered: ${FORM.username}`);
  });

  test('updates the email, number, and date summaries when the form is filled', async ({page}) => {
    const email = page.getByLabel('Email');
    const password = page.getByLabel('Password');
    const number = page.getByLabel('Number');
    const date = page.getByLabel('Date');

    await email.fill(FORM.email);
    await password.fill(FORM.password);
    await number.fill(FORM.number);
    await date.fill(FORM.date);

    await expect(page.getByTestId('result-email')).toHaveText(FORM.email);
    await expect(page.getByTestId('result-number')).toHaveText(FORM.number);
    await expect(page.getByTestId('result-date')).toHaveText(FORM.date);
  });

  test('keeps the plain-text password out of the summary', async ({page}) => {
    const password = page.getByLabel('Password');
    const passwordSummary = page.getByTestId('other-inputs-result');

    await password.fill(FORM.password);

    await expect(password).toHaveValue(FORM.password);
    await expect(passwordSummary).not.toContainText(FORM.password);
  });

  test('sets the range slider to 75 in the badge and summary', async ({page}) => {
    const range = page.getByRole('slider', {name: /Range/});

    await range.fill(FORM.range);

    await expect(range).toHaveValue(FORM.range);
    await expect(page.getByTestId('range-badge')).toHaveText(FORM.range);
    await expect(page.getByTestId('result-range')).toHaveText(FORM.range);
  });

  test('shows N/A in the summary after the email is cleared', async ({page}) => {
    const email = page.getByLabel('Email');

    await email.fill(FORM.email);
    await email.clear();

    await expect(email).toHaveValue('');
    await expect(page.getByTestId('result-email')).toHaveText('N/A');
  });
});
