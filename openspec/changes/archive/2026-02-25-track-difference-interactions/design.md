## Context

The comparator UI renders a list of JSON differences in a `ChangeList` component inside `DiffSection.tsx`. Each `ChangeItem` shows a diff path, change type badge, value previews, and "Use Left"/"Use Right" buttons. The hook `useJsonDiffSelector` maintains a `selectedChanges: Record<string, "left" | "right">` state where every diff path starts as `"left"` by default.

Currently there is no distinction between a diff that was explicitly reviewed by the user and one that still has its default selection. A user working through 200+ differences cannot tell which ones they've consciously decided on.

## Goals / Non-Goals

**Goals:**

- Track which differences have been explicitly acted on by the user (clicked "Use Left" or "Use Right")
- Visually distinguish handled vs unhandled differences in the change list
- Show a progress indicator (e.g., "47 / 132 handled")
- Allow filtering the list to show only unhandled items
- Keep state in React component state (session-scoped, no persistence beyond page lifecycle)

**Non-Goals:**

- Persisting handled state across browser sessions (localStorage, IndexedDB, etc.)
- Adding undo/redo for individual selections
- Changing the merge logic — the existing left/right selection mechanism stays as-is
- Adding batch operations (e.g., "mark all as handled")

## Decisions

### 1. Tracked state: `Set<string>` alongside existing `selectedChanges`

**Decision**: Add a `handledPaths: Set<string>` to `useJsonDiffSelector`. When the user clicks a selection button, the diff's path is added to `handledPaths`.

**Rationale**: A Set is the simplest structure for membership checks. It stays separate from `selectedChanges` so the two concerns (which side is selected vs whether the user has reviewed it) don't get entangled. Since all diffs default to "left", we can't infer "handled" from the selection value alone.

**Alternatives considered**:
- Merging into `selectedChanges` as a tri-state (`"left" | "right" | "unreviewed"`) — rejected because it conflates selection with review status and would require changing the merge logic.
- Zustand store — rejected because the rest of the comparator doesn't use Zustand and the state is session-scoped with no need for cross-component access beyond props.

### 2. Visual indicator: reduced opacity + left-border color change

**Decision**: Handled items get a green left border and slightly muted text. Unhandled items keep the current primary-color border and full opacity. A small checkmark icon appears on handled items.

**Rationale**: Subtlety matters — the user needs to scan the list quickly. A border color change is the existing visual anchor (items already have a left border), and opacity reduction is perceptually lightweight. A checkmark provides redundant confirmation for accessibility.

**Alternatives considered**:
- Strikethrough text — rejected because the item is still meaningful; it's reviewed, not deleted.
- Moving handled items to a separate section — rejected because it disrupts the natural document order users rely on.

### 3. Filter control: toggle button above the change list

**Decision**: Add a toggle/segmented control above `ChangeList` with options: "All" | "Unhandled" | "Handled". Default is "All".

**Rationale**: A simple filter keeps the UI clean. Three states let users focus on remaining work ("Unhandled") or review their decisions ("Handled"). Placed above the list, adjacent to the existing count display in `ChangeControlsTitle`.

### 4. Progress indicator: inline in `ChangeControlsTitle`

**Decision**: Extend the existing "N changes" text to show "47 / 132 handled" alongside it.

**Rationale**: Reuses the existing header area without adding new UI regions. The fraction format is immediately understandable.

## Risks / Trade-offs

- **[Performance with large diff lists]** → The Set lookups are O(1) and filtering is O(n) per render. For typical metadata files (hundreds of diffs), this is negligible. If needed, `useMemo` on the filtered list guards against unnecessary re-renders.
- **[State loss on file re-upload]** → If the user uploads new files, diffs change and `handledPaths` becomes stale. Mitigation: clear `handledPaths` whenever `jsonDiffs` changes (already happens implicitly since the hook re-initializes on new file input).
- **[Default selection ambiguity]** → All diffs default to "left". A user who agrees with the left value for a diff still needs to click it to mark it handled. This is intentional — explicit review is the point — but may feel redundant. The filter to "Unhandled" helps users efficiently confirm defaults.
