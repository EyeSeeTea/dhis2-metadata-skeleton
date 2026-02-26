# Spec: Comparator UI (Vite + React)

## Scope

This spec defines the behavior of the browser-based comparator and merge UI, including how it loads inputs and how comparator-only mode behaves.

Out of scope:
- CLI preloading behavior (see `metadata-compare/spec.md`)
- Metadata build behavior (see `metadata-build/spec.md`)

---

## User Stories

1. As a reviewer, I can open the UI and upload two JSON files to compare.
2. As a reviewer, when launched via CLI preload, the UI starts with both files already loaded.
3. As a reviewer, I can inspect JSON differences and make merge decisions.

---

## Launch Modes

### Comparator-only mode
The UI supports a “comparator-only” mode intended to run without DHIS2 proxy/auth configuration.

- `yarn start-comparator` MUST start the UI in comparator-only mode.
- In comparator-only mode, the UI MUST NOT require DHIS2 authentication settings to start.

### Non-comparator mode
If the project supports other DHIS2 app behaviors, they are out of scope here; comparator-only mode is the guaranteed mode for OpenSpec.

---

## Input Loading

### Preloaded inputs
When launched via the CLI compare command, the UI MUST attempt to load:
- `public/.tmp/file1.json`
- `public/.tmp/file2.json`

If both exist and are valid JSON:
- The UI SHOULD auto-load them as the left/right comparison inputs.

If one or both are missing or invalid:
- The UI MUST gracefully fall back to manual upload workflow and show a clear message.

### Manual upload
The UI MUST allow the user to upload:
- a “left” JSON file
- a “right” JSON file

Files MUST be parsed as JSON. Parse errors MUST be shown to the user.

---

## Comparison & Merge UX (Behavioral Requirements)

Minimum requirements:
- Display both JSON documents for inspection (editor or viewer).
- Provide a representation of differences (diff view, highlighted changes, or structured diff).
- Support a user-driven merge outcome (e.g., choosing one side for a section or applying selected changes).
- The change list SHALL visually distinguish between differences the user has explicitly acted on (handled) and those still pending review (unhandled).
- The change list header area SHALL include a progress indicator showing handled count vs total count.
- The change list SHALL support filtering by handled status (All, Unhandled, Handled) with "All" as the default.
- When the comparator loads with differences, no side SHALL be pre-selected for any difference. Both "Use Left" and "Use Right" buttons SHALL appear in their inactive state until the user makes an explicit choice.
- The merged output SHALL use the left-side value as a fallback for differences where the user has not yet made an explicit selection.

Non-requirements:
- No requirement for semantic DHIS2 validation.
- No requirement for server persistence.
- No requirement for persisting handled state across browser sessions.

---

## Performance & Safety

- The UI SHOULD remain responsive for moderately large JSON files.
- If files are too large and cause issues, the UI SHOULD show a warning rather than failing silently.

---

## Tests (Optional)

UI tests are optional in this repo’s current maturity, but if added they SHOULD cover:
- manual upload happy path
- preload happy path (temp files exist)
- preload fallback (missing/invalid temp files)
