# Current State

Date: 2026-05-23

Tour Manager is a TypeScript monorepo with separate `client`, `server`, and `shared` workspaces.

## Built

- Express API with core middleware: Helmet, CORS, JSON body parsing, and cookies.
- Controller registration pattern through `BaseController` and `registerControllers`.
- Health feature at `/api/health`.
- Shared API response envelope with `ApiSuccess`, `ApiFailure`, and `ApiResponse`.
- Shared Zod schemas for IDs, versions, and pagination query params.
- Server request validation helper using Zod schemas for `body`, `params`, and `query`.
- React client using TanStack Router with a simple dashboard landing screen.
- HTTP client helper that unwraps the shared API envelope.
- Unit test coverage for health, common schemas, and the client HTTP helper.
- Playwright e2e test setup.

## Product Signals

The dashboard copy points toward an admin workspace for:

- Contracts
- Hotels
- Workers
- RBAC
- Audit logs
- Reports
- Realtime sync

## Useful Constraints

- Shared types and schemas should stay in `shared` when both client and server need the contract.
- Server features should stay grouped under `server/features/<feature>`.
- Core reusable server behavior belongs under `server/core`.
- The next major step should prove a real workflow end to end instead of adding disconnected foundations.

## Open Questions

- What is the first real user role: admin, tour coordinator, hotel manager, worker, or accounting?
- Which domain object should become the first vertical slice?
- Is persistence local-first, database-backed immediately, or mocked for product discovery?
- Do contracts drive the workflow, or do tours/trips drive contracts and staffing?
