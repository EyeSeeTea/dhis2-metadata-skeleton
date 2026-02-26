## MODIFIED Requirements

### Requirement: Comparison & Merge UX (Behavioral Requirements)

Minimum requirements:
- Display both JSON documents for inspection (editor or viewer).
- Provide a representation of differences (diff view, highlighted changes, or structured diff).
- Support a user-driven merge outcome (e.g., choosing one side for a section or applying selected changes).
- The change list SHALL visually distinguish between differences the user has explicitly acted on (handled) and those still pending review (unhandled).
- The change list header area SHALL include a progress indicator showing handled count vs total count.
- The change list SHALL support filtering by handled status (All, Unhandled, Handled) with "All" as the default.
- When the comparator loads with differences, no side SHALL be pre-selected for any difference. Both "Use Left" and "Use Right" buttons SHALL appear in their inactive state until the user makes an explicit choice.
- The merged output SHALL use the left-side value as a fallback for differences where the user has not yet made an explicit selection.

Non-requirements:
- No requirement for semantic DHIS2 validation.
- No requirement for server persistence.
- No requirement for persisting handled state across browser sessions.

#### Scenario: Initial state shows no pre-selected side
- **WHEN** the comparator loads with differences between two JSON files
- **THEN** every difference in the change list SHALL display both "Use Left" and "Use Right" buttons in their inactive (unhighlighted) state

#### Scenario: User selects a side for a difference
- **WHEN** the user clicks "Use Left" or "Use Right" on a difference
- **THEN** the clicked button SHALL appear in its active (highlighted) state and the other button SHALL remain inactive

#### Scenario: Merged output for unselected differences
- **WHEN** a difference has no explicit side selection
- **THEN** the merged output SHALL use the left-side value as the fallback
