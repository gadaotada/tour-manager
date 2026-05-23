# Plan: Next Foundation Slice

Date: 2026-05-23
Status: Draft

## Goal

Create the first real Tour Manager workflow so the app moves from platform foundation to usable product foundation.

## Recommendation

Build `tours` first. A tour can become the organizing object that contracts, hotels, workers, reports, and realtime coordination attach to later.

## Scope

- Define a shared `tour` schema and API types.
- Add a server `tours` feature with list, get, create, and update routes.
- Use an in-memory repository for the first pass if database choice is still open.
- Add client routes for tour list and tour detail/edit.
- Add validation and error states that use the existing API envelope.
- Add focused unit tests and one e2e happy path.

## Out Of Scope

- Authentication and RBAC.
- Final database schema.
- Realtime collaboration.
- Reports and exports.
- Complex assignment workflows.

## Proposed Model

Start small:

- `id`
- `name`
- `startsOn`
- `endsOn`
- `status`: `draft`, `confirmed`, `active`, `completed`, `cancelled`
- `notes`
- `version`
- `createdAt`
- `updatedAt`

## Work

1. Add shared tour schemas in `shared/schemas/tour.ts`.
2. Export tour types from `shared/index.ts`.
3. Add `server/features/tours` with repository, service, controller, and tests.
4. Register `tourController` in `server/app.ts`.
5. Add client API functions for tours.
6. Replace the dashboard placeholder with a tours workspace.
7. Add e2e coverage for creating and seeing a tour.
8. Update `docs/CURRENT_STATE.md` when the slice lands.

## Validation

- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Decisions To Make Before Coding

- Should the first persisted object be `tours` or `contracts`?
- Should the initial storage be in-memory, SQLite, Postgres, or something else?
- What terms should the UI use: tour, trip, program, booking, or contract?
