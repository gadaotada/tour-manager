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

## Client Locale And i18n

- Locale preference is client-only for now (`client/libs/i18n/locale-store.ts`), separate from server `UserSettings`.
- Keep the `app-lang` request header in sync via the axios interceptor / `bootstrapLocaleHeaderSync()`.
- Remount the route tree on locale change (`<Outlet key={locale} />` in `__root.tsx`) until page subtrees subscribe to locale reactively.
- Use `t()` / `useT()` for UI copy; never hard-code user-visible strings in components.
