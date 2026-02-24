## 1. Hook: Handled State Tracking

- [x] 1.1 [FE] Add `handledPaths: Set<string>` state to `useJsonDiffSelector` hook and expose it in `JsonDiffSelectorState`
- [x] 1.2 [FE] Update `handleChangeSelection` in `useJsonDiffSelector` to add the path to `handledPaths` when a selection is made
- [x] 1.3 [FE] Add derived values: `handledCount` and `totalCount` to the hook's return type
- [x] 1.4 [FE] Clear `handledPaths` when `jsonDiffs` changes (new file upload resets state)

## 2. Hook: Filter Logic

- [x] 2.1 [FE] Add `filterStatus` state (`"all" | "unhandled" | "handled"`) to `useJsonDiffSelector`, defaulting to `"all"`
- [x] 2.2 [FE] Add `setFilterStatus` setter and `filteredDiffs` derived array to the hook's return type
- [x] 2.3 [FE] Implement `filteredDiffs` using `useMemo` to filter `jsonDiffs` based on `filterStatus` and `handledPaths`

## 3. UI: Visual Indicators for Handled State

- [x] 3.1 [FE] Update `ChangeItem` styled component to accept an `isHandled` prop that applies green left border and reduced opacity
- [x] 3.2 [FE] Add a checkmark icon to `ChangeItem` when `isHandled` is true
- [x] 3.3 [FE] Pass `handledPaths` from the hook through `DiffSection` to the `ChangeList` rendering and set `isHandled` per item

## 4. UI: Progress Indicator and Filter Controls

- [x] 4.1 [FE] Update `ChangeControlsTitle` in `DiffSection` to display progress as "X / Y handled" alongside the existing change count
- [x] 4.2 [FE] Add a segmented toggle control (All | Unhandled | Handled) above the `ChangeList` in `DiffSection`
- [x] 4.3 [FE] Wire the filter toggle to `setFilterStatus` and render `filteredDiffs` instead of `jsonDiffs` in the change list

## 5. Specs Update

- [x] 5.1 [FE] Update `openspec/specs/comparator-ui/spec.md` to reflect the new handled-state and filter requirements
- [x] 5.2 [FE] Create `openspec/specs/difference-interaction-tracking/spec.md` from the delta spec
