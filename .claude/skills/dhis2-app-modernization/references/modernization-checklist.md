# DHIS2 Modernization Checklist

Use this reference as a practical checklist while editing a DHIS2 app or library. Version numbers and breaking changes are time-sensitive; query package metadata and official migration guides during the task.

## Discovery

Run or inspect:

- `package.json`: scripts, `engines`, `packageManager`, dependency groups, bundler/test/lint/TypeScript settings.
- Lockfiles and package manager files: `yarn.lock`, `.yarnrc.yml`, `.pnp.*`, `.yarn/`, `package-lock.json`, `pnpm-lock.yaml`.
- Node files: `.nvmrc`, `.node-version`, `Dockerfile`, `.github/workflows/*`, devcontainer files.
- Tooling configs: `vite.config.*`, `vitest.config.*`, `webpack.config.*`, `config-overrides.*`, `craco.config.*`, `eslint.config.*`, `.eslintrc*`, `tsconfig*.json`, `jest.config.*`, `babel.config.*`.
- DHIS2 configs: `d2.config.*`, `app.config.*`, `public/`, `src/locales/`, `i18n/`.

Record the baseline status of `yarn test`, `yarn build`, `yarn localize`, `yarn lint`, `yarn typecheck` for TypeScript projects, and `yarn start` when feasible. If a TypeScript project has no typecheck script, add `"typecheck": "tsc --noEmit"` to `package.json` before relying on verification. If install is broken at baseline, fix or document the blocker before treating later failures as modernization regressions.

## Node LTS

1. Find current Node LTS from an authoritative source or local version manager metadata.
2. Set `.nvmrc` to the chosen major or exact LTS version, following the repo's existing style.
3. Set `package.json`:

```json
{
  "engines": {
    "node": ">=CURRENT_LTS_MAJOR"
  }
}
```

Use a stricter range only if the repo/CI requires it.

4. Update CI, Docker, and devcontainer Node versions if present.
5. Before verification, switch the local shell to the upgraded Node version. With nvm, run `nvm install` and `nvm use` from the repository root after `.nvmrc` is updated.
6. Verify install and core scripts.

## Yarn 4

1. Enable Corepack assumptions in docs/config when the repo already documents package-manager setup.
2. Set `packageManager` to the latest stable Yarn 4 package string, for example `yarn@4.x.x` using the actual current version.
3. Before running `yarn install`, update `.gitignore` so Yarn-generated state is ignored while repo-portable Yarn artifacts remain committable:

```gitignore
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
```

4. Before running `yarn install`, ensure `.yarnrc.yml` contains these values:

```yaml
enableScripts: false
nodeLinker: node-modules
npmMinimalAgeGate: 5d
checksumBehavior: throw
```

Do not include `approvedGitRepositories` in `.yarnrc.yml`. If Yarn reports that an approved Git repository entry is needed, stop and ask the user for approval before adding it.

5. Use `enableScripts: false` by default. If the project needs postinstall builds or other lifecycle scripts, prefer adding `@lavamoat/allow-scripts` and explicitly allow only the packages that need scripts. Avoid switching to unrestricted lifecycle scripts without documenting why a narrower allowlist cannot work.

6. Update README install/setup instructions to show the Corepack + Yarn 4 flow:

```bash
corepack enable
corepack yarn install
```

7. Regenerate `yarn.lock` with Yarn 4. Remove stale lockfiles from other package managers only when they are clearly obsolete and user-owned changes are not being discarded.
8. Verify install, tests, build, lint, and localization.

## Vite and CRA/Webpack Migration

1. Query the latest Vite and plugin versions.
2. Detect the current bundler:

- Vite: upgrade in place.
- Create React App/react-scripts: migrate to Vite.
- Custom webpack, CRACO, react-app-rewired, or similar: migrate to Vite unless there is a documented blocker.
- Older DHIS2 scripts wrapping webpack: inspect the current DHIS2 app tooling and migrate to the current Vite-compatible setup when available.

3. For Vite upgrades, read official Vite migration guides for every crossed major version.
4. For CRA/webpack migrations, map old behavior before editing:

- Entry point and HTML template.
- Environment variable names. CRA exposes `REACT_APP_*`; Vite exposes `VITE_*` unless config bridges compatibility.
- Static assets and public path behavior.
- Dev-server proxy configuration.
- Test runner assumptions.
- Babel macros, webpack aliases, loaders, and plugins.
- SVG/component imports, CSS modules, Sass/Less/PostCSS, workers, and dynamic imports.

5. Upgrade related packages together, commonly `vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`, and coverage plugins if present.
6. Remove obsolete CRA/webpack packages only after equivalent Vite behavior is in place, commonly `react-scripts`, `webpack`, `webpack-dev-server`, `html-webpack-plugin`, `craco`, or `react-app-rewired` when no longer used.
7. Remove obsolete CRA/webpack files after their behavior is migrated. For example, delete `src/setupProxy.js` or `setupProxy.js` when the proxy has moved into `vite.config.*`; delete stale CRA env/type files only when equivalent Vite typing/config is present.
8. Update README/docs for changed Vite behavior:

