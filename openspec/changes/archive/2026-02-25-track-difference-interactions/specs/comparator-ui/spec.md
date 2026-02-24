## MODIFIED Requirements

### Requirement: Comparison & Merge UX (Behavioral Requirements)

Minimum requirements:
- Display both JSON documents for inspection (editor or viewer).
- Provide a representation of differences (diff view, highlighted changes, or structured diff).
- Support a user-driven merge outcome (e.g., choosing one side for a section or applying selected changes).
- The change list SHALL visually distinguish between differences the user has explicitly acted on (handled) and those still pending review (unhandled).
- The change list header area SHALL include a progress indicator showing handled count vs total count.
- The change list SHALL support filtering by handled status (All, Unhandled, Handled) with "All" as the default.

Non-requirements:
- No requirement for semantic DHIS2 validation.
- No requirement for server persistence.
- No requirement for persisting handled state across browser sessions.
