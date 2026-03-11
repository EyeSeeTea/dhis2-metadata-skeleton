# Tasks: <change-name>

> Keep tasks small and reviewable. Prefer checklists with clear outputs.

## Spec Tasks
- [ ] Add delta specs in `changes/<change-name>/specs/` describing the new behavior.
- [ ] If baseline specs need updating, update `openspec/specs/...` and reference changes.

## Implementation Tasks
- [ ] Update CLI command implementation
- [ ] Update filesystem repositories/helpers
- [ ] Update comparator preload mechanism (if needed)
- [ ] Update comparator UI behavior (if needed)

## Tests
- [ ] Add/modify Vitest unit tests for domain logic
- [ ] Add/modify tests for CLI behavior (mock spawn)
- [ ] (Optional) Add UI tests if feasible

## Docs
- [ ] Update README / usage docs if commands or workflow change
- [ ] Update `openspec/project.md` if architecture/contract changes

## Validation
- [ ] Run unit tests (`yarn test`)
- [ ] Manual validation:
  - [ ] `yarn metadata-build`
  - [ ] `yarn compare-metadata -f <file1> -s <file2>`
  - [ ] `yarn start-comparator` (upload flow)
