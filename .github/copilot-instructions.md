# Project: playwright-mastery

Playwright + TypeScript end-to-end test suite. Practice target: https://playwright-playground.com (set as baseURL).

## Project structure

- tests/<area>/<page>.spec.ts — one spec file per page or feature (e.g. tests/basic-elements/buttons.spec.ts).
- File names in kebab-case, always ending in .spec.ts.
- Later layers (do not create unless asked): pages/ (page objects), components/, fixtures/, data/, utils/.

## Test design

- One top-level test.describe per file, named after the page ('Buttons', 'Inputs'). Nested describes only to group related behaviors.
- One test.beforeEach per file for navigation. Never duplicate page.goto across describes.
- Test names describe expected behavior in plain English, lowercase start, no "Verify"/"Test" prefix.
  Good: 'shows a message when "Click me" is clicked'.
- One behavior per test. Multiple assertions are fine only if they describe the same behavior.
- No duplicated coverage: if a dedicated test covers a behavior, other tests must not re-assert it.
- Structure each test as Arrange / Act / Assert, separated by blank lines.
- Tests must be independent: no shared state, no reliance on execution order.
- Shared expected values (messages, form data) live in a const object at the top of the file.

## Locators

- Priority: getByRole > getByLabel > getByPlaceholder > getByText > getByTestId.
- getByTestId is preferred for result/output text containers that have no accessible role or name.
- Never use CSS or XPath selectors, nth(), first() or last() unless explicitly asked.
- Names passed to getByRole/getByLabel must match the visible UI text casing.
- Use exact: true when a name is a substring of another element's name.
- Never locate an element by the exact text you are about to assert. Locate it by a stable identifier, then assert its text.

## Assertions and waiting

- Only web-first assertions (await expect(locator).toHaveText(...), toBeVisible, toHaveValue, etc.).
- Never use waitForTimeout or any hard-coded sleep.
- Never use locator.isVisible() / textContent() inside expect() as a replacement for web-first assertions.
- Prefer specific assertions (toHaveText with the exact expected value) over weak ones (toBeVisible) when verifying outcomes.
- For classes use toContainClass, not regex on toHaveClass.
- Before writing a negative assertion, consider whether the element is absent, empty, or has other text, and choose toBeHidden / not.toHaveText accordingly.

## Code style

- TypeScript, const over let, no any.
- Single quotes, semicolons, 2-space indentation (Prettier enforces this).
- Every Playwright call that returns a Promise must be awaited.

## Working rules for AI changes

- Refactors are scoped: never change locators, assertions or tests that are not explicitly part of the requested change.
- Never weaken or remove an assertion to make a test pass. If a test fails, report the failure and propose a fix instead.
- Never invent test IDs, labels or texts. Inspect the page or ask.
- After changes, run: npx playwright test <changed files> --project=chromium --repeat-each=3
- Finish with a short summary listing every change made.
