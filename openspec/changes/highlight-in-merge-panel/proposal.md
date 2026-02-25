## Why

When reviewing large metadata files with many differences, the Merge Result panel gives no visual indication of which parts were affected by changes or what decisions were made. Users must mentally map between the "Select Changes" list and the merged JSON output, making it hard to verify merge decisions and spot unresolved items.

## What Changes

- Hovering or clicking a change item in the "Select Changes" panel scrolls to and highlights the corresponding path in the "Merge Result" panel.
- The Merge Result panel annotates lines affected by changes with color-coded highlighting: green for added, red for removed, yellow for modified.
- Handled changes in the Merge Result show a directional indicator (arrow) reflecting whether "Use Left" or "Use Right" was chosen.
- Unhandled changes in the Merge Result show a warning icon so users can spot pending decisions without switching to the Select Changes panel.

## Capabilities

### New Capabilities
- `merge-result-highlighting`: Visual highlighting and annotation of change-affected sections in the Merge Result panel, including color-coded backgrounds, direction arrows, unhandled icons, and hover/click synchronization with the Select Changes panel.

### Modified Capabilities
- `comparator-ui`: The Merge Result panel gains new visual behaviors (highlighting, scroll-to-path, inline annotations) that extend the existing comparison & merge UX requirements.

## Impact

- **UI components**: `DiffSection`, `MergeResult` (or equivalent merge output component), `ChangeItem` — new event handlers and visual overlays.
- **Hooks**: `useJsonDiffSelector` — needs to expose active/focused path state; new hook or extension for scroll synchronization.
- **State**: New Zustand or hook-level state for the currently focused difference path.
- **Dependencies**: No new external dependencies expected — uses existing Monaco Editor decoration API or custom CSS overlays.
- **No CLI impact**: Changes are entirely within the webapp comparator.
