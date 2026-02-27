## MODIFIED Requirements

### Requirement: Comparison & Merge UX (Behavioral Requirements)

Minimum requirements:
- Display both JSON documents for inspection (editor or viewer).
- Provide a representation of differences (diff view, highlighted changes, or structured diff).
- Support a user-driven merge outcome (e.g., choosing one side for a section or applying selected changes).
- The change list SHALL visually distinguish between differences the user has explicitly acted on (handled) and those still pending review (unhandled).
- The change list header area SHALL include a progress indicator showing handled count vs total count.
- The change list SHALL support filtering by handled status (All, Unhandled, Handled) with "All" as the default.
- Hovering a change item in the Select Changes panel SHALL highlight only the corresponding block in the Merge Result editor with a color-coded background (green for added, red for removed, yellow for modified). No other blocks SHALL be highlighted.
- All diff blocks with lines in the merged text SHALL display persistent gutter glyphs: a directional arrow (left/right, blue) if handled, or a warning icon (amber) if unhandled. Glyphs are always visible, not only on hover.
- Handled change items in the Select Changes panel SHALL display a directional chevron icon (left or right) next to the diff type badge.
- Clicking a change item in the Select Changes panel SHALL scroll the Merge Result editor to reveal the corresponding lines.

Non-requirements:
- No requirement for semantic DHIS2 validation.
- No requirement for server persistence.
- No requirement for persisting handled state across browser sessions.
- No requirement for reverse synchronization (clicking in the Merge Result to highlight a change item).
- No requirement for always-on background highlighting of all diffs — only the focused item gets a background highlight. Gutter glyphs, however, ARE always-on for all diffs.

#### Scenario: Merge Result highlights the focused change block
- **WHEN** the user hovers over a change item in the Select Changes panel
- **THEN** only the lines corresponding to that change SHALL be highlighted with the appropriate change-type color

#### Scenario: Change item hover clears previous highlights
- **WHEN** the user moves hover from one change item to another
- **THEN** the previous highlight SHALL be removed and only the newly focused block SHALL be highlighted

#### Scenario: Change item click scrolls Merge Result
- **WHEN** the user clicks a change item in the Select Changes panel
- **THEN** the Merge Result editor SHALL scroll to reveal the lines corresponding to that change

#### Scenario: Handled change items show directional chevron
- **WHEN** the user has selected "Use Left" or "Use Right" for a change
- **THEN** a left or right chevron icon SHALL appear in the ChangeItem card next to the diff type badge
