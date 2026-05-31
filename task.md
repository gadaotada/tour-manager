# Architecture Cleanup — Post v3 Controller Migration

**Status: completed** (2026-05-31). All tasks T1–T10 done; `tsc --noEmit` clean on shared, server, client. Docs updated in `AGENTS.md`.

Executable task spec for an AI agent (Composer 2.5) or a human. Work top-to-bottom;
each task is independent enough to be its own commit/PR. Stop and ask if an
acceptance criterion can't be met without a design change.

## Context

We migrated server controllers from a class-based `BaseController` (v1) to a
functional builder (`createAppController`). v3 was **promoted to the flat
`server/core/controllers/`** and is now the only implementation. This spec cleans
up the debt that migration left behind, plus some adjacent hygiene.

## Ground rules

- Follow `AGENTS.md` (core may import libs; libs must NOT import core; explicit
  barrels, no `export *` from core/libs; keep internals out of public barrels).
- **Preserve the client API contract**: success → `{ ok: true, data }`,
  error → `{ ok: false, error: { code, message, details? } }`.
- **DO NOT TOUCH** `shared/types/users/users.permissions.ts` (RBAC). It lives in
  shared intentionally — the frontend will consume it for route/button gating.
- **DO NOT TOUCH** `server/core/sql/`. Leave the DDL where it is.
- After each task: `cd server && npx tsc --noEmit` and lint must be clean. Don't
  break existing tests; update tests you invalidate.
- Keep commits small and focused — one task per commit.

## Decisions (already made — do not re-litigate)

- **Error responses negotiate** `json`/`text`/`html` via the `Accept` header,
  consistently on BOTH the `reply.*` (success) and `errorMiddleware` (thrown)
  paths. There is one shared serializer + negotiator used by both.
- **Auth context is native**: `requireAuth` returns `{ user }` as an
  `AppMiddleware` so `.with(requireAuth)` types `ctx.user`. The
  `res.locals.currentUser` convention is retired (only `auth.middleware.ts`
  writes it; nothing reads it).
- **i18n splits into common / server / client** catalogs, composed by spreading.

---

## T1 — Delete dead `v2/` controller directory ✅

**Goal:** Remove the leftover dead code from the migration.

**Files:**
- Delete `server/core/controllers/v2/` (all 5 files: `factory.ts`, `register.ts`,
  `examples.ts`, `public.types.ts`, `internal.types.ts`).
- v1 (`BaseController.ts`, old `registerControllers.ts`) is already deleted in the
  working tree — just ensure it's committed.

**Steps:**
1. Grep the whole repo for `controllers/v2` and `BaseController` — confirm **zero**
   importers.
2. Delete the `v2/` directory.

**Acceptance:** `rg "controllers/v2|BaseController" server client shared` returns
nothing; `tsc` + lint clean.

**Risk:** None — confirmed unused.

---

## T2 — Unify the error/response pipeline ✅ (shared serializer + negotiation + 5xx logging)

**Goal:** One source of truth for turning an error into a client envelope, and one
content negotiator, used by both `reply.ts` and `errorMiddleware.ts`. Today they
duplicate `AppError` serialization and disagree (negotiation only on `reply`,
`details` semantics differ, `ZodError`/`DbError` only known to `errorMiddleware`).

**Files:**
- New: `server/core/http/responseFormat.ts` (or similar) — the shared module.
- Edit: `server/core/http/errorMiddleware.ts`, `server/core/controllers/reply.ts`,
  `server/core/http/index.ts` (barrel).

**Design:**
1. Extract a single `serializeClientError(error, locale)` that handles, in order:
   `ZodError` → `{ code: "VALIDATION_ERROR", message: t("errors.validation"), details: flatten }`;
   `AppError` → `{ code, message: t(messageKey), details? }` (omit `details` when `undefined`);
   surfaceable `DbError` → mapped via `toDbAppError`; everything else → opaque
   `{ code: "INTERNAL_SERVER_ERROR", message: t("errors.internal") }`.
2. Extract `negotiateResponseType(req)` + `sendBody(res, status, type, body)` from
   `reply.ts` into the shared module.
3. `errorMiddleware` becomes: resolve locale → `serializeClientError` → negotiate →
   `sendBody` with `{ ok: false, error }`. **It now negotiates** instead of always JSON.
