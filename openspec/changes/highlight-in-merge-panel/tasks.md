## 1. Path-to-Line Mapping Utility

- [ ] 1.1 [FE] Create `buildPathToLineMap` utility function in `src/webapp/components/comparator/hooks/utils/` that parses pretty-printed JSON text (2-space indent) and returns a `Record<string, { startLine: number; endLine: number }>` mapping diff paths to their line ranges
- [ ] 1.2 [FE] Handle array items with `[id:xxx]` notation in path matching, reusing existing `parsePath` logic from `jsonUtils.ts`
- [ ] 1.3 [FE] Add unit tests (Vitest) for `buildPathToLineMap` covering: simple object paths, nested paths, array-with-id paths, removed paths (no match returns undefined), and multi-line value spans

## 2. CSS Decoration Classes

- [ ] 2.1 [FE] Define CSS classes for Monaco editor decorations: `.highlight-added` (green background), `.highlight-removed` (red background), `.highlight-modified` (yellow background), and `.highlight-focused` (emphasized variant for hover)
- [ ] 2.2 [FE] Define CSS for gutter glyph icons: left arrow (handled + "Use Left"), right arrow (handled + "Use Right"), and warning icon (unhandled)

## 3. useMergeHighlighting Hook

- [ ] 3.1 [FE] Create `useMergeHighlighting` hook in `src/webapp/components/comparator/hooks/` that accepts `mergedText`, `jsonDiffs`, `selectedChanges`, `handledPaths`, and `focusedPath`
- [ ] 3.2 [FE] Implement path-to-line mapping computation using `buildPathToLineMap`, memoized on `mergedText` changes
- [ ] 3.3 [FE] Implement decoration computation: for each diff path with a line range, produce a Monaco `IModelDeltaDecoration` with the correct background class and gutter glyph based on change type, handled status, and selection direction
- [ ] 3.4 [FE] Implement focused-path emphasis: when `focusedPath` is set, apply the `.highlight-focused` class to that path's line range in addition to the base decoration
- [ ] 3.5 [FE] Expose an `editorRef` callback (`onEditorMount`) to capture the Monaco editor instance, and a `scrollToPath(path: string)` function that calls `editor.revealLineInCenter()`
- [ ] 3.6 [FE] Apply decorations via `editor.deltaDecorations()` whenever the computed decorations change, batching with `requestAnimationFrame` to prevent flicker

## 4. DiffSection Integration

- [ ] 4.1 [FE] Add `focusedPath` state (via `useState`) to DiffSection and wire `onMouseEnter` / `onMouseLeave` on each `ChangeItem` to set/clear the focused path
- [ ] 4.2 [FE] Add `onClick` handler on each `ChangeItem` that calls `scrollToPath(diff.path)` from the `useMergeHighlighting` hook
- [ ] 4.3 [FE] Pass the `onEditorMount` callback from `useMergeHighlighting` to the Monaco Editor's `onMount` prop in the Merge Result section
- [ ] 4.4 [FE] Wire `useMergeHighlighting` into DiffSection, passing all required state from `useJsonDiffSelector` and the local `focusedPath`

## 5. Removed-Path Handling

- [ ] 5.1 [FE] In `buildPathToLineMap`, when a diff path is not found in the merged text, attempt to find the nearest parent path and return its line range as a fallback
- [ ] 5.2 [FE] Add unit test for parent-path fallback behavior

## 6. Testing and Verification

- [ ] 6.1 [FE] Add unit tests (Vitest) for `useMergeHighlighting` decoration computation: verify correct decoration classes are produced for added/removed/modified diffs, handled vs unhandled, and left vs right selections
- [ ] 6.2 [FE] Manual verification: load two JSON files with mixed add/remove/modify diffs, confirm color highlights appear in Merge Result, hover sync works, click scrolls to correct location, and gutter icons reflect handled/unhandled state
