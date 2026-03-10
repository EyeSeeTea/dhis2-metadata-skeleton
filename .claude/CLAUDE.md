## Git Workflow

- Default branch for new work: `development`
- Branch from another feature branch only when there is a dependency on unmerged work.
  Merge back to the same branch you started from.
- Branch naming:
  - `feature/<human-readable-name>` for new features
  - `fix/<human-readable-name>` for bug fixes
- All commits use Conventional Commits:
  - `feat(scope): description` for new features
  - `fix(scope): description` for bug fixes
  - `refactor(scope): description` for restructuring
  - `test(scope): description` for test changes
  - `docs(scope): description` for documentation
  - `chore(scope): description` for maintenance
- Never commit as "Claude" — use the project's git user config.


## Pull Requests

- Every PR description must include a link to the related ClickUp issue(s).
- Format:
```
  ## Related Tasks
  - [Task name](https://app.clickup.com/t/<task-id>)
```
- If the PR covers a parent issue with subtasks, link the parent issue.
- If the PR covers multiple standalone issues, link all of them.
- The ClickUp task ID can be found in the task URL or by searching ClickUp.
- When creating a PR, always search ClickUp for the related tasks first to get the URLs.


## Code Style

### Functional Programming

This project favours functional code and immutability:

- Prefer `flatMap` over `for` + `push` with a mutable accumulator.
- Prefer `find` over imperative `for` loops for lookups.
- Prefer `reduce` over index-based `for` loops with mutable state.
- Avoid in-place mutation — return new objects instead of mutating existing ones.

### TypeScript

- When defining a union type that also needs runtime values (e.g., for iteration, validation, or dropdowns), derive the type from a `const` array (`as const`) rather than using an unsafe `as Type[]` assertion. Use `UnionFromValues` from ts-utils or `typeof arr[number]`.

### i18n

- All user-facing strings must use `i18n.t()`. Never hardcode labels.


## E2E Testing (Playwright)

- Use accessibility-based locators (`getByRole`, `getByLabelText`, `getByText`) instead of CSS class selectors.
- Avoid `data-testid` attributes in production code. Prefer role- and label-based selectors; use `data-testid` only when no accessible selector is feasible.
- Never use `waitForTimeout`. Wait for observable conditions (element visible/hidden, text present, etc.).
- Avoid `.first()` with long timeouts — assert on specific, identifiable elements.


## Unit Testing

- Always assert concrete values (e.g. exact line ranges), not just `toBeDefined()` or `toBeTruthy()`. A test that only checks "we don't crash" is insufficient.
- Group tests with `describe` blocks by behavior category.
- Extract helpers so each test only expresses what changes. Reduce boilerplate.
- Use constants for repeated magic strings (class names, paths, labels).
- Remove redundant tests, or explicitly document why a seemingly redundant test exists as a contract test.


## CI

- PRs must target branches covered by CI, or CI workflows must be extended to cover the PR branch.
- E2E tests must run in CI alongside unit tests.