4. `reply.ts` uses the same negotiator/serializer (drop its private `serializeError`).
5. **Add 5xx logging**: when the resolved status is `>= 500`, log via
   `res.locals.context?.logger?.error(...)` before sending. (Today 500-level
   `AppError`s — e.g. v3's `NO_RESPONSE` — are silently not logged.)
6. Add `if (res.headersSent) return;` guard at the top of `errorMiddleware`.

**Acceptance:**
- A thrown `AppError`/`ZodError` with `Accept: text/html` returns an HTML body; with
  `Accept: application/json` (or `*/*`) returns the JSON envelope.
- `reply.success`/`reply.created`/`reply.error` produce identical envelopes to today
  for JSON clients.
- A forced 500 path emits one `logger.error`.
- No duplicated `AppError → { code, message }` logic remains.

**Risk:** Medium — touches the response contract. Verify the existing client
(axios, JSON) still gets `{ ok, data }` / `{ ok: false, error }` unchanged.

---

## T3 — Native auth middleware ✅ (`requireAuth` returns `{ user }`), retire `res.locals.currentUser`

**Goal:** Give v3 routes a typed `ctx.user` and remove the orphaned locals convention.

**Files:** `server/features/auth/auth.middleware.ts`, `server/features/auth/index.ts`,
and any controller that should be auth-gated.

**Design:**
1. Rewrite `requireAuth` as an `AppMiddleware<{ user: ClientUser }>`: resolve the
   session user (reuse `getSessionUser`), and `return { user }` (throw
   `unauthenticatedError()` on failure — let `errorMiddleware` handle it). Do **not**
   write `res.locals.currentUser`.
2. Rewrite `requirePermission(permission)` as a
   `RouteMiddleware<object, { user: ClientUser }>` that reads `ctx.user`, throws
   `forbiddenError()` if missing the permission, else `return ctx.proceed()`.
3. Remove both `res.locals.currentUser = user;` writes.
4. Usage: `createAppController("/x").with(requireAuth)...` and per-route
   `.use(requirePermission("..."))`.

**Acceptance:** No references to `res.locals.currentUser` remain
(`rg "currentUser" server`); a `.with(requireAuth)` route has a typed `ctx.user`;
`tsc` + lint clean.

**Risk:** Low — confirmed no readers of `res.locals.currentUser`.

**Note:** Keep `fromExpress` (`server/core/controllers/adapters.ts`) — it's an
intentional public utility (e.g. multer), not dead code, even if currently unused.

---

## T4 — Consolidate validation types ✅ + add a `validation/` barrel

**Goal:** One `RequestSchemas` type, and stop deep-importing a private file.

**Files:** `server/core/validation/validateRequest.ts`, new
`server/core/validation/index.ts`, `server/core/controllers/public.types.ts`,
`server/core/controllers/register.ts`.

**Design:**
1. `RequestSchemas` is currently defined twice (in `validateRequest.ts` and
   `public.types.ts`). Pick one canonical definition and import it in the other.
   Recommended: keep it in `validation/validateRequest.ts` (the runtime owner) and
   have `public.types.ts` import it — or a tiny shared types file under `validation/`.
2. Add `server/core/validation/index.ts` exporting `validateRequest` (and the
   canonical `RequestSchemas`). Remove the unused `ValidatedRequest` type if it has
   no consumer (`rg "ValidatedRequest"`).
3. Update `register.ts` to import from `@core/validation` (barrel), not the private
   file path.

**Acceptance:** Exactly one `RequestSchemas` definition; `register.ts` imports the
barrel; no `@core/validation/validateRequest` deep imports remain; `tsc` clean.

**Risk:** Low.

---

## T5 — Split i18n into common / server / client ✅ (compose by spreading)

**Goal:** Server-only message keys live server-side, client-only keys live
client-side, truly-shared keys live in `shared`. Each side keeps its own catalog +
`MessageKey` type intact via spreading.

**Files:** `shared/libs/i18n/*`, `server/libs/i18n/*`, `client/libs/i18n/*`, and the
`shared/index.ts` re-export.

**Key categorization (current `shared/libs/i18n/messages.ts`):**
- **Server-only** (move to server): all `errors.*` — `errors.internal`,
  `errors.validation`, `errors.db.*`, `errors.auth.*`, `errors.notFound`,
  `errors.methodNotAllowed`.
- **Client-only** (move to client): `login.*`, `dashboard.*`, `preferences.*`,
  `pages.*`.
- **Common** (stay in shared): none are dual-consumed today — start with an empty/
  minimal `commonMessages` (e.g. brand if you want). The point is the *mechanism*,
  so future shared keys have a home.

**Design:**
1. `shared/libs/i18n` keeps the locale machinery (`Locale`, `SUPPORTED_LOCALES`,
   `DEFAULT_LOCALE`, `isLocale`, `normalizeLocale`) and a **generic** translate:
   either `translate(messages, locale, key)` or a `createTranslator(messages)`
   factory, plus `commonMessages` and a generic `MessageKey<M>` helper.
2. `server/libs/i18n`: `serverMessages = { en: { ...commonMessages.en, ...serverEn },
   bg: { ...commonMessages.bg, ...serverBg } }`; export server `MessageKey`,
   a server-bound `translate`, the existing `resolveLocale`, and `messages` =
   `serverMessages` (for back-compat with current imports). `AppError.messageKey`
   and `errorMiddleware`/`reply` keep importing `MessageKey`/`translate` from
   `@libs/i18n` — now server-scoped.
3. `client/libs/i18n`: `clientMessages = spread(common, clientOwn)`; client
   `MessageKey`, client-bound `t`/`useT`/store. Update client imports accordingly.
4. `resolveLocale` stays server-only (already is). The odd `HTTP_HEADERS`
   re-export from `server/libs/i18n` can stay or be dropped — prefer importing
   `HTTP_HEADERS` from `@libs/http`/shared directly.

**Acceptance:** `errors.*` keys exist only in the server catalog; UI keys only in
client; both sides type-check their own `MessageKey`; server error translation
(`errorMiddleware`/`reply`/`AppError`) still resolves `errors.*`; client `t()` still
resolves UI keys; `tsc` clean in all three packages.

**Risk:** Medium — touches three packages and the `MessageKey` types. Do it as one
focused commit and lean on `tsc` per package.

---

## T6 — Tidy `app.ts` import consistency ✅

**Goal:** Consistent alias usage.

**Files:** `server/app.ts`.

**Steps:** Import `errorMiddleware` / `requestContextMiddleware` via `@core/http`
(currently relative `./core/http`), matching the `@core/controllers` style.

**Acceptance:** No relative `./core/*` imports in `app.ts`; `tsc` clean.

**Risk:** None.

---

## Hygiene backlog (also in scope)

### T7 — Explicit shared barrels ✅ (no `export *`)
Replace `export *` in `shared/index.ts` (8 lines) and `shared/types/users/index.ts`
with explicit named re-exports. **Do not change RBAC contents** — only how it's
re-exported. Acceptance: no `export *` in shared barrels; `@tour-manager/shared`
public surface unchanged (same names importable); all packages `tsc` clean.

### T8 — Runtime-validate the realtime handshake ✅
`realtimeConnectedMessageSchema` exists but isn't used. Server
(`server/core/realtime/gateway.ts`) should build/emit the connected message through
the schema (parse before send); client (`client/libs/realtime/realtime.ts`) should
validate inbound with the schema instead of `Partial<RealtimeConnectedMessage>`
casts. Acceptance: both sides reference the schema; malformed handshake is rejected;
existing connect flow still works.

### T9 — Encapsulate `db` internals ✅
`pool` is reachable via the `@libs/db/pool` path alias (barrel bypass) and
`DbSessionStore` is exported from `@libs/db`... check: `DbSessionStore` is exported
from `@libs/sessions` but only used internally. Actions: keep `pool` module-internal
(don't rely on it being importable; document as private), and remove `DbSessionStore`
from the `@libs/sessions` public barrel if it has no external consumer
(`rg "DbSessionStore"`). Acceptance: no external imports of `pool` or
`DbSessionStore`; `tsc` + lint clean.

### T10 — Fix misleading `DB_USER` default ✅
`server/libs/config/env.ts` defaults `DB_USER` to `"postgres"` while the stack is
mysql2. Change the default to a mysql-appropriate value (e.g. `"root"`) or remove
the default so it must be set explicitly. Acceptance: default no longer says
`postgres`.

---

## Out of scope (do not do)
- RBAC (`shared/types/users/users.permissions.ts`) — leave as-is.
- `server/core/sql/` — leave as-is.
- Building out `hotels.controller.ts` — separate feature work.

## Final verification
- `cd server && npx tsc --noEmit` — clean.
- `cd client && npx tsc --noEmit` — clean.
- `cd shared && npx tsc --noEmit` (or workspace build) — clean.
- Lint clean across changed files.
- Manual smoke: `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/health`,
  a wrong-verb request (expect `405` + `Allow` header), and an error with
  `Accept: text/html` (expect HTML error body).