- If a proxy is mentioned, state that the dev proxy is configured in `vite.config.*`.
- Replace CRA/react-scripts commands and explanations with the current Yarn/Vite scripts.
- Remove references to obsolete files such as `setupProxy.js` after deleting them.
- Update environment variable names and examples to use Vite conventions.

9. Check for:

- ESM-only packages or config files.
- Deprecated config options.
- `define`, `server`, `preview`, `build`, `optimizeDeps`, and `test` option changes.
- Environment variable access and prefixes.
- Rollup output and plugin API changes.
- Wildcard re-exports from CommonJS or uncertain packages.
- Node polyfill assumptions inherited from CRA/Webpack.
- Browser-side `require(...)`, especially in dev helpers such as why-did-you-render.

10. Verify `yarn build`, test scripts, and a start-server smoke check.

### Vite/Rolldown CJS Re-export Rule

Vite 8 with Rolldown is stricter about static ESM export analysis than CRA/Webpack. Do not keep wildcard re-exports from CommonJS or uncertain packages in app code.

Known finding: `@eyeseetea/d2-api/2.41` can be effectively consumed as CommonJS. A local barrel like this is unsafe:

```ts
export * from "@eyeseetea/d2-api/2.41";
```

Why it may have worked before: CRA/Webpack is more permissive with CJS/ESM interop and often tolerates dynamic CommonJS export patterns.

Why Vite/Rolldown can fail: Rolldown cannot safely analyze `export *` from dynamic CommonJS exports. It can warn that exports may be dropped and, in dev, fail startup with a message like `Unable to interop export * ... may lose module exports`.

Safe migration rule:

1. Avoid `export * from "<cjs-or-uncertain-package>"` in app code.
2. Replace with explicit exports:

```ts
export { A, B } from "@eyeseetea/d2-api/2.41";
export type { T1, T2 } from "@eyeseetea/d2-api/2.41";
```

3. Prefer a local compatibility barrel, such as `src/types/d2-api.ts`, so the rest of the app imports from one stable place.

This keeps exports deterministic and bundler-compatible across Vite/Rolldown.

### Node Polyfills in CRA to Vite Migrations

When migrating from CRA to Vite, treat Node polyfills as an explicit compatibility layer, not a default.

1. Start with no polyfills and run both `yarn build` and Vite dev startup to surface real gaps.
2. Inventory Node usage from errors, imports, and dependencies. Look for `Buffer`, `process`, `stream`, `crypto`, `path`, `util`, and similar Node APIs.
3. Prefer replacing Node-only code in browser paths when feasible.
4. For unavoidable runtime dependencies, add `vite-plugin-node-polyfills` and scope it narrowly:

- Include only required modules.
- Enable only required globals, such as `Buffer`, `process`, or `global`.

5. Keep one app-level polyfill entry, such as `src/polyfills.ts`, imported first in the app bootstrap for any custom shims.
6. Replace CRA-specific env/runtime assumptions:

```ts
// CRA
process.env.NODE_ENV;
process.env.REACT_APP_API_URL;

// Vite
import.meta.env.DEV;
import.meta.env.PROD;
import.meta.env.VITE_API_URL;
```

7. Validate both dev and production paths:

- `yarn start` smoke flow in browser.
- `yarn build` bundle success.
- Tests and lint unchanged.

8. Document each polyfill with:

- Which dependency needs it.
- Where it is configured.
- Acceptance criteria to remove it later.

9. Keep polyfills minimal. Avoid broad "polyfill everything" configs unless unblocking a short-term release and document that tradeoff.

A practical starting point for many CRA migrations is `buffer`, `process`, and `stream`, then trim or extend based on actual build and runtime errors.

### Browser-side require is not defined

After CRA to Vite migration, browser-side files cannot rely on CommonJS `require(...)`. This often appears in dev helpers, including why-did-you-render setup.

Detect it with:

- Runtime error: `Uncaught ReferenceError: require is not defined`.
- Search: `rg -n "require\\(" src`.

Migration rules:

1. If the import is dev-only or optional, use a guarded dynamic import:

```ts
if (import.meta.env.DEV) {
  import("some-package").then((mod) => {
    const pkg = mod.default ?? mod;
    // use pkg
  });
}
```

2. If it must always load, switch to static ESM imports:

```ts
import pkg from "some-package";
import { fn } from "some-package";
```

3. Replace CRA env checks:

```ts
// CRA
process.env.NODE_ENV === "development";

// Vite
import.meta.env.DEV;
```

