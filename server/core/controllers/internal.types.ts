import type {
    AppMiddleware,
    RequestSchemas,
    RouteHandler,
    RouteMiddleware,
    RoutePipelineStep,
} from "./public.types";

type AllowedMethods = "get" | "post" | "put" | "patch" | "delete";

type RouteDefinition = {
    method: AllowedMethods;
    path: string;
    schemas?: RequestSchemas;
    handlers: RoutePipelineStep[];
};

type ControllerInternals = {
    basePath: string;
    middlewares: AppMiddleware[];
    routes: RouteDefinition[];
};

// Per-route builder. `ControllerExtra` is the controller-wide context (from
// `.with(...)`) and is fixed for the route. `StepExtra` grows as `.use(...)`
// adds route-local enrichment, so later steps see it — but it stays local to
// this route: `.handle()` returns the controller at `ControllerExtra` only.
type RouteBuilder<
    ControllerExtra,
    StepExtra,
    Schemas extends RequestSchemas | undefined,
> = {
    schemas: <S extends RequestSchemas>(schemas: S) => RouteBuilder<ControllerExtra, StepExtra, S>;
    use: <Adds = object>(
        middleware: RouteMiddleware<Adds, StepExtra, Schemas>,
    ) => RouteBuilder<ControllerExtra, StepExtra & Adds, Schemas>;
    handle: (handler: RouteHandler<Schemas, StepExtra>) => AppController<ControllerExtra>;
};

type RouteStarter<Extra> = (path: string) => RouteBuilder<Extra, Extra, undefined>;

type AppController<Extra = object> = {
    GET: RouteStarter<Extra>;
    POST: RouteStarter<Extra>;
    PUT: RouteStarter<Extra>;
    PATCH: RouteStarter<Extra>;
    DELETE: RouteStarter<Extra>;
};

// Internal-only contract: `registerControllers` reads the assembled routes
// through this, so `build()` stays off the public `AppController` surface.
type BuildableController = {
    build: () => ControllerInternals;
};

// `with` returns a plain controller (no `with`), so setup middleware cannot be
// appended after routes are declared.
type ControllerWithMethod<Extra = object> = {
    <Adds = object>(middleware: AppMiddleware<Adds, Extra>): AppController<Extra & Adds>;
    <AddsA = object, AddsB = object>(
        middlewareA: AppMiddleware<AddsA, Extra>,
        middlewareB: AppMiddleware<AddsB, Extra & AddsA>,
    ): AppController<Extra & AddsA & AddsB>;
};

type AppControllerBuilder<Extra = object> = AppController<Extra> & {
    with: ControllerWithMethod<Extra>;
};

export {
    type AllowedMethods,
    type AppController,
    type AppControllerBuilder,
    type BuildableController,
    type ControllerInternals,
    type ControllerWithMethod,
    type RouteBuilder,
    type RouteDefinition,
    type RouteStarter,
};
