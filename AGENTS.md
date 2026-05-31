# Repository Rules For LLM Agents

## Core And Lib Boundaries

- In `server/core`, `client/core`, `server/libs`, `client/libs`, and `shared/libs`, keep module internals private by default.
- Core modules should export implementation symbols at the end of the file, not inline at declaration level.
- Core and libs folder consumers should import public APIs from the folder `index.ts` barrel whenever one exists.
- Keep `index.ts` barrels explicit. Do not use `export *` from core/libs barrels unless the folder is intentionally all public.
- Export only the API intended for consumers such as controllers, services, middleware, app bootstrap, or tests.
- Keep helper functions, internal constants, classifiers, and adapter details out of public barrels unless there is a clear consumer.
- `libs/*` must not import from `core/*`.
- `core/*` may import from `libs/*`.
- Sibling `core` subdirectories should not import from each other when the shared contract can live in `libs`.
- Sibling `libs` imports should go through public barrels such as `@libs/config`, not private files.

Example core module style:

```ts
const internalHelper = () => {};

const publicHelper = () => {};

export { publicHelper };
```

Example core barrel style:

```ts
export { publicHelper, type PublicType } from "./module";
```

## Feature Directories

- In feature directories, prefer inline declaration exports for feature-level public values.
- This is acceptable for controllers, services, schemas, and feature-local constants.

Example feature style:

```ts
export const healthService = {
  getHealth() {
    return { status: "ok" };
  },
};
```

## Async Fire-And-Forget

- Do not write `void caller()` to silence a promise or mark fire-and-forget work.
- If a fire-and-forget call is acceptable for the code path, call it directly.
- Add explicit rejection handling only when the failure must be observed or recovered.

Preferred:

```ts
reporter.captureError(payload);
```

Avoid:

```ts
void reporter.captureError(payload);
```

## Tailwind Classes

- Prefer theme scale utilities (`lg:h-18`, `size-4.5`, `text-sm`) over arbitrary values (`lg:h-[4.5rem]`, `size-[1.125rem]`).
- Use `[...]` only when no theme utility matches: CSS variables, `min()`/`calc()`, property-specific transitions, or one-off values.
- Check Tailwind IntelliSense canonical-class suggestions before adding an arbitrary value.
- Reused off-scale values belong in `@theme` in `client/styles/app.css`, not repeated `[...]` literals.

## API Client And Server Responses

- Make HTTP calls through `api.json.*` or `api.text.*` from `@libs/api` — do not import `httpClient` directly.
- Client JSON requests use `validateStatus: () => true` so non-2xx responses still expose the `{ ok: false, error }` body instead of axios throwing `"Request failed with status code …"`.
- Map API failures to `ApiClientError` and surface `error.message` to users — never raw axios status text.
- `api.json.*` accepts either:
  - `{ ok: true, data }` / `{ ok: false, error }` JSON envelopes (preferred for endpoints that return data), or
  - `204 No Content` / empty `2xx` bodies for void endpoints (e.g. logout via `noContent()`).
- Do not assume every endpoint returns JSON — void handlers may legitimately send no body.

## Layout Components

- Reusable app chrome lives in `client/components/layouts/` (`AppShell`, `AppHeader`, `AppSidebar`, `AppMain`, `AppPageLayout`).
- Feature directories export page components and feature logic only — not shell layout.
- `AppShell` grid must have exactly **two** direct children: one sidebar wrapper (desktop + mobile together) and one main column (header + body).
- Do not put sidebar-width utilities (`w-*`) on the grid container — sidebar width belongs in a CSS variable column track.
- Avoid `flex-1` inside `flex-col` unless the parent has a defined height; otherwise flex items shrink below their content height.

## Client Theme

- Theme preference is client-only (`client/libs/theme`, zustand persist + `localStorage`).
- `applyUiTheme` sets `class`, `data-theme`, and `colorScheme` on `document.documentElement`.
- A blocking inline script in `client/index.html` is **recommended** (not required) to apply the saved theme before the bundle loads and avoid a flash of the wrong theme.

## Server Controllers

- Use the functional builder in `server/core/controllers/` — import from `@core/controllers`.
- Create routes with `createAppController(basePath)` → `.with(...)` (controller-wide middleware) → `.GET`/`.POST`/`.PUT`/`.PATCH`/`.DELETE(path)` → `.schemas({ body?, params?, query? })` → `.use(...)` → `.handle(...)`.
- `.with()` returns a plain controller (no further `.with`) so setup middleware cannot be appended after routes are declared.
- Route-local `.use()` enrichment is typed for later steps on that route only; `.handle()` returns the controller without leaking route-local context to other routes.
- Request validation: declare Zod schemas via `.schemas()`; handlers read `ctx.parsed.body` / `ctx.parsed.params` / `ctx.parsed.query`. Runtime parsing uses `@core/validation` (`validateRequest`).
- Responses: use `ctx.reply.success({ data })`, `ctx.reply.created({ data })`, `ctx.reply.noContent()`, or throw `AppError` / domain errors for `errorMiddleware`. Do not `return` raw Express `res` objects from handlers (context merge footgun).
- Auth: use `requireAuth` / `requirePermission` from `@features/auth` as `.with(requireAuth)` and per-route `.use(requirePermission(...))`. They return `{ user }` into context — read `ctx.user`, not `res.locals.currentUser`.
- Realtime origin: `ctx.originSocketId` from the `x-socket-id` header (when the client connected over WS). Pass to services for `excludeSocketId` on broadcasts.
- Express middleware (e.g. multer): adapt with `fromExpress(handler)` from `@core/controllers`.
- Register in `server/app.ts` via `registerControllers(app, [controllers], { apiPrefix: "/api" })`. Wrong verb on a known path → `405` + `Allow` (built into registrar).