4. Keep Node-only code out of browser entry paths. If unavoidable, polyfill explicitly in Vite config with `vite-plugin-node-polyfills` rather than relying on `require`.
5. Re-verify with `yarn build`, `yarn start` browser smoke, tests, and lint.

Template for why-did-you-render:

```ts
import React from "react";

if (import.meta.env.DEV) {
  import("@welldone-software/why-did-you-render").then(({ default: wdyr }) => {
    wdyr(React, { trackAllPureComponents: true });
  });
}
```

If why-did-you-render relies on React's automatic JSX runtime, also verify the Vite React plugin setup. A common dev-only pattern is:

```ts
react({
  jsxImportSource: mode === "development" ? "@welldone-software/why-did-you-render" : "react",
});
```

Update README notes to point at the local wdyr setup file so developers know where to customize or disable it.

### Environment Variables after Vite Migration

After CRA or webpack migration to Vite, verify every environment variable reference in code, docs, examples, CI, Docker/devcontainer files, deployment manifests, and `.env*` templates.

Search for old access patterns:

```bash
rg -n "process\\.env|REACT_APP_|NODE_ENV|PUBLIC_URL" .
```

Migration rules:

1. Replace browser-side `process.env` access with `import.meta.env`.
2. Replace CRA public variables from `REACT_APP_*` to `VITE_*` unless a deliberate compatibility bridge is documented.
3. Replace mode checks:

```ts
// CRA
process.env.NODE_ENV === "development";
process.env.NODE_ENV === "production";

// Vite
import.meta.env.DEV;
import.meta.env.PROD;
import.meta.env.MODE;
```

4. Replace `process.env.REACT_APP_FOO` with `import.meta.env.VITE_FOO`.
5. Replace CRA `PUBLIC_URL` assumptions with Vite `base`, `import.meta.env.BASE_URL`, or explicit asset URLs.
6. Update `.env`, `.env.local`, `.env.example`, README files, CI variables, deployment docs, and secret-management references so names match the migrated code.
7. Add or update `ImportMetaEnv` typing for TypeScript projects when the app expects specific env variables.
8. Prefer a local config/env module for app-specific environment values instead of scattering `import.meta.env` throughout the app. Keep validation, defaults, and type narrowing there; do not defer default values to later UI or domain code.
9. For variant/build scripts that used `REACT_APP_*`, set the equivalent `VITE_*` names before calling Vite scripts.
10. Verify env behavior in both dev and production builds. A variable can work in `yarn start` and still be missing from `yarn build` output if prefixes or deployment injection differ.

## DHIS2 CLI and Native Fetch Compatibility

When upgraded DHIS2 API clients or Node versions move CLI code onto native `fetch`, URLs with embedded credentials can fail with errors like `Request cannot be constructed from a URL that includes credentials`.

Migration rule:

1. Search CLI and script entrypoints for DHIS2 URLs that may include `username:password@host`.
2. Parse URL credentials explicitly with `new URL(...)`.
3. Pass credentials through the API client's supported auth option instead of leaving them embedded in `baseUrl`.
4. Preserve the original command UX when possible, but add validation and usage errors if credentials are required.
5. Verify affected scripts directly, not only the webapp. Examples: `yarn migrate`, scheduler CLI scripts, package/build variant scripts, or any project-specific DHIS2 CLI command.

## Webapp Runtime Verification

For webapps, run a runtime smoke check after build/test verification when feasible:

1. Start the app with `yarn start` using the upgraded Node version.
2. Open the app in a browser.
3. If Chrome DevTools MCP is available, use it to verify the page loads and inspect console output.
4. Treat startup failures, blank screens, failed module loads, and suspicious console errors as verification failures to investigate before continuing.
5. Stop the dev server before finishing unless the user asks to keep it running.

## Jest to Vitest Migration

When a Vite migration or test-tooling modernization finds Jest, migrate to Vitest unless the user asks to keep Jest or a specific Jest-only dependency blocks migration.

1. Query latest `vitest`, `jsdom`, and coverage plugin versions. Add `@vitest/coverage-v8` if coverage is required.
2. Replace Jest dependencies that are no longer needed, commonly `jest`, `babel-jest`, `ts-jest`, `jest-environment-jsdom`, `identity-obj-proxy`, and CRA-provided Jest through `react-scripts`.
3. Update scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

Preserve the repository's existing script names where possible.

4. Move Jest config into `vitest.config.*` or the `test` block in `vite.config.*`. Preserve:

- `environment: "jsdom"` for React DOM tests.
- Setup files such as `setupTests.ts`.
- Path aliases and module resolution.
- Coverage include/exclude rules and thresholds when supported.
- Test include/exclude patterns.
- Global test APIs only if existing tests rely on unimported `describe`, `it`, `expect`, or `vi`.

5. Update test code where needed:

