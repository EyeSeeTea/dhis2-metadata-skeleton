## ADDED Requirements

### Requirement: Hovering a change item SHALL highlight only that item's corresponding block in the Merge Result

The Merge Result editor SHALL apply a color-coded background highlight to the lines corresponding to the currently hovered change item. No other diff paths SHALL be highlighted simultaneously.

#### Scenario: Hover highlights the focused block with the change-type color
- **WHEN** the user hovers over a change item for path `P` of type "added" in the Select Changes panel and the merged text contains the corresponding key/value at line range `L`
- **THEN** lines `L` in the Merge Result editor SHALL have a green background highlight
- **AND** no other diff paths SHALL have any highlight

#### Scenario: Hover on a "removed" change highlights in red
- **WHEN** the user hovers over a change item for path `P` of type "removed" and the path's nearest parent is visible in the merged text at line range `L`
- **THEN** lines `L` in the Merge Result editor SHALL have a red background highlight

#### Scenario: Hover on a "modified" change highlights in yellow
- **WHEN** the user hovers over a change item for path `P` of type "modified" and the merged text contains the corresponding key/value at line range `L`
- **THEN** lines `L` in the Merge Result editor SHALL have a yellow background highlight

#### Scenario: Highlight removed on mouse leave
- **WHEN** the user moves the mouse away from a change item
- **THEN** all highlights in the Merge Result editor SHALL be cleared

#### Scenario: No highlight when no change item is hovered
- **WHEN** no change item is hovered (focusedPath is unset)
- **THEN** the Merge Result editor SHALL have no background highlights or gutter glyphs

#### Scenario: No highlight for paths without a match in merged text
- **WHEN** a diff path has no corresponding line in the merged text (e.g., a deeply removed key whose parent was also removed)
- **THEN** no highlight SHALL be applied for that path and no error SHALL occur

### Requirement: The focused block SHALL display a gutter glyph indicating handled/unhandled state

When the user hovers over a change item, the Merge Result editor SHALL show a gutter icon on the focused block indicating the handled state and selection direction.

#### Scenario: Left arrow for "Use Left" selection on focused block
- **WHEN** the user hovers over a handled diff at path `P` with "Use Left" selected and the path is visible in the merged text
- **THEN** a left-pointing arrow glyph SHALL appear in the editor gutter at the start line of that path

#### Scenario: Right arrow for "Use Right" selection on focused block
- **WHEN** the user hovers over a handled diff at path `P` with "Use Right" selected and the path is visible in the merged text
- **THEN** a right-pointing arrow glyph SHALL appear in the editor gutter at the start line of that path

#### Scenario: Warning icon for unhandled focused block
- **WHEN** the user hovers over an unhandled diff at path `P` and the path is visible in the merged text
- **THEN** a warning/pending icon SHALL appear in the editor gutter at the start line of that path

### Requirement: Clicking a change item in Select Changes SHALL scroll the Merge Result to the corresponding lines

When the user clicks a change item in the Select Changes panel, the Merge Result editor SHALL scroll to reveal the corresponding lines.

#### Scenario: Click scrolls editor to the change location
- **WHEN** the user clicks on a change item for path `P` in the Select Changes panel
- **THEN** the Merge Result editor SHALL scroll so that the lines corresponding to path `P` are visible in the viewport

#### Scenario: Click on a path not present in merged text
- **WHEN** the user clicks on a change item for a removed path `P` that has no line in the merged text
- **THEN** the editor SHALL scroll to the nearest parent path location, or remain at the current position if no parent is found

### Requirement: Handled changes in the Select Changes panel SHALL display a directional chevron icon

When a difference has been handled, the ChangeItem card SHALL show a chevron icon indicating the chosen direction, next to the diff type badge.

#### Scenario: Left chevron for "Use Left" selection
- **WHEN** the user has selected "Use Left" for a diff at path `P`
- **THEN** a left-pointing chevron icon SHALL appear in the ChangeItem card next to the diff type badge

#### Scenario: Right chevron for "Use Right" selection
- **WHEN** the user has selected "Use Right" for a diff at path `P`
- **THEN** a right-pointing chevron icon SHALL appear in the ChangeItem card next to the diff type badge

#### Scenario: No chevron for unhandled changes
- **WHEN** a diff at path `P` has not been handled
- **THEN** no directional chevron SHALL appear in the ChangeItem card

### Requirement: Decorations SHALL update when the merged text or focus changes

When the user edits the merged text, changes selection, or hovers a different item, highlights and gutter icons SHALL recompute.

#### Scenario: Decorations recompute after selection change
- **WHEN** the user selects "Use Right" for a diff that was previously "Use Left" and that path is currently focused
- **THEN** the gutter arrow SHALL update from left to right

#### Scenario: Decorations recompute after manual edit
- **WHEN** the user manually edits the merged JSON text in the editor
- **THEN** decorations SHALL recompute based on the new text when a change item is next hovered

#### Scenario: Decorations update when focus changes
- **WHEN** the user moves hover from change item A to change item B
- **THEN** the highlight SHALL move from A's line range to B's line range
