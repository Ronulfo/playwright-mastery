import {test, expect} from '@playwright/test';

const SELECTIONS = {
  germany: 'Germany',
  unitedStates: 'United States',
  languages: ['English', 'Spanish'],
  shirtSize: 'Large',
};

test.describe('Dropdown', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/basic/dropdown');
  });

  test('selects Germany by its visible label and shows the result', async ({page}) => {
    const country = page.getByLabel('Select a country');

    await country.selectOption({label: SELECTIONS.germany});

    await expect(page.getByText(`Selected country: ${SELECTIONS.germany}`, {exact: true}))
      .toHaveText(`Selected country: ${SELECTIONS.germany}`);
  });

  test('selects United States by value and shows the result', async ({page}) => {
    const country = page.getByLabel('Select a country');

    await country.selectOption({value: SELECTIONS.unitedStates});

    await expect(country).toHaveValue(SELECTIONS.unitedStates);
    await expect(page.getByText(`Selected country: ${SELECTIONS.unitedStates}`, {exact: true}))
      .toHaveText(`Selected country: ${SELECTIONS.unitedStates}`);
  });

  test('selects English and Spanish in the languages list', async ({page}) => {
    const languages = page.getByLabel('Languages you speak');

    await languages.selectOption(SELECTIONS.languages);

    await expect(languages).toHaveValues(SELECTIONS.languages);
    await expect(page.getByTestId('languages-result'))
      .toHaveText('Selected languages: English, Spanish');
  });

  test('shows Large as the selected shirt size', async ({page}) => {
    const shirtSizeDropdown = page.getByRole('button', {name: /Shirt size/});

    await shirtSizeDropdown.click();
    await page.getByRole('option', {name: SELECTIONS.shirtSize}).click();

    await expect(page.getByTestId('size-result'))
      .toHaveText(`Selected size: ${SELECTIONS.shirtSize}`);
  });

  test('rejects selectOption on the custom shirt-size button', async ({page}) => {
    const shirtSizeDropdown = page.getByRole('button', {name: /Shirt size/});

    const selectingLarge = shirtSizeDropdown.selectOption({label: SELECTIONS.shirtSize});

    await expect(selectingLarge).rejects.toThrow('Element is not a <select> element');
  });
});
