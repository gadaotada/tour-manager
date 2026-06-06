import { query } from "@libs/db";
import type { PERMISSIONS } from "@tour-manager/shared";

type AuditResource = Exclude<keyof typeof PERMISSIONS, "DASHBOARD"> | "OTHER";
type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "OTHER";

interface AuditBasePayload {
    user_id: string;
    resource: AuditResource;
    resource_id?: string | null;
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

interface AuditDeletePayload extends AuditBasePayload {
    data: Record<string, unknown>;
}

interface AuditOtherPayload extends AuditBasePayload {
    data: Record<string, unknown>;
}

type AuditRecordPayload = AuditCreatePayload | AuditUpdatePayload | AuditDeletePayload | AuditOtherPayload;

function safeStringify(data: unknown): string {
    try {
        return JSON.stringify(data);
    } catch (error) {
        // Handle circular references or other serialization issues
        return JSON.stringify({ error: "Data could not be serialized" });
    }
}

function record(action: "CREATE", payload: AuditCreatePayload): void;
function record(action: "UPDATE", payload: AuditUpdatePayload): void;
function record(action: "DELETE", payload: AuditDeletePayload): void;
function record(action: "OTHER", payload: AuditOtherPayload): void;
function record(action: AuditAction, payload: AuditRecordPayload): void {
    query(async (qe) => {
        const sql = "INSERT INTO audit_logs (user_id, resource, resource_id, action, data) VALUES (?, ?, ?, ?, ?)";
        const data = safeStringify(payload.data);

        await qe.mutate(
            "execute",
            sql,
            [payload.user_id, payload.resource, payload.resource_id ?? null, action, data],
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
