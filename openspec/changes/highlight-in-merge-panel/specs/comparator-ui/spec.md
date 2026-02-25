## MODIFIED Requirements

### Requirement: Comparison & Merge UX (Behavioral Requirements)

Minimum requirements:
- Display both JSON documents for inspection (editor or viewer).
- Provide a representation of differences (diff view, highlighted changes, or structured diff).
- Support a user-driven merge outcome (e.g., choosing one side for a section or applying selected changes).
- The change list SHALL visually distinguish between differences the user has explicitly acted on (handled) and those still pending review (unhandled).
- The change list header area SHALL include a progress indicator showing handled count vs total count.
- The change list SHALL support filtering by handled status (All, Unhandled, Handled) with "All" as the default.
- The Merge Result editor SHALL highlight lines affected by detected differences with color-coded backgrounds (green for added, red for removed, yellow for modified).
- The Merge Result editor SHALL display gutter icons indicating the selection direction (left/right arrow) for handled changes and a warning icon for unhandled changes.
- Hovering a change item in the Select Changes panel SHALL visually emphasize the corresponding lines in the Merge Result editor.
- Clicking a change item in the Select Changes panel SHALL scroll the Merge Result editor to reveal the corresponding lines.

Non-requirements:
- No requirement for semantic DHIS2 validation.
- No requirement for server persistence.
- No requirement for persisting handled state across browser sessions.
- No requirement for reverse synchronization (clicking in the Merge Result to highlight a change item).

#### Scenario: Merge Result highlights change-affected lines
- **WHEN** differences exist between the two files and the Merge Result editor is displayed
- **THEN** lines corresponding to each difference SHALL be highlighted with the appropriate change-type color

#### Scenario: Change item hover synchronizes with Merge Result
- **WHEN** the user hovers over a change item in the Select Changes panel
- **THEN** the corresponding lines in the Merge Result editor SHALL receive an emphasized visual treatment

#### Scenario: Change item click scrolls Merge Result
- **WHEN** the user clicks a change item in the Select Changes panel
- **THEN** the Merge Result editor SHALL scroll to reveal the lines corresponding to that change
