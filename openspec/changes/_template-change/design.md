# Design: <change-name>

## Overview
High-level description of the approach.

## Affected Specs / Contracts
List what parts of the spec surface are affected:
- [ ] CLI compare (`-f/-s`, temp preload mechanism)
- [ ] CLI build (input discovery, ignore rules, output naming)
- [ ] Comparator UI (preload vs upload, comparator-only mode)
- [ ] Folder/output contract
- [ ] Deduplication contract (`id`)

## Current Behavior (Baseline)
Summarize what the system does today (link to baseline specs):
- `openspec/specs/metadata-build/spec.md`
- `openspec/specs/metadata-compare/spec.md`
- `openspec/specs/comparator-ui/spec.md`

## Proposed Behavior
Describe the new behavior precisely, including examples.

### CLI
- Commands impacted:
- Flags impacted:
- Error cases:
- Diagnostics/logging:

### Filesystem
- Inputs:
- Ignore rules:
- Outputs:
- Temp files (`public/.tmp`):

### Deduplication / Merge Order
- What is the merge order?
- How are duplicates resolved?
- Any changes to key (`id`) or conflict resolution?

### Comparator UI
- How inputs are loaded (preload vs upload fallback):
- UX changes:
- Error handling:

## Data / Formats
Document any new or changed JSON shapes, files, folders, or naming conventions.

## Edge Cases
- Missing folders/files
- Invalid JSON
- Huge files
- Permission errors (read/write)
- Identical inputs for compare

## Observability / Diagnostics
What messages should appear for success/failure? Any structured logs?

## Security / Safety
Any new risks? (e.g., command injection in spawn, path traversal, large file DoS)

## Performance
Expected impact and any mitigations.

## Test Plan (Design Level)
List tests needed (unit, integration, optional UI). Tie each to acceptance criteria.
