# Proposal: <change-name>

## Summary
One paragraph describing what is changing and why.

## Motivation / Problem
- What problem are we solving?
- Who is affected (packagers, reviewers, maintainers)?
- What is the current behavior and its limitations?

## Goals
- [ ] Goal 1
- [ ] Goal 2

## Non-Goals
- [ ] Explicitly list what is not being attempted.

## User Impact
Describe how users will experience this change.
- CLI users:
- Comparator UI users:
- Repo maintainers:

## Compatibility & Migration
List any compatibility considerations and a migration plan.
- CLI surface (commands/flags/aliases):
- Folder contract (`capture/`, `visualizations/`, `permissions/`):
- Output contract (`output/*.json`):
- Deduplication contract (`id`-based):

If breaking:
- What breaks?
- How will users migrate?
- What is the deprecation path (if any)?

## Alternatives Considered
- Option A: ...
- Option B: ...
Why was the chosen approach selected?

## Risks & Mitigations
- Risk:
- Mitigation:

## Rollback Plan
How to revert safely if needed.

## Acceptance Criteria
- [ ] Specs updated (delta specs in `changes/<change-name>/specs/`)
- [ ] Code implemented and aligned with specs
- [ ] Tests updated/added and passing
- [ ] Documentation updated (if needed)
