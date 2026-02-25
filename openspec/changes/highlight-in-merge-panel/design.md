## Context

The comparator UI has two main panels in the lower section: a Monaco Editor showing the merged JSON result (77.5% width) and the "Select Changes" panel (22.5% width) listing all detected differences. Currently, there is no visual connection between these two panels — the user must mentally map a change path (e.g., `metadata.elements[id:abc].name`) to the corresponding line in the merged JSON editor.

The merge result editor uses Monaco Editor in editable JSON mode with pretty-printed output. The Select Changes panel renders `ChangeItem` styled components with click handlers for "Use Left" / "Use Right". State is managed via `useJsonDiffSelector` (diff selections, handled paths) and `useComparator` (merged JSON, text formatting).

## Goals / Non-Goals

**Goals:**
- Provide visual synchronization between the Select Changes panel and the Merge Result editor
- Add inline annotations in the Merge Result for change-affected lines (color highlights, direction arrows, unhandled icons)
- Keep all new logic in hooks/viewmodels per the project's clean architecture (zero business logic in components)

**Non-Goals:**
- Reverse synchronization (clicking in editor to highlight change item) — future enhancement
- Persisting focused state across sessions
- Modifying the DiffEditor (top split view) — only the bottom Merge Result panel is affected
- Adding new external dependencies

## Decisions

### 1. Use Monaco Editor decorations API for highlighting

**Decision**: Use `editor.deltaDecorations()` to apply background color and margin glyphs to lines in the merged result editor.

**Rationale**: Monaco's decoration API is purpose-built for this. It supports:
- Background/line highlighting with CSS classes
- Margin glyphs (icons in the gutter) for arrows and warning icons
- Reveal range (scroll-to-line) for focus synchronization

**Alternatives considered**:
- CSS overlay div positioned over the editor: fragile, breaks on scroll/resize, hard to align with editor lines
- Replace Monaco with a custom JSON renderer: massive effort, loses editor features (edit, format, minimap)

### 2. Introduce a `useMergeHighlighting` hook for all new state and logic

**Decision**: Create a new hook `useMergeHighlighting` that owns:
- `focusedPath: string | null` — currently hovered/clicked path from Select Changes
- `editorRef: IStandaloneCodeEditor | null` — Monaco editor instance captured via `onMount`
- Path-to-line-range mapping logic (parsing `mergedText` to find where each diff path appears)
- Decoration computation and application

**Rationale**: Follows the project's pattern of logic-in-hooks. `useJsonDiffSelector` already handles diff selection; this new hook handles the visual mapping layer without entangling the two concerns.

### 3. Compute path-to-line mappings from the pretty-printed merged text

**Decision**: When `mergedText` changes, parse the formatted JSON string to build a map from diff paths to `{startLine, endLine}` ranges.

**Approach**: Walk the pretty-printed JSON text line-by-line, tracking the current key path using indentation and key parsing. For each known diff path, record the line range where its value appears.

**Rationale**: The merged text is always `JSON.stringify(obj, null, 2)` output, which has predictable indentation (2-space). This makes line-to-path mapping deterministic without needing a full JSON AST parser.

### 4. Use CSS classes injected via Monaco's `defineTheme` or `addCommand` for coloring

**Decision**: Define custom CSS classes for decoration styles:
- `.highlight-added` — green background (#e6ffec / rgba)
- `.highlight-removed` — red background (#ffebe9 / rgba)
- `.highlight-modified` — yellow background (#fff8c5 / rgba)
- `.highlight-focused` — brighter version of the type color with a subtle border
- Gutter glyphs for: left arrow, right arrow, warning (unhandled)

**Rationale**: Monaco decorations reference CSS class names. Defining them once in a stylesheet keeps styling separate from logic.

### 5. Expose `onChangeItemHover` and `onChangeItemClick` event props from DiffSection

**Decision**: Add `onMouseEnter`/`onMouseLeave` handlers on each `ChangeItem` styled component, forwarding the diff path to the `useMergeHighlighting` hook via callbacks.

Click on a ChangeItem sets `focusedPath` persistently (until another is clicked or user clicks away). Hover temporarily overrides focus for preview.

### 6. Pass diff metadata alongside merged text for annotation computation

**Decision**: The `useMergeHighlighting` hook receives `jsonDiffs`, `selectedChanges`, `handledPaths`, and `mergedText` to compute which lines need which decorations.

For each diff path found in the merged text:
- Apply the change-type background color (added/removed/modified)
- If handled: show a left or right arrow glyph based on `selectedChanges[path]`
- If unhandled: show a warning/pending glyph

## Risks / Trade-offs

- **[Performance with large files]** → Line mapping recomputes on every `mergedText` change. Mitigate by debouncing decoration updates and using `useMemo` for the path-line map.
- **[Path matching accuracy]** → Array items with `[id:xxx]` notation need careful matching against pretty-printed JSON. Mitigate by reusing the existing `parsePath` utility from jsonUtils.
- **[Monaco decoration flicker]** → Rapid hover changes may cause visible flicker. Mitigate by batching decoration updates with `requestAnimationFrame` or a short debounce (16ms).
- **[Removed paths not in merged text]** → "Removed" diffs won't have a corresponding line in the merged output (the key is gone). Mitigate by showing these only in the Select Changes panel with a visual note, or by showing the nearest parent path's line range.
