---
name: playwright-testing
description: >
  Playwright e2e testing skill. Use whenever writing, running, or debugging
  end-to-end browser tests. Trigger on mentions of e2e tests, browser tests,
  Playwright, UI testing, or integration testing for the comparator.
---

# Playwright E2E Testing

## Project Setup

Tests live in `e2e/` at the project root.
```bash
# Run all e2e tests
yarn playwright test

# Run with UI mode (interactive)
yarn playwright test --ui

# Run a specific test file
yarn playwright test e2e/comparator-upload.spec.ts

# Debug a test
yarn playwright test --debug
```

## Test Structure
```
e2e/
├── fixtures/              # Test data (sample metadata JSON files)
├── pages/                 # Page Object Models
│   ├── comparator.page.ts
│   └── upload.page.ts
├── comparator-upload.spec.ts
├── comparator-diff.spec.ts
└── playwright.config.ts
```

## Writing Tests

Follow these conventions:

- Use Page Object Model pattern — never put selectors directly in test files
- Each page object goes in `e2e/pages/`
- Test files are named `<feature>.spec.ts`
- Use data-testid attributes for selectors, never CSS classes
- Tests must be independent — no shared state between tests
- Each test should start from a clean state

## Page Object Example
```typescript
// e2e/pages/comparator.page.ts
import { Page, Locator } from '@playwright/test';

export class ComparatorPage {
  readonly page: Page;
  readonly diffList: Locator;
  readonly uploadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.diffList = page.getByTestId('diff-list');
    this.uploadButton = page.getByTestId('upload-button');
  }

  async goto() {
    await this.page.goto('/');
  }

  async uploadFiles(first: string, second: string) {
    // ...implementation
  }
}
```

## Test Example
```typescript
// e2e/comparator-upload.spec.ts
import { test, expect } from '@playwright/test';
import { ComparatorPage } from './pages/comparator.page';

test.describe('Comparator Upload', () => {
  test('should display differences after uploading two files', async ({ page }) => {
    const comparator = new ComparatorPage(page);
    await comparator.goto();
    await comparator.uploadFiles('fixtures/file1.json', 'fixtures/file2.json');
    await expect(comparator.diffList).toBeVisible();
  });
});
```

## Clean Architecture Compliance

- Page Objects are the only layer that touches the UI (like Presentation layer)
- Test logic stays in the spec files (like Domain layer)
- Test data and fixtures are separate (like Data layer)
- No business logic assertions based on DOM structure — assert on user-visible behavior

## Running Against the Comparator

Playwright config should start the Vite dev server automatically:
```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'yarn start-comparator',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

This ensures tests run against comparator-only mode (no DHIS2 auth needed).
