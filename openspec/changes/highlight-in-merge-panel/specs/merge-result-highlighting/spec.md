## ADDED Requirements

### Requirement: Change-affected lines in the Merge Result SHALL be color-highlighted by change type

The Merge Result editor SHALL apply background color highlighting to lines that correspond to detected differences. The color SHALL indicate the change type.

#### Scenario: Added property highlighted in green
- **WHEN** a diff of type "added" exists at path `P` and the merged text contains the corresponding key/value at line range `L`
- **THEN** lines `L` in the Merge Result editor SHALL have a green background highlight

#### Scenario: Removed property highlighted in red
- **WHEN** a diff of type "removed" exists at path `P` and the path's nearest parent is visible in the merged text at line range `L`
- **THEN** lines `L` in the Merge Result editor SHALL have a red background highlight indicating the removal location

#### Scenario: Modified property highlighted in yellow
- **WHEN** a diff of type "modified" exists at path `P` and the merged text contains the corresponding key/value at line range `L`
- **THEN** lines `L` in the Merge Result editor SHALL have a yellow background highlight

#### Scenario: No highlight for paths without a match in merged text
- **WHEN** a diff path has no corresponding line in the merged text (e.g., a deeply removed key whose parent was also removed)
- **THEN** no highlight SHALL be applied for that path and no error SHALL occur

### Requirement: Handled changes SHALL display a directional indicator in the Merge Result gutter

When a difference has been handled (user selected "Use Left" or "Use Right"), the Merge Result editor SHALL show a gutter icon indicating the chosen direction.

#### Scenario: Left arrow for "Use Left" selection
- **WHEN** the user has selected "Use Left" for a diff at path `P` and the path is visible in the merged text
- **THEN** a left-pointing arrow glyph SHALL appear in the editor gutter at the start line of that path

#### Scenario: Right arrow for "Use Right" selection
- **WHEN** the user has selected "Use Right" for a diff at path `P` and the path is visible in the merged text
- **THEN** a right-pointing arrow glyph SHALL appear in the editor gutter at the start line of that path

### Requirement: Unhandled changes SHALL display a warning indicator in the Merge Result gutter

When a difference has not been handled, the Merge Result editor SHALL show a gutter icon indicating the change is pending review.

#### Scenario: Warning icon for unhandled difference
- **WHEN** a diff at path `P` has not been handled and the path is visible in the merged text
- **THEN** a warning/pending icon SHALL appear in the editor gutter at the start line of that path

#### Scenario: Warning icon removed after handling
- **WHEN** the user handles a previously unhandled diff at path `P`
- **THEN** the warning icon SHALL be replaced by the directional arrow glyph

### Requirement: Hovering a change item in Select Changes SHALL highlight the corresponding lines in the Merge Result

When the user hovers over a change item in the Select Changes panel, the Merge Result editor SHALL visually emphasize the corresponding lines.

#### Scenario: Hover highlights corresponding lines
- **WHEN** the user hovers over a change item for path `P` in the Select Changes panel
- **THEN** the lines corresponding to path `P` in the Merge Result editor SHALL receive an emphasized highlight (brighter or outlined) distinguishable from the base change-type highlight

#### Scenario: Hover highlight removed on mouse leave
- **WHEN** the user moves the mouse away from a change item
- **THEN** the emphasized highlight SHALL be removed and lines SHALL return to their base change-type highlight (or no highlight if the path has no change)

### Requirement: Clicking a change item in Select Changes SHALL scroll the Merge Result to the corresponding lines

When the user clicks a change item in the Select Changes panel, the Merge Result editor SHALL scroll to reveal the corresponding lines.

#### Scenario: Click scrolls editor to the change location
- **WHEN** the user clicks on a change item for path `P` in the Select Changes panel
- **THEN** the Merge Result editor SHALL scroll so that the lines corresponding to path `P` are visible in the viewport

#### Scenario: Click on a path not present in merged text
- **WHEN** the user clicks on a change item for a removed path `P` that has no line in the merged text
- **THEN** the editor SHALL scroll to the nearest parent path location, or remain at the current position if no parent is found

### Requirement: Decorations SHALL update when the merged text changes

When the user edits the merged text directly or makes a new selection, all highlights and gutter icons SHALL recompute to reflect the current state.

#### Scenario: Decorations recompute after selection change
- **WHEN** the user selects "Use Right" for a diff that was previously "Use Left"
- **THEN** the background highlight SHALL remain (same change type) and the gutter arrow SHALL update from left to right

#### Scenario: Decorations recompute after manual edit
- **WHEN** the user manually edits the merged JSON text in the editor
- **THEN** decorations SHALL recompute based on the new text, and any paths that shifted lines SHALL have their highlights repositioned
