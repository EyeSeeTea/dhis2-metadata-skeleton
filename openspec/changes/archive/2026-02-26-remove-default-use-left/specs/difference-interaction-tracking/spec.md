## MODIFIED Requirements

### Requirement: Differences SHALL be tracked as handled when the user makes an explicit selection

When the user clicks "Use Left" or "Use Right" on a difference item, the system SHALL record that difference path as "handled". The handled state is independent of which side was selected. On initial load, no differences SHALL be marked as handled and no side SHALL be pre-selected.

#### Scenario: Initial state has no handled differences and no pre-selected sides
- **WHEN** the comparator loads with differences between two JSON files
- **THEN** all differences SHALL be marked as unhandled
- **AND** no difference SHALL have a pre-selected side (neither "left" nor "right")

#### Scenario: User selects a side for an unhandled difference
- **WHEN** the user clicks "Use Left" or "Use Right" on a difference that has not been handled
- **THEN** the difference SHALL be marked as handled

#### Scenario: User changes selection on an already-handled difference
- **WHEN** the user clicks a different side on a difference that is already handled
- **THEN** the difference SHALL remain handled (handled state is not toggled off)

### Requirement: Handled differences SHALL be visually distinct from unhandled differences

The change list SHALL render handled and unhandled items with different visual treatments so the user can distinguish them at a glance.

#### Scenario: Unhandled difference appearance
- **WHEN** a difference has not been explicitly acted on by the user
- **THEN** the item SHALL display with the default styling (primary-color left border, full opacity)
- **AND** both "Use Left" and "Use Right" buttons SHALL appear in their inactive state

#### Scenario: Handled difference appearance
- **WHEN** a difference has been marked as handled
- **THEN** the item SHALL display with a distinct visual indicator (green left border and a checkmark icon) and slightly reduced text emphasis
- **AND** the selected side button SHALL appear in its active (highlighted) state

### Requirement: The UI SHALL display a progress summary of handled vs total differences

A progress indicator SHALL show the count of handled differences relative to the total number of differences.

#### Scenario: Progress display with no handled differences
- **WHEN** no differences have been handled (initial load state)
- **THEN** the UI SHALL display "0 / N handled" where N is the total difference count

#### Scenario: Progress display with some handled differences
- **WHEN** the user has handled 10 out of 25 differences
- **THEN** the UI SHALL display a progress indicator showing "10 / 25 handled" (or equivalent fraction format)

#### Scenario: All differences handled
- **WHEN** all differences have been handled
- **THEN** the UI SHALL display "N / N handled" where N is the total difference count
