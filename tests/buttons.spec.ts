import {test, expect, type Page} from '@playwright/test';

const MESSAGES = {
    click: 'Button clicked',
    primary: 'Primary button clicked',
    double: 'Double click detected',
    right: 'Right click detected',
}

const result = (page: Page) => page.getByTestId('button-result');


test.describe('Verify button actions', () => {

    test.beforeEach(async ({page})=>{
        await page.goto('/basic/buttons')
    })

    test('Verify click me button shows message when clicked', async ({page}) => {
        const clickMeBtn = page.getByRole("button", {name:'Click me', exact: true})
        await clickMeBtn.click()        
        await expect(result(page)).toHaveText(MESSAGES.click)
    })

    test('Verify Primary action me button shows message when clicked', async ({page}) => {
        const primaryBtn = page.getByRole('button', {name: 'Primary action'})
        await primaryBtn.click()
        await expect(result(page)).toHaveText(MESSAGES.primary)
    });

    test('Verify disabled button is disabled', async ({page}) => {
        const disabledBtn = page.getByRole('button', {name: 'Disabled button'})
        await expect(disabledBtn).toBeDisabled()
    })

    test('Verify double click button works only on double click', async ({page}) => {
        const doubleClickBtn = page.getByRole('button', {name:'Double click me'})
        await doubleClickBtn.click()
        await expect(result(page)).toBeHidden()
        await doubleClickBtn.dblclick()
        await expect(result(page)).toHaveText(MESSAGES.double)

    })

    test( 'Verify right click displays the proper message', async ({page}) => {
        const rightClickBtn = page.getByRole('button', {name: 'Right click me'})
        await rightClickBtn.click()
        await expect(result(page)).toBeHidden()
        await rightClickBtn.click({button: 'right'})
        await expect(result(page)).toHaveText(MESSAGES.right)
    })
});

test.describe('Verify button styles', ()=>{
    test.beforeEach(async ({page}) => {
        await page.goto('/basic/buttons')
    })

    test('Verify click me button has the secondary class and Primary action button does not', async ({page}) => {
        const clickMeBtn = page.getByRole('button', {name:'Click me', exact: true})
        const primaryBtn = page.getByRole('button', {name: 'Primary action'})

        await expect(clickMeBtn).toHaveClass(/secondary/)
        await expect(primaryBtn).not.toHaveClass(/secondary/)
    })

    test('Verify Primary action button has the accent background', async ({page}) => {
        const primaryBtn = page.getByRole('button', {name: 'Primary action'})
        await expect (primaryBtn).toHaveCSS('background-color','rgb(47, 95, 208)')
    })
});

test.describe('', ()=>{
    test.beforeEach(async ({page})=>{
        await page.goto('/basic/inputs')
    })

    test('Type a username and assert it is echoed below the field.', async ({page}) => {
        const username = page.getByLabel('username')
        let text = "Maria"
        await username.fill(text)
        await expect(username).toHaveValue(text)
        await expect(page.getByTestId('username-result')).toHaveText('You entered: ' + text)
    })

    test('Fill email, password, number and date, then assert the summary', async ({ page }) => {
         const FORM = {
            email: 'example@correo.com',
            password: 'contraseña',
            number: '5',
            date: '2026-05-23',
            range: '32',
         }

        await page.getByLabel('email').fill(FORM.email)
        await page.getByLabel('password').fill(FORM.password)
        await page.getByLabel('number').fill(FORM.number)
        await page.getByLabel('date').fill(FORM.date)
        await page.getByLabel('range').fill(FORM.range)

        await expect(page.getByTestId('result-email')).toHaveText(FORM.email)
        await expect(page.getByTestId('result-password')).toHaveText('••••••••')
        await expect(page.getByTestId('other-inputs-result')).not.toContainText(FORM.password)
        await expect(page.getByTestId('result-number')).toHaveText(FORM.number)
        await expect(page.getByTestId('result-date')).toHaveText(FORM.date)
        await expect(page.getByTestId('result-range')).toHaveText(FORM.range)

    });

    test('Assert the password is masked in the summary, not shown in plain text', async ({page}) => {
        const password = page.getByLabel('password')
        let text = "contraseña"
        await password.fill(text)
        await expect(password).toHaveValue(text)
        await expect(page.getByTestId('result-password')).toHaveText('••••••••')
        await expect(page.getByTestId('other-inputs-result')).not.toContainText(text)
    })

    test('Set the range slider to 75 and assert both the badge and the summary', async ({page}) => {
        const range = page.getByLabel('range')
        let value = '75'
        await range.fill(value)
        await expect(range).toHaveValue(value)
        await expect(page.getByTestId('range-badge')).toHaveText(value)
        await expect(page.getByTestId('result-range')).toHaveText(value)
    })

    test('Clear the email field and assert the summary shows N/A again', async ({page}) => {
        const email = page.getByLabel('email')
        await email.fill('example@correo.com')
        await email.clear()
        await expect(email).toHaveValue('')
        await expect(page.getByTestId('result-email')).toHaveText('N/A')
    })

})

test.describe('Dropdown interactions', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/basic/dropdown')
    })

    test('Select a country by its visible label and assert the result', async ({page}) => {
        await page.getByLabel('Select a country').selectOption({label: 'Germany'})
        await expect(page.getByText('Selected country: Germany', {exact: true})).toBeVisible()
    })

    test('Select a country by its value and assert the select value', async ({page}) => {
        const country = page.getByLabel('Select a country')
        await country.selectOption('United States')
        await expect(country).toHaveValue('United States')
    })

    test('Select English and Spanish and assert both selected values', async ({page}) => {
        const languages = page.getByLabel('Languages you speak')
        await languages.selectOption(['English', 'Spanish'])
        await expect(languages).toHaveValues(['English', 'Spanish'])
    })

    test('Choose Large from the shirt-size dropdown and assert the result', async ({page}) => {
        await page.getByRole('button', {name: 'Shirt size Choose a size'}).click()
        await page.getByRole('option', {name: 'Large'}).click()
        await expect(page.getByTestId('size-result')).toHaveText('Selected size: Large')
    })

    test('selectOption fails on the custom shirt-size dropdown', async ({page}) => {
        await expect(page.locator('#shirt-size-button').selectOption({label: 'Large'}))
            //.rejects.toThrow('Element is not a <select> element')
    })
})


