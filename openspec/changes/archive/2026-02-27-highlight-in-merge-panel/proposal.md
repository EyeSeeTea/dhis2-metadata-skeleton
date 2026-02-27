## Why

When reviewing large metadata files with many differences, the Merge Result panel gives no visual indication of which parts were affected by changes or what decisions were made. Users must mentally map between the "Select Changes" list and the merged JSON output, making it hard to verify merge decisions and spot unresolved items.

## What Changes

- Hovering a change item in the "Select Changes" panel highlights the corresponding path in the "Merge Result" panel. Only the focused item's block is highlighted — no other diffs are decorated.
- Clicking a change item scrolls the "Merge Result" editor to the corresponding location.
- The focused block uses color-coded highlighting by change type: green for added, red for removed, yellow for modified.
- The focused block shows a gutter glyph: a directional arrow (left/right) if handled, or a warning icon if unhandled.
- Handled changes in the "Select Changes" panel show a directional chevron icon (left or right) next to the diff type badge, indicating which file's value was chosen.

## Capabilities

### New Capabilities
- `merge-result-highlighting`: Focus-driven highlighting and annotation of change-affected sections in the Merge Result panel — only the hovered change item's block is highlighted with a color-coded background and gutter glyph, synchronized via hover/click from the Select Changes panel.

### Modified Capabilities
- `comparator-ui`: The Merge Result panel gains focus-driven highlighting and scroll-to-path synchronization. The Select Changes panel gains directional chevron icons on handled change items indicating which file was chosen.

## Impact

- **UI components**: `DiffSection`, `MergeResult` (or equivalent merge output component), `ChangeItem` — new event handlers and visual overlays.
- **Hooks**: `useJsonDiffSelector` — needs to expose active/focused path state; new hook or extension for scroll synchronization.
- **State**: New Zustand or hook-level state for the currently focused difference path.
- **Dependencies**: No new external dependencies expected — uses existing Monaco Editor decoration API or custom CSS overlays.
- **No CLI impact**: Changes are entirely within the webapp comparator.
