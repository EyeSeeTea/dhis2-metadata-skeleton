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


## Boy Scout Rule

Leave every file you touch cleaner than you found it. When working on a task, if you encounter code in the files you are already modifying that violates the conventions in this document (imperative loops that should be functional, tests with weak assertions, missing `describe` groups, mutable state that should be immutable, etc.), fix it as part of the same change. Keep the scope reasonable — refactor what you touch, don't go hunting across the entire codebase.


## Architecture

This project follows Clean Architecture with strict layered dependency rules (Presentation → Domain → Data). Source lives under `src/`:

```
domain/      entities, repository interfaces, use cases — zero framework/infrastructure deps
    ^
    | depends on
    |
data/        concrete repository implementations (filesystem repositories)
    ^
    | wired via
    |
scripts/  +  components/, pages/, state/   CLI commands and React comparator UI
                                           (presentation → use cases → repositories)
```

Supporting folders: `helpers/` (filesystem utilities), `locales/` (generated i18n).

### Hard Rules

- **Dependency Rule**: outer layers depend on inner layers, never the reverse. `domain/` has zero framework/infrastructure dependencies and must not import from `data/`, `scripts/`, or any UI/web global.
- **Repository pattern**: all external access (filesystem JSON, etc.) goes through repository interfaces in `domain/`, implemented in `data/`. Repositories return domain entities and contain no business logic.
- **Presentation is wiring only.** CLI commands and React components/pages parse input, call use cases, and render/return results. Graphical components contain **zero** business logic — they render state and forward events; logic lives in use cases / state managers.
- **No duplicated logic across components.** If two components share identical behavior, extract it into a shared utility immediately — not in a follow-up.

> Full per-layer review checklist: `.est_ai/review/checklist.md` — consult it before marking any task done.
> Detailed project context (filesystem contract, dedup rule, canonical commands): `openspec/config.yaml`.


## Code Formatting

- Always run `yarn prettify` before committing any code changes. This ensures consistent formatting across the project.

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


## UI Design Workflow

When a feature includes user-facing UI (the comparator webapp views, forms, panels):

1. **Design before implementation.** Wireframes/mockups are created in Pencil (`.pen` files via MCP tools) and approved before any `[FE]` or `[GD]` implementation tasks begin.
2. **Design artifacts** live in `openspec/designs/`:
   - `.pen` files in `openspec/designs/wireframes/` or `openspec/designs/mockups/`
   - PNG exports in `openspec/designs/exports/` (naming: `[feature]-[screen]-[state].png`)
3. **Design is part of the proposal.** The change's `design.md` references the wireframes/exports; approving the proposal approves the design.
4. **Always commit the `.pen` source file** — it is the source of truth; PNG exports are derived artifacts.


## After Every Feature Change

After implementing any feature addition, modification, or bug fix, update **all** of the following before considering the work done:

1. **README.md** — Update command docs, examples, and feature list if user-facing behavior changed.
2. **PR description** — If an open PR exists on the branch (`gh pr view`), update its summary and test plan (`gh pr edit`).
3. **OpenSpec specs** — If the change relates to a spec in `openspec/specs/`, update the requirements/scenarios (and any archived copy in `openspec/changes/archive/`).
4. **UI designs** — If comparator UI components changed, create/update the `.pen` files in Pencil and re-export PNGs.
5. **Translations** — If user-facing strings changed, run `yarn update-po` so the `.po` / generated locale files stay in sync.
6. **Prettify** — Run `yarn prettify` before committing.


## Pre-Commit Self-Review

Before every commit, verify the following against the changed files. Do not commit until all items pass:

1. **Architecture** — Does the code respect the dependency rule? Any direct I/O bypassing the proper layers? Any business logic leaking into components?
2. **Patterns** — Does new code follow existing patterns in the same layer? (Check at least one sibling file.)
3. **Functional style** — Any `for` loops with mutable accumulators that should be `map`/`flatMap`/`filter`/`reduce`?
4. **Test assertions** — Are all assertions concrete values (`toEqual`, `toBe`)? No `toBeDefined`/`toBeTruthy` when an exact value is knowable?
5. **No duplication** — Is any logic copy-pasted between files? Extract it.
6. **i18n** — Are all new user-facing strings wrapped in `i18n.t()`?
7. **Boy Scout Rule** — In the files you touched, fix any pre-existing violations of these rules.
