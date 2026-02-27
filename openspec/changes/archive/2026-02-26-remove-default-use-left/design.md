## Context

The comparator UI's `useJsonDiffSelector` hook initializes every detected difference with `"left"` as the selected side. This happens in a `useEffect` that reduces all diff paths into a `Record<string, "left" | "right">` mapping. As a result, when a user opens the Select Changes panel, every "Use Left" button appears active — even though the user hasn't made any deliberate choice.

The `handledPaths` set (which tracks explicit user interactions) starts empty, so the handled/unhandled tracking already distinguishes deliberate clicks from the initial state. However, the `selectedChanges` state and the `SelectButton` `active` prop don't reflect this distinction visually.

## Goals / Non-Goals

**Goals:**
- Differences start in a visually unselected state (neither button highlighted)
- Users can clearly see which differences still need review
- The merged output remains valid while some differences are unselected (fall back to left-side values)

**Non-Goals:**
- Blocking download/export until all differences are explicitly selected
- Changing the merge algorithm or diff detection logic
- Adding new UI controls beyond modifying existing button states

## Decisions

**Decision 1: Use empty initial `selectedChanges` instead of pre-filling with "left"**

Initialize `selectedChanges` to `{}` instead of reducing all paths to `"left"`. A path absent from `selectedChanges` means "no selection made yet". This is the simplest change — it reuses the existing `Record<string, "left" | "right">` type without adding a third union member.

Alternative considered: Adding a `"none"` value to the union type (`"left" | "right" | "none"`). Rejected because it adds type complexity throughout the codebase for no functional benefit — an absent key already conveys "unselected".

**Decision 2: Keep left as the fallback in the merge computation**

The merged JSON effect already has a fallback branch for when `selection !== "right"` — it applies the left value. This behavior is correct for unselected paths: the base document is left, so an unselected diff naturally preserves the left value. No change needed to the merge logic.

**Decision 3: Neither button appears active when unselected**

When `selectedChanges[diff.path]` is `undefined`, both `SelectButton` `active` checks (`=== "left"` and `=== "right"`) evaluate to `false`. Both buttons render in their inactive style. This already works with the current `SelectButton` component — no styling changes needed.

## Risks / Trade-offs

- **[Minimal visual change risk]** The buttons already have distinct active/inactive styles. Unselected state just means both buttons are inactive (darker background). This might be subtle. → Mitigated by the existing handled/unhandled visual treatment (border color, opacity, checkmark icon) which already signals review status.
- **[Merge output unchanged for unselected paths]** Unselected differences default to left-side values in the merge. Users might not realize the merge already uses left values without explicit selection. → Acceptable because the handled count (0/N handled) clearly communicates that no choices have been made.