## Request Context (`res.locals.context`)

- Single module: `server/core/http/requestContext.ts` (exported from `@core/http`).
- `requestContextMiddleware(logger)` runs early in `app.ts` (after session) and calls `attachRequestContext` → sets `res.locals.context = { requestId, logger }`.
- `getRequestContext(res)` is the only reader: used by `createBaseContext` (maps to `ctx.logger` / `ctx.requestId`) and `errorMiddleware` (5xx logging). Do not read `res.locals.context` ad hoc elsewhere.
- Express `Locals` is augmented so `res.locals.context` is typed after middleware.
- Per-request auth lives on **handler context** (`ctx.user` from `requireAuth`), not on `res.locals`.

## HTTP Errors And Response Format

- Thrown errors (`AppError`, `ZodError`, surfaceable `DbError`) flow to `errorMiddleware` via `next(error)`.
- Success and error bodies share negotiation in `server/core/http/responseFormat.ts` (internal): `Accept` → `json` / `text` / `html`. JSON contract: `{ ok: true, data }` / `{ ok: false, error: { code, message, details? } }`.
- `AppError.messageKey` uses server `MessageKey` from `@libs/i18n` (errors.* keys only on server).
- Status `>= 500` is logged via `res.locals.context.logger` before the response is sent.

## i18n (common / server / client)

- **Shared** (`@tour-manager/shared` / `shared/libs/i18n`): locale machinery (`Locale`, `normalizeLocale`, …), `commonMessages` (shared keys both sides may use — spread into each catalog), generic `translate(messages, locale, key)` and `createTranslator`.
- **Server** (`@libs/i18n`): `errors.*` message keys only; composed `messages = { ...commonMessages, ...serverMessages }`. Use `translate`, `MessageKey`, `resolveLocale(req)` for HTTP/i18n. Do not put UI copy in server catalogs.
- **Client** (`client/libs/i18n`): UI keys (`login.*`, `dashboard.*`, `pages.*`, …); composed with `commonMessages`. Use `t()` / `useT()` for components; import `MessageKey` from `@libs/i18n` when typing nav/routes.
- Locale preference is client-only for now (`client/libs/i18n/locale-store.ts`), separate from server `UserSettings`.
- Keep the `app-lang` request header in sync via the axios interceptor / `bootstrapLocaleHeaderSync()`.
- Remount the route tree on locale change (`<Outlet key={locale} />` in `__root.tsx`) until page subtrees subscribe to locale reactively.
- RBAC helpers (`hasPermission`, `ROLE_PERMISSIONS`, etc.) live in `@tour-manager/shared` for future client route/button gating — do not move server-only.

## Realtime And WebSocket

- Use **native WebSocket** at `REALTIME_WS_PATH` (`/ws`) — not Socket.IO.
- Shared contracts live in `shared/libs/realtime/` (path, scopes, message schemas). Add new scopes there when a feature needs realtime.
- Server gateway: `server/core/realtime/gateway.ts` (`wsGateway`). Bootstrapped in `server/index.ts` with `sessionMiddleware` + a user resolver.
- Client module: `client/libs/realtime/` — import from `@libs/realtime`, not private files.

### Connection lifecycle

- Login stays **HTTP-only**. Do not open WebSocket on the login page.
- Call `ensureRealtimeConnection()` in `routes/_shell/route.tsx` `beforeLoad` **after** auth is confirmed (resolve user via store or `getCurrentUser()`).
- Call `disconnectRealtime()` on logout (before or while clearing auth state).
- WS handshake requires a valid session cookie — unauthenticated upgrades are rejected with `401`.

### HTTP ↔ realtime linking

- After connect, the server emits `{ type: "realtime.connected", socketId, userId, scopes }` (validated with `realtimeConnectedMessageSchema` before send).
- The client stores `socketId` and the axios interceptor in `httpClient` attaches `HTTP_HEADERS.SOCKET_ID` (`x-socket-id`) on subsequent API requests when available.
- Controllers receive `ctx.originSocketId` when the client sent the header — use this to exclude the originating socket from broadcast events.

### Scopes and events

- Only `"global"` scope exists for now. Add feature scopes (e.g. `"contracts:list"`) in `shared/libs/realtime/schemas.ts` when building that feature.
- Server push: `wsGateway.emitToScope(scope, event, { excludeSocketId })` or `wsGateway.emitToUser(userId, event, { excludeSocketId })`.
- Client subscribe: `subscribeRealtimeEvent(eventType, listener)` — add a route-scope hook when the first feature page needs `presence.join` / `presence.leave`.

### Dev proxy

- Vite proxies `/ws` with `ws: true` to the backend — client connects to same-origin `ws://${host}/ws` in development.
