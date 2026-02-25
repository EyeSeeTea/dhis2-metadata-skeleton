## ADDED Requirements

### Requirement: Differences SHALL be tracked as handled when the user makes an explicit selection

When the user clicks "Use Left" or "Use Right" on a difference item, the system SHALL record that difference path as "handled". The handled state is independent of which side was selected.

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

#### Scenario: Handled difference appearance
- **WHEN** a difference has been marked as handled
- **THEN** the item SHALL display with a distinct visual indicator (green left border and a checkmark icon) and slightly reduced text emphasis

### Requirement: The UI SHALL display a progress summary of handled vs total differences

A progress indicator SHALL show the count of handled differences relative to the total number of differences.

#### Scenario: Progress display with some handled differences
- **WHEN** the user has handled 10 out of 25 differences
- **THEN** the UI SHALL display a progress indicator showing "10 / 25 handled" (or equivalent fraction format)

#### Scenario: Progress display with no handled differences
- **WHEN** no differences have been handled
- **THEN** the UI SHALL display "0 / N handled" where N is the total difference count

#### Scenario: All differences handled
- **WHEN** all differences have been handled
- **THEN** the UI SHALL display "N / N handled" where N is the total difference count

### Requirement: The user SHALL be able to filter the change list by handled status

A filter control SHALL allow the user to view all differences, only unhandled differences, or only handled differences.

#### Scenario: Default filter state
- **WHEN** the comparator loads with differences
- **THEN** the filter SHALL default to "All" showing every difference

#### Scenario: Filter to unhandled only
- **WHEN** the user selects the "Unhandled" filter
- **THEN** the change list SHALL display only differences that have not been handled

#### Scenario: Filter to handled only
- **WHEN** the user selects the "Handled" filter
- **THEN** the change list SHALL display only differences that have been handled

### Requirement: Handled state SHALL be session-scoped

The handled state SHALL persist for the duration of the current page session and SHALL reset when files change.

#### Scenario: State persists during session
- **WHEN** the user scrolls away from a handled difference and returns
- **THEN** the difference SHALL still appear as handled

#### Scenario: State resets on new file upload
- **WHEN** the user uploads new left or right files for comparison
- **THEN** all handled state SHALL be cleared and the new differences SHALL start as unhandled

#### Scenario: State resets on page reload
- **WHEN** the user reloads the browser page
- **THEN** all handled state SHALL be cleared
