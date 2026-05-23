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
