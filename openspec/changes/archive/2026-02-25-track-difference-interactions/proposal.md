## Why

The comparator UI displays a list of differences between two metadata files, but users have no way to distinguish which differences they've already reviewed from those still pending. When working through large metadata files with many differences, users lose track of their progress and may inadvertently skip or re-review items.

## What Changes

- Add a "handled" state to each difference item, tracked separately from the left/right selection
- Automatically mark a difference as handled when the user makes a selection (clicks "Use Left" or "Use Right")
- Provide a visual indicator (e.g., muted styling, checkmark, or distinct border) on handled items so they're clearly distinguishable from unreviewed ones
- Add a progress summary showing how many differences have been handled vs total
- Persist handled state in component state for the duration of the session (resets on page reload or new file upload)
- Allow users to filter the change list to show only unhandled differences

## Capabilities

### New Capabilities

- `difference-interaction-tracking`: Tracks which differences the user has reviewed or acted on, provides visual distinction between handled and unhandled items, and exposes a progress summary and filtering controls.

### Modified Capabilities

- `comparator-ui`: The change list rendering in DiffSection needs to incorporate handled/unhandled visual states and filtering controls. The existing `selectedChanges` state will be complemented by a new `handledChanges` set.

## Impact

- **Components**: `DiffSection.tsx` — change list rendering, styled components for handled/unhandled states, filter controls, progress indicator
- **Hooks**: `useJsonDiffSelector.tsx` — new `handledChanges` state (Set of paths), derived counts, filter logic
- **No new dependencies** — uses existing React state primitives
- **No API or CLI changes** — purely UI-side enhancement
