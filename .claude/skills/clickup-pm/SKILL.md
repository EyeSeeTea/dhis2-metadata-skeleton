---
name: clickup-pm
description: >
  Project management skill for creating and managing ClickUp tasks from
  OpenSpec artifacts. Use whenever creating tasks, updating status, planning
  sprints, or coordinating work between development agents. Trigger on any
  mention of tickets, tasks, sprint planning, or project tracking.
---

# ClickUp Project Management

## Creating Tasks from OpenSpec

When given an OpenSpec change proposal:

1. Read `openspec/changes/<change-name>/tasks.md` for the task breakdown
2. Read `openspec/changes/<change-name>/design.md` for technical context
3. For each task, create a ClickUp task with:
   - **Name**: `[ROLE] Task description`
   - **Description**: Include acceptance criteria from the spec
   - **Priority**: Based on dependency order (blocking tasks = high)
   - **Assignee**: Map to the appropriate agent role
   - **Tags**: Feature name, sprint number

## Role-to-Assignee Mapping

| Role Tag | Agent | Task Type |
|----------|-------|-----------|
| [FE]     | frontend-developer | UI components, client logic |
| [BE]     | backend-developer | APIs, server logic |
| [DB]     | database-manager | Schema, migrations, queries |
| [UX]     | ux-designer | Wireframes, user flows |
| [GD]     | graphical-designer | Visual design, assets |
| [AND]    | android-developer | Android UI, native features, mobile logic |


## Task Dependencies
Create tasks in dependency order:
1. DB schema → BE API → FE implementation
2. UX wireframes → GD mockups → FE implementation
3. Both tracks can run in parallel

## Task Status
After creating any task or subtask in ClickUp, immediately move it to "To Do" status.
The default status is "Misc" which is not useful — never leave tasks in "Misc".

## Task Structure Strategy
Choose the structure based on feature complexity:

**Simple features** (roughly 5 or fewer tasks):
- Create ONE parent issue named: `[Feature name] — Brief description`
- Create subtasks under it for each individual task from tasks.md
- Subtask names: `[ROLE] Task description`

**Complex features** (more than 5 tasks, or multiple parallel tracks):
- Create multiple standalone issues
- Every issue title MUST include the feature name as a prefix so they can be filtered together
- Format: `[Feature name] [ROLE] Task description`
- Examples:
  - `[Track Difference Interactions] [UX] Design interaction states`
  - `[Track Difference Interactions] [FE] Add click handler to difference list`
  - `[Track Difference Interactions] [FE] Persist interaction state in Zustand`

When in doubt, prefer the simple approach (parent + subtasks) — it's easier to track.

## Clickup Project Structure
- Projects are stored under space Projects in clickup
- There are 2 lists in each project:
   - The list for PMs, that shows the progress of the project in high-level
   - The list for the rest of the team, where each individual task progress is tracked
- The folder and list naming is like this:
```
Projects
|--- Client - Project name
      |--- Client - Project name - PM 
      |--- Client - Project name - team
```
