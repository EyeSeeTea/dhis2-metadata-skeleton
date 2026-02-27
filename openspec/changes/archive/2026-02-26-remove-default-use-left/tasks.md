## 1. Remove default "left" pre-selection in hook

- [ ] 1.1 [FE] Change the `useEffect` in `useJsonDiffSelector.tsx` to initialize `selectedChanges` to an empty object `{}` instead of reducing all diff paths to `"left"`

## 2. Ensure merge fallback handles unselected paths

- [ ] 2.1 [FE] Verify the merged JSON `useEffect` in `useJsonDiffSelector.tsx` correctly falls back to left-side values when `selectedChanges[diff.path]` is `undefined` (no code change expected — the existing `selection !== "right"` branch already covers this)

## 3. Verify button active states

- [ ] 3.1 [FE] Confirm that `SelectButton` in `DiffSection.tsx` renders both buttons as inactive when `selectedChanges[diff.path]` is `undefined` (no code change expected — `=== "left"` and `=== "right"` both return `false` for `undefined`)

## 4. Manual verification

- [ ] 4.1 [FE] Manually test: load two JSON files with differences, confirm all buttons start inactive and progress shows "0 / N handled"
- [ ] 4.2 [FE] Manually test: click "Use Left" or "Use Right" on a difference, confirm the button becomes active and the difference is marked as handled
- [ ] 4.3 [FE] Manually test: confirm the merged output is still valid with no selections (defaults to left-side values)

## 5. Update specs

- [ ] 5.1 [FE] Archive updated specs for `comparator-ui` and `difference-interaction-tracking` reflecting the new initial-state behavior
