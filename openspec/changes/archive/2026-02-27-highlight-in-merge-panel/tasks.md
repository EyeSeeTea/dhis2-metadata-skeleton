## 1. Path-to-Line Mapping Utility

- [x] 1.1 [FE] Create `buildPathToLineMap` utility function in `src/webapp/components/comparator/hooks/utils/` that parses pretty-printed JSON text (2-space indent) and returns a `Record<string, { startLine: number; endLine: number }>` mapping diff paths to their line ranges
- [x] 1.2 [FE] Handle array items with `[id:xxx]` notation in path matching, reusing existing `parsePath` logic from `jsonUtils.ts`
- [x] 1.3 [FE] Add unit tests (Vitest) for `buildPathToLineMap` covering: simple object paths, nested paths, array-with-id paths, removed paths (no match returns undefined), and multi-line value spans

## 2. CSS Decoration Classes

- [x] 2.1 [FE] Define CSS classes for Monaco editor decorations: `.highlight-added` (green background, 25% opacity), `.highlight-removed` (red background, 25% opacity), `.highlight-modified` (yellow background, 25% opacity). No separate `.highlight-focused` class needed since only the focused block is decorated.
- [x] 2.2 [FE] Define CSS for gutter glyph icons: left arrow (handled + "Use Left"), right arrow (handled + "Use Right"), and warning icon (unhandled)

## 3. useMergeHighlighting Hook

- [x] 3.1 [FE] Create `useMergeHighlighting` hook in `src/webapp/components/comparator/hooks/` that accepts `mergedText`, `jsonDiffs`, `selectedChanges`, `handledPaths`, and `focusedPath`
- [x] 3.2 [FE] Implement path-to-line mapping computation using `buildPathToLineMap`, memoized on `mergedText` changes
- [x] 3.3 [FE] Implement focus-driven decoration computation: when `focusedPath` is set, find the matching diff and produce a single Monaco `IModelDeltaDecoration` with the correct background class and gutter glyph. When `focusedPath` is unset, produce no decorations.
- [x] 3.4 [FE] Expose an `editorRef` callback (`onEditorMount`) to capture the Monaco editor instance, and a `scrollToPath(path: string)` function that calls `editor.revealLineInCenter()`
- [x] 3.5 [FE] Apply decorations via `editor.deltaDecorations()` whenever the computed decorations change, batching with `requestAnimationFrame` to prevent flicker

## 4. DiffSection Integration

- [x] 4.1 [FE] Add `focusedPath` state (via `useState`) to DiffSection and wire `onMouseEnter` / `onMouseLeave` on each `ChangeItem` to set/clear the focused path
- [x] 4.2 [FE] Add `onClick` handler on each `ChangeItem` that calls `scrollToPath(diff.path)` from the `useMergeHighlighting` hook
- [x] 4.3 [FE] Pass the `onEditorMount` callback from `useMergeHighlighting` to the Monaco Editor's `onMount` prop in the Merge Result section
- [x] 4.4 [FE] Wire `useMergeHighlighting` into DiffSection, passing all required state from `useJsonDiffSelector` and the local `focusedPath`
- [x] 4.5 [FE] Add directional chevron icon (`ChevronLeft` / `ChevronRight`) to each handled ChangeItem card, displayed next to the diff type badge to indicate which file's value was chosen

## 5. Removed-Path Handling

- [x] 5.1 [FE] In `buildPathToLineMap`, when a diff path is not found in the merged text, attempt to find the nearest parent path and return its line range as a fallback
- [x] 5.2 [FE] Add unit test for parent-path fallback behavior

## 6. Testing and Verification

- [x] 6.1 [FE] Add unit tests (Vitest) for `computeDecorations`: verify no decorations when focusedPath is unset, correct decoration class for the focused diff type (added/removed/modified), correct glyph for handled vs unhandled state, and only the focused diff produces a decoration
- [x] 6.2 [FE] Manual verification: load two JSON files with mixed add/remove/modify diffs, confirm that hovering a change item highlights only that block, clicking scrolls to the correct location, gutter icons appear for the focused block, and directional chevrons appear in handled cards
