import type { AuditLog, AuditResource } from "@tour-manager/shared";

import type { MessageKey } from "@libs/i18n";

type AuditFormatResource = Extract<AuditResource, "CLIENTS" | "HOTELS" | "USERS">;

type AuditUpdateData = {
    after: Record<string, unknown>;
    before: Record<string, unknown>;
};

type Translate = (key: MessageKey) => string;
type AuditFormatter = (audit: AuditLog, t: Translate) => string;

const AUDIT_RESOURCE_LABELS = {
    CLIENTS: "logs.formatter.resources.CLIENTS",
    HOTELS: "logs.formatter.resources.HOTELS",
    USERS: "logs.formatter.resources.USERS",
} satisfies Record<AuditFormatResource, MessageKey>;

const AUDIT_FIELD_LABELS: Record<string, MessageKey> = {
    address: "logs.formatter.fields.address",
    display_name: "logs.formatter.fields.display_name",
    egn: "logs.formatter.fields.egn",
    email: "logs.formatter.fields.email",
    is_active: "logs.formatter.fields.is_active",
    is_enabled: "logs.formatter.fields.is_enabled",
    name: "logs.formatter.fields.name",
    permission_overrides: "logs.formatter.fields.permission_overrides",
    phone_number: "logs.formatter.fields.phone_number",
    role: "logs.formatter.fields.role",
    stars: "logs.formatter.fields.stars",
    username: "logs.formatter.fields.username",
};

const AUDIT_RESOURCE_FORMATTERS = {
    CLIENTS: formatGeneralAuditLog,
    HOTELS: formatGeneralAuditLog,
    USERS: formatGeneralAuditLog,
} satisfies Record<AuditFormatResource, AuditFormatter>;

function formatAuditLog(audit: AuditLog, t: Translate): string {
    const formatter = isKnownFormatResource(audit.resource)
        ? AUDIT_RESOURCE_FORMATTERS[audit.resource]
        : formatGeneralAuditLog;

    return formatter(audit, t);
}

function formatGeneralAuditLog(audit: AuditLog, t: Translate): string {
    const actor =
        audit.actor_display_name || audit.actor_username || t("logs.formatter.actorFallback");
    const resource = formatResource(audit.resource, t);
    const resourceId = formatResourceId(audit.resource_id, t);

    switch (audit.action) {
        case "CREATE":
            return joinAuditParts([actor, t("logs.formatter.actions.CREATE"), resource]);
        case "UPDATE":
            return joinAuditParts([
                actor,
                t("logs.formatter.actions.UPDATE"),
                resource,
                resourceId,
                formatUpdateAuditValues(audit.data, t),
            ]);
        case "DELETE":
            return joinAuditParts([
                actor,
                t("logs.formatter.actions.DELETE"),
                resource,
                resourceId,
            ]);
        case "OTHER":
            return joinAuditParts([
                actor,
                t("logs.formatter.actions.OTHER"),
                resource,
                resourceId,
                formatCreateAuditValues(audit.data, t),
            ]);
        default:
            return joinAuditParts([actor, t("logs.formatter.actions.OTHER"), resource, resourceId]);
    }
}

function formatResource(resource: AuditResource, t: Translate): string {
    return isKnownFormatResource(resource)
        ? t(AUDIT_RESOURCE_LABELS[resource])
        : t("logs.formatter.resources.OTHER");
}

function formatResourceId(resource_id: string | null, t: Translate): string {
    if (!resource_id) {
        return t("logs.formatter.noResourceId");
    }

    return t("logs.formatter.resourceId").replace("{resource_id}", resource_id);
}

function formatCreateAuditValues(data: AuditLog["data"], t: Translate): string {
    const entries = Object.entries(data);

    if (entries.length === 0) {
        return t("logs.formatter.emptyDetails");
    }

    return entries
        .map(
            ([field, value]) =>
                `${formatFieldLabel(field, t)}: ${formatAuditValue(field, value, t)}`,
        )
        .join(", ");
}

function formatUpdateAuditValues(data: AuditLog["data"], t: Translate): string {
    if (!isAuditUpdateData(data)) {
        return formatCreateAuditValues(data, t);
    }

    const fields = Array.from(new Set([...Object.keys(data.before), ...Object.keys(data.after)]));

    if (fields.length === 0) {
        return t("logs.formatter.emptyDetails");
    }

    return fields
        .map((field) => formatChangedField(field, data.before[field], data.after[field], t))
        .join(", ");
}

function formatChangedField(field: string, before: unknown, after: unknown, t: Translate): string {
    const fieldLabel = formatFieldLabel(field, t);

    if (before === undefined || after === undefined) {
        return t("logs.formatter.changedFields.changed").replace("{field}", fieldLabel);
    }

    return t("logs.formatter.changedFields.fromTo")
        .replace("{field}", fieldLabel)
        .replace("{before}", formatAuditValue(field, before, t))
        .replace("{after}", formatAuditValue(field, after, t));
}

function formatFieldLabel(field: string, t: Translate): string {
    const labelKey = AUDIT_FIELD_LABELS[field];

    return labelKey ? t(labelKey) : field.replaceAll("_", " ");
}

function formatAuditValue(field: string, value: unknown, t: Translate): string {
    if (value === null || value === undefined || value === "") {
        return t("logs.formatter.values.nullish");
    }

    if (typeof value === "boolean") {
        return formatBooleanAuditValue(field, value, t);
    }

    if (typeof value === "string") {
        return `"${value}"`;
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return formatAuditArrayValue(value, t);
    }

    if (typeof value === "object") {
        return formatAuditObjectValue(value, t);
    }

    return String(value);
}

function formatBooleanAuditValue(field: string, value: boolean, t: Translate): string {
    if (field === "is_active") {
        return value ? t("logs.formatter.values.active") : t("logs.formatter.values.inactive");
    }

    if (field === "is_enabled") {
        return value ? t("logs.formatter.values.enabled") : t("logs.formatter.values.disabled");
    }

    return String(value);
}

function formatAuditArrayValue(value: unknown[], t: Translate): string {
    if (value.length === 0) {
        return t("logs.formatter.values.nullish");
    }

    if (value.every(isPermissionOverrideValue)) {
        return value.map((override) => `${override.permission} ${override.effect}`).join(", ");
    }

    return t(
        value.length === 1 ? "logs.formatter.values.oneItem" : "logs.formatter.values.manyItems",
    ).replace("{count}", String(value.length));
}

function formatAuditObjectValue(value: object, t: Translate): string {
    try {
        return JSON.stringify(value);
    } catch {
        return t("logs.formatter.changedFields.changed").replace(
            "{field}",
            t("logs.formatter.fields.value"),
        );
    }
}

function isKnownFormatResource(resource: AuditResource): resource is AuditFormatResource {
    return resource === "CLIENTS" || resource === "HOTELS" || resource === "USERS";
}

function isAuditUpdateData(data: AuditLog["data"]): data is AuditUpdateData {
    return isPlainRecord(data.before) && isPlainRecord(data.after);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPermissionOverrideValue(
    value: unknown,
): value is { effect: string; permission: string } {
    return (
        isPlainRecord(value) &&
        typeof value.permission === "string" &&
        typeof value.effect === "string"
    );
}

function joinAuditParts(parts: string[]): string {
    return parts.filter((part) => part.trim().length > 0).join(" ");
}

export { formatAuditLog };
