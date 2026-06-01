---
name: dhis2-app-modernization
description: Modernize DHIS2 app and library dependencies, package managers, and developer tooling. Use when the agent needs to upgrade a DHIS2 frontend project to the latest Node LTS, Yarn 4, Vite, ESLint, DHIS2 localization tooling, TypeScript, outdated dependencies, or vulnerable dependencies while preserving build, test, lint, localize, and start workflows.
---

# DHIS2 App Modernization

## Overview

Use this skill to perform dependency and dev-tool modernization in DHIS2 frontend repositories with tight verification after each meaningful change. Prefer small migration slices, update configs with the upgraded tools, and keep the app runnable between slices.

For detailed command/checklist guidance, read [references/modernization-checklist.md](references/modernization-checklist.md) before editing.

## Workflow

1. Inspect the repository first: package manager files, Node version files, `package.json` scripts, bundler config, ESLint config, TypeScript config, DHIS2 app config, CI files, and test setup. Detect whether the app already uses Vite or still uses Create React App/react-scripts, custom webpack, or older DHIS2 build tooling.
2. Establish a baseline by running the important existing scripts that are practical in the environment. Prioritize `yarn test`, `yarn build`, `yarn localize`, `yarn lint`, `yarn typecheck` for TypeScript projects, and a smoke check for `yarn start`. If a TypeScript project has no `typecheck` script, add `"typecheck": "tsc --noEmit"` before relying on verification.
3. Apply one modernization slice at a time. After each slice, update README/docs for changed install, test, proxy, environment, or tooling behavior, then run the narrowest relevant checks plus any user-requested scripts.
4. When a check fails, fix the root cause before continuing to the next slice unless the failure is clearly pre-existing and documented.
5. Keep user changes intact. Do not revert unrelated changes in the worktree.

## Required Modernization Slices

### Node LTS

Find the current active Node LTS before editing because it changes over time. Update `.nvmrc`, `package.json` `engines.node`, CI setup, Docker/devcontainer files, and docs only where those files already define Node. Before running post-upgrade verification commands, use the upgraded Node version locally, for example with `nvm install` and `nvm use`.

### Yarn 4

Set `packageManager` to a current Yarn 4 release. Use Corepack-compatible configuration. Before running `yarn install`, update `.gitignore` for committed Yarn release/cache folders and ensure `.yarnrc.yml` contains `enableScripts: false`, `nodeLinker: node-modules`, `npmMinimalAgeGate: 5d`, and `checksumBehavior: throw`. Do not add `approvedGitRepositories`; ask the user for approval if one is needed. If dependencies need lifecycle scripts, prefer `@lavamoat/allow-scripts` over globally enabling all scripts. Update README install instructions to use the Corepack and Yarn 4 flow.

### Vite

Upgrade Vite and related plugins together. If the project uses Create React App/react-scripts, custom webpack, or another non-Vite bundler, migrate it to Vite instead of only upgrading the old bundler. Read current official Vite migration notes for each crossed major version before editing. Update config, test config, env usage, CommonJS/ESM boundaries, plugin APIs, and build output assumptions as needed. With Vite/Rolldown, replace wildcard re-exports from CommonJS or uncertain packages with explicit runtime and type exports. Treat Node polyfills as an explicit, minimal compatibility layer, not a default. Replace browser-side `require(...)`, especially in dev helpers such as why-did-you-render, with ESM-safe imports. Verify all environment variables: CRA `REACT_APP_*` variables and `process.env` access must be migrated in code, docs, and deployment config. Prefer a typed local config/env module over scattered `import.meta.env` reads. Remove obsolete CRA/webpack leftovers, such as `setupProxy.js`, when behavior has moved into `vite.config.*`.

### Vitest

When modernizing test tooling, migrate Jest-based setups to Vitest by default. Only keep Jest when the user explicitly opts out or there is a documented Jest-only blocker. Preserve test behavior intentionally: globals, jsdom, setup files, mocks, coverage, snapshots, path aliases, and React Testing Library setup.

### ESLint

Upgrade ESLint and related parsers/plugins/configs together. Detect whether the repo uses legacy `.eslintrc*` or flat `eslint.config.*`. If moving to flat config, preserve existing rules intentionally and account for ignored files, globals, parser options, TypeScript support, React support, import resolution, Prettier integration, and Jest/testing globals.

### DHIS2 I18n

Replace deprecated localization packages with DHIS2 app scripts:

- Add latest `@dhis2/cli-app-scripts`.
- Remove `@dhis2/d2-i18n-extract` and `@dhis2/d2-i18n-generate`.
- Update localization scripts to use `d2-app-scripts i18n extract`.
- Preserve existing generated locale file locations unless the current DHIS2 tooling requires a migration.

## Optional Modernization Slices

Only perform these when the user asks or when they are necessary for a required slice:

- **TypeScript**: Upgrade TypeScript and related type tooling. Expect code and config changes, especially around stricter type inference, module resolution, JSX, test globals, and library declarations.
- **Outdated dependencies**: Use package-manager-native outdated checks plus release notes for risky packages. Upgrade in compatible groups and verify after each group.
- **Vulnerable dependencies**: Use audit output to identify direct versus transitive fixes. Prefer non-breaking direct upgrades; document when a vulnerability remains because no compatible fix exists.
- **Dependency hygiene**: Run an unused/missing dependency checker such as `knip` or `depcheck` after large migrations. Fix only verified direct issues in the modernization PR; document noisy or pre-existing findings separately.

## Verification Discipline

After each change, run relevant scripts rather than saving all verification for the end. At minimum:

- Node/Yarn changes: install check, `yarn test`, `yarn build`, `yarn lint`, and `yarn typecheck` for TypeScript projects.
- Vite changes: `yarn build`, relevant tests, and a `yarn start` smoke check when feasible. For webapps, if Chrome DevTools MCP is available, open the running app and verify it loads without suspicious console errors.
- ESLint changes: `yarn lint`, plus tests if lint config affects TypeScript/test parsing.
- I18n changes: `yarn localize` and inspect generated file diffs.
- TypeScript changes: ensure `package.json` has `"typecheck": "tsc --noEmit"` if missing, update README test/check instructions, then run `yarn typecheck`.

If a long-running dev server is started for `yarn start`, stop it before finishing unless the user asks to keep it running.

## Current Information

Before choosing "latest" versions or migration rules, check current official sources or package registry metadata. Do not rely on baked-in version numbers in this skill.
