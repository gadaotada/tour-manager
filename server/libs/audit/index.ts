import { query } from "@libs/db";
import { AUDIT_ACTIONS, type AuditAction, type AuditResource } from "@tour-manager/shared";

export { AUDIT_ACTIONS };

interface AuditBasePayload {
    user_id: string;
    resource: AuditResource;
    resource_id?: string | number | null;
}

interface AuditCreatePayload extends AuditBasePayload {
    data: Record<string, unknown>;
}

interface AuditUpdatePayload extends AuditBasePayload {
    data: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
    }
}

interface AuditDeletePayload extends AuditBasePayload {}

interface AuditOtherPayload extends AuditBasePayload {
    data: Record<string, unknown>;
}

type AuditRecordPayload = AuditCreatePayload | AuditUpdatePayload | AuditDeletePayload | AuditOtherPayload;

function safeStringify(data: unknown | undefined | null ): string {
    if (!data) return '{}';

    try {
        return JSON.stringify(data);
    } catch (error) {
        // Handle circular references or other serialization issues
        return JSON.stringify({ error: "Data could not be serialized" });
    }
}

function normalizeRecordData(action: AuditAction, payload: AuditRecordPayload): unknown {
    if (!("data" in payload)) {
        return undefined;
    }

    if (action !== "UPDATE") {
        return payload.data;
    }

    return pickChangedFields((payload as AuditUpdatePayload).data);
}

function pickChangedFields(data: AuditUpdatePayload["data"]): AuditUpdatePayload["data"] {
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};

    for (const key of Object.keys(data.after)) {
        const beforeValue = data.before[key];
        const afterValue = data.after[key];

        if (areAuditValuesEqual(beforeValue, afterValue)) {
            continue;
        }

        before[key] = beforeValue;
        after[key] = afterValue;
    }

    return { before, after };
}

function areAuditValuesEqual(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) {
        return true;
    }

    if (typeof left !== "object" || typeof right !== "object" || left === null || right === null) {
        return false;
    }

    return safeStringify(left) === safeStringify(right);
}

function normalizeResourceIdentifier(resource_id: string | number | null | undefined): string | null {
    if (resource_id === undefined) return null;
    return String(resource_id);
}

function record(action: "CREATE", payload: AuditCreatePayload): void;
function record(action: "UPDATE", payload: AuditUpdatePayload): void;
function record(action: "DELETE", payload: AuditDeletePayload): void;
function record(action: "OTHER", payload: AuditOtherPayload): void;
function record(action: AuditAction, payload: AuditRecordPayload): void {
    query(async (qe) => {
        const sql = "INSERT INTO audit_logs (user_id, resource, resource_id, action, data) VALUES (?, ?, ?, ?, ?)";
        const data = safeStringify(normalizeRecordData(action, payload));

        await qe.mutate(
            "execute",
            sql,
            [payload.user_id, payload.resource, normalizeResourceIdentifier(payload.resource_id), action, data],
            { shouldThrow: false },
        );
    // no op, audit logs are best-effort and should not interfere with the main application flow
    }).catch(() => {});
}

const AuditLog = {
    record,
};

// example usage:
// AuditLog.record("CREATE", { user_id: "1", resource: "USERS", resource_id: "2", data: { username: "test" } });
// AuditLog.record("UPDATE", { user_id: "1", resource: "HOTELS", resource_id: "1", data: { before: { stars: 5 }, after: { stars: 4 } } });
// AuditLog.record("DELETE", { user_id: "1", resource: "HOTELS", resource_id: "1", data: { name: "Test Hotel" } });
// AuditLog.record("OTHER", { user_id: "1", resource: "HOTELS", resource_id: "1", data: { notes: "Some additional information" } });

export { AuditLog };
