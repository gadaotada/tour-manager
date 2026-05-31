import type { RequestHandler } from "express";

import type { AppMiddleware, ProceedSignal } from "./public.types";

// Adapts a classic Express middleware into an AppMiddleware so it can run inside
// the controller pipeline:
//   - next()      -> advances the pipeline
//   - next(err)   -> rejects into the shared error pipeline
//   - res.send/.. -> the `finish` event stops the pipeline (headersSent), so a
//                    guard that responds WITHOUT calling next still works
//
// A middleware that neither responds nor calls next will hang, exactly as it
// would in a plain Express stack.
function fromExpress(handler: RequestHandler): AppMiddleware {
    return (ctx) =>
        new Promise<ProceedSignal | void>((resolve, reject) => {
            let settled = false;

            const onFinish = () => settle();

            const settle = (err?: unknown) => {
                if (settled) return;
                settled = true;
                ctx.res.off("finish", onFinish);

                if (err) {
                    reject(err instanceof Error ? err : new Error(String(err)));
                    return;
                }

                resolve(ctx.proceed());
            };

            ctx.res.once("finish", onFinish);
            handler(ctx.req, ctx.res, settle);
        });
}

export { fromExpress };
