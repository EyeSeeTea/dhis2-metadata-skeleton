# Delta Specs

Place spec deltas for this change here.

## How to write delta specs
- Focus on what changes relative to baseline specs.
- Be explicit about:
  - CLI commands/flags/aliases
  - Folder/output contract changes
  - Deduplication key and conflict resolution
  - Comparator preload mechanism (`public/.tmp`) and UI fallback

## Suggested structure
- `metadata-build.md` (if build changes)
- `metadata-compare.md` (if compare changes)
- `comparator-ui.md` (if UI behavior changes)

Reference baseline specs for unchanged behavior:
- `../../specs/metadata-build/spec.md`
- `../../specs/metadata-compare/spec.md`
- `../../specs/comparator-ui/spec.md`