- Replace `jest.fn`, `jest.mock`, `jest.spyOn`, and timers with `vi.fn`, `vi.mock`, `vi.spyOn`, and `vi.useFakeTimers`.
- Import `vi`, `describe`, `it`, `expect`, and lifecycle helpers from `vitest` unless `globals: true` is deliberately configured.
- Replace Jest-specific module mock patterns with Vitest-compatible mocks.
- Keep React Testing Library setup, `@testing-library/jest-dom`, and cleanup behavior working.

6. Update TypeScript and ESLint test globals/types:

- Add `vitest/globals` only when using Vitest globals.
- Replace Jest ESLint environment/globals with Vitest equivalents.
- Remove Jest type packages when no longer used.

7. Run the migrated test script and fix behavioral differences before continuing.

## Cypress and E2E Assessment

If the repository has Cypress or another E2E suite, first evaluate whether it is actively used before spending migration effort on it.

Check:

- `package.json` scripts and dependencies.
- CI workflows and release pipelines.
- Cypress config/support files and test folders.
- README/developer docs.
- Recent commits or project conventions if available.

Decision rules:

- If E2E is clearly in use, migrate it deliberately: update env variable names, align commands with the Vite dev server, account for installed-version API changes, and run the practical E2E command.
- If E2E appears unused, stale, or deprecated, remove Cypress dependencies, scripts, config/support files, and README references as part of modernization.
- If usage is unclear or removing it could affect team workflows, ask the user what to do before preserving or deleting it.
- If E2E is kept but not verified, document exactly why and what remains to test.

## ESLint

1. Query latest ESLint and related parser/plugin versions.
2. If the repo already uses flat config, update that config in place.
3. If the repo uses `.eslintrc*`, decide whether migration to flat config is required by the target ESLint version or desired by the user.
4. Preserve effective behavior intentionally:

- Ignore patterns.
- Browser, Node, Jest/Vitest, and React globals.
- TypeScript parser and `parserOptions.project` behavior.
- React hooks rules.
- Import resolution.
- Prettier or formatting integration.

5. For flat config, use compatibility helpers only when they reduce risk for legacy shareable configs.
6. Verify `yarn lint`; run tests if parser/config changes affect test files.

## DHIS2 I18n

Replace deprecated packages:

- Remove `@dhis2/d2-i18n-extract`.
- Remove `@dhis2/d2-i18n-generate`.
- Add latest `@dhis2/cli-app-scripts`.

Update scripts to call:

```json
{
  "scripts": {
    "localize": "d2-app-scripts i18n extract"
  }
}
```

Preserve extra flags only after confirming equivalents in `d2-app-scripts i18n extract --help` or DHIS2 docs. Run `yarn localize` and inspect generated locale diffs.

## Optional: TypeScript

When requested, upgrade `typescript`, type packages, ESLint TypeScript packages, test type integrations, and framework type packages as a group. Check:

- `module`, `moduleResolution`, `target`, `lib`, `jsx`, `types`, and `skipLibCheck`.
- Project references and declaration output for libraries.
- Source code failures caused by stricter checks or library type changes.

Ensure `package.json` has a typecheck script:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

Run `yarn typecheck` as part of the important checks after TypeScript, Vite, ESLint, Node, or dependency changes.

If this script is added, update README test/check instructions to include `yarn typecheck` alongside the existing test, lint, and build commands.

## Optional: Outdated Dependencies

Use package-manager-native checks and package metadata. Group upgrades by ecosystem:

- DHIS2 packages.
- React and UI packages.
- Build/test tooling.
- Lint/format tooling.
- Runtime utility dependencies.

Read release notes for major upgrades. Avoid unrelated broad rewrites; keep each group verifiable.

After large dependency migrations, run an unused/missing dependency checker such as `knip` or `depcheck` when feasible. Treat the output as triage, not automatic truth:

- Fix direct missing dependencies that are genuinely imported by project code or config.
- Remove unused runtime dependencies when verified; these affect bundle size and security surface.
- Be cautious with devDependency false positives from tooling configs.
- Document pre-existing or noisy findings instead of expanding the PR indefinitely.
- Consider bundle analysis or BundleMon-style reporting when dependency changes are large or runtime dependencies were removed.

## Optional: Vulnerable Dependencies

Run an audit command appropriate to the package manager. Triage each issue:

- Direct dependency with non-breaking fix: upgrade it.
- Direct dependency requiring a major upgrade: inspect release notes and verify thoroughly.
- Transitive dependency: prefer upgrading the parent dependency or using package-manager resolutions only when justified.
- No available compatible fix: document residual risk and affected path.

Do not apply forceful audit fixes that perform uncontrolled major upgrades without reviewing the proposed changes first.

## Reporting

In the final response, include:

- Modernization slices completed.
- Scripts run and their pass/fail status.
- Any scripts not run and why.
- Any remaining optional or blocked work.
