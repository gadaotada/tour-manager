# Roadmap

Date: 2026-05-23

This roadmap favors useful vertical slices. The order can change as the product sharpens.

## Milestone 1: Real App Spine

Goal: turn the current shell into a working, inspectable admin app.

- Pick the first domain model and build it end to end.
- Add persistence and repository/service boundaries.
- Add list, detail, create, and edit flows in the client.
- Establish loading, empty, error, and validation states.
- Keep API contracts shared through `shared`.

Recommended first slice: tours or contracts. Tours may be the better anchor if hotels, workers, contracts, and reports all attach to a scheduled tour.

## Milestone 2: Operations Workflow

Goal: support daily coordination work.

- Hotel assignments.
- Worker assignments.
- Statuses and operational notes.
- Filtering and pagination.
- Basic audit events for important changes.

## Milestone 3: Access And Accountability

Goal: make the app safe for multiple users.

- Authentication.
- RBAC roles and route guards.
- Audit log views.
- User management.

## Milestone 4: Realtime And Reporting

Goal: help operators see changes and outcomes quickly.

- Realtime updates for active operational screens.
- Exportable reports.
- Dashboard summaries.
- Conflict handling for concurrent edits.

## Near-Term Recommendation

Start with a `tours` vertical slice:

- Shared tour schemas and types.
- Server feature with controller, service, and repository.
- In-memory repository first, unless database choice is already settled.
- Client list and create/edit screens.
- Tests around validation, service behavior, and the API contract.
