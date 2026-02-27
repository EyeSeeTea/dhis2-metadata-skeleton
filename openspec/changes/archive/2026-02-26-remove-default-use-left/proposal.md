## Why

When the comparator loads differences, every diff is automatically initialized with "Use Left" selected. This makes it appear as if the user has already reviewed and decided on each change, when in fact no deliberate choice has been made. Users need a clear visual distinction between "not yet reviewed" and "explicitly chose left".

## What Changes

- Remove the automatic pre-selection of "Use Left" for all differences on load
- Differences start in an unselected state (neither left nor right chosen)
- The merged output requires all differences to have an explicit selection before it can be considered complete
- Unselected differences are visually distinct from those where a side has been chosen

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `comparator-ui`: The merge UX default selection behavior changes — differences no longer start pre-selected
- `difference-interaction-tracking`: The initial "handled" state must align with the new unselected default — all differences start as unhandled with no side chosen

## Impact

- `src/webapp/components/comparator/hooks/useJsonDiffSelector.tsx` — the `useEffect` that initializes `selectedChanges` to `"left"` for every diff path must change to an unselected state
- `src/webapp/components/comparator/DiffSection.tsx` — the button rendering must handle an unselected state where neither "Use Left" nor "Use Right" is active
- Merged JSON computation must handle unselected paths (either default to left as a fallback in the merge output, or require explicit selection)
