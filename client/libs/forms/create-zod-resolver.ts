import type {
    FieldError,
    FieldErrors,
    FieldValues,
    Resolver,
    ResolverResult,
} from "react-hook-form";
import type { ZodTypeAny, z } from "zod";

import { t, type MessageKey } from "@libs/i18n";

function translateSchemaMessage(message: string): string {
    if (message.includes(".")) {
        return t(message as MessageKey);
    }

    return message;
}

function createZodResolver<TFieldValues extends FieldValues>(
    schema: ZodTypeAny & { _output: TFieldValues },
): Resolver<TFieldValues> {
    return async (values) => {
        const parsed = schema.safeParse(values);

        if (parsed.success) {
            return { values: parsed.data, errors: {} };
        }

        const errors = {} as FieldErrors<TFieldValues>;
        const fieldErrors = errors as Record<string, FieldError>;

        for (const issue of parsed.error.issues) {
            const field = issue.path[0];
            if (typeof field !== "string") continue;

            if (fieldErrors[field]) continue;

            fieldErrors[field] = {
                message: translateSchemaMessage(issue.message),
                type: "validation",
            };
        }

        return { values, errors } as ResolverResult<TFieldValues>;
    };
}

export { createZodResolver };
