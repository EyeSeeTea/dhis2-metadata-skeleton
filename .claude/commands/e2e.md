---
description: Run Playwright e2e tests
allowed-tools: Bash(yarn playwright*), Bash(npx playwright*), Read, Glob
argument-hint: [test-file-or-pattern]
---

Run Playwright e2e tests.

If $ARGUMENTS is provided, run only matching tests:
  yarn playwright test $ARGUMENTS

Otherwise run the full suite:
  yarn playwright test

After tests complete, summarize: passed, failed, and for any failures 
show the test name, error message, and which page/component was involved.
