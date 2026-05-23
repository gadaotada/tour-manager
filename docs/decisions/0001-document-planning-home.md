# Decision 0001: Use Docs As The Planning Home

Date: 2026-05-23
Status: Accepted

## Context

The app has a working TypeScript monorepo foundation but no existing planning or product documentation. Upcoming work will need small decisions about domain language, feature order, API shape, persistence, and UI workflow.

## Decision

Use `docs/` as the planning home:

- `docs/CURRENT_STATE.md` captures what exists now.
- `docs/ROADMAP.md` captures directional product milestones.
- `docs/plans/` stores actionable implementation plans.
- `docs/decisions/` stores short decision records.

## Consequences

- Planning stays close to the codebase.
- Future work can reference a shared product and architecture memory.
- Docs should be updated as real capabilities land, not treated as a separate project.
