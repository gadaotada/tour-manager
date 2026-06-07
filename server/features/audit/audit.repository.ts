import { query } from "@libs/db";
import type { ExecuteValues } from "mysql2";
import {
  type AuditLog,
  type AuditAction,
  type AuditResource,
  type ListAuditLogsQuery,
} from "@tour-manager/shared";

type AuditRow = {
  id: number;
  user_id: string;
  actor_display_name: string;
  actor_username: string;
  action: AuditAction;
  resource: AuditResource;
  resource_id: string | null;
  data: Record<string, unknown> | string | null;
  created_at: string;
};

const AUDIT_SORT_COLUMN_BY_KEY = {
  created_at: "al.created_at",
  action: "al.action",
  resource: "al.resource",
  actor_display_name: "u.display_name",
} satisfies Record<ListAuditLogsQuery["sort_by"], string>;

type AuditLogsSql = {
  countSql: string;
  countValues: ExecuteValues;
  sql: string;
  values: ExecuteValues;
};

type ListAuditLogsOptions = {
    includeAdmins: boolean;
};

async function getAuditLogs(queryParams: ListAuditLogsQuery, options: ListAuditLogsOptions) {
    const { sql, values, countSql, countValues } = buildAuditLogsSql(queryParams, options);

    return query(async (qe) => {
        const rows = await qe.read<AuditRow>("execute", sql, values);
        const count = await qe.read<{ total: number }>("execute", countSql, countValues);

        return {
            rows: rows.map(normalizeAuditRow),
            total: count[0]?.total ?? 0,
        };
    });
}

function normalizeAuditRow(row: AuditRow): AuditLog {
    return {
        ...row,
        data: parseAuditData(row.data),
    };
}

function parseAuditData(data: AuditRow["data"]): Record<string, unknown> {
    if (isPlainRecord(data)) {
        return data;
    }

    if (typeof data !== "string") {
        return {};
    }

    try {
        const parsed: unknown = JSON.parse(data);

        return isPlainRecord(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildAuditLogsSql(queryParams: ListAuditLogsQuery, options: ListAuditLogsOptions): AuditLogsSql {
    const values: ExecuteValues = [];
    const whereClauses: string[] = [];

    if (!options.includeAdmins) {
        whereClauses.push("u.role <> 'ADMIN'");
    }

    if (queryParams.action) {
        whereClauses.push("al.action = ?");
        values.push(queryParams.action);
    }

    if (queryParams.resource) {
        whereClauses.push("al.resource = ?");
        values.push(queryParams.resource);
    }

    if (queryParams.user_id) {
        whereClauses.push("al.user_id = ?");
        values.push(queryParams.user_id);
    }

    if (queryParams.resource_id) {
        whereClauses.push("al.resource_id = ?");
        values.push(queryParams.resource_id);
    }

    if (queryParams.search) {
        whereClauses.push("(u.display_name LIKE ? OR u.username LIKE ? OR al.resource_id LIKE ?)");
        const searchValue = `%${queryParams.search}%`;
        values.push(searchValue, searchValue, searchValue);
    }

    const fromSql = `
        FROM audit_logs al
        JOIN users u ON u.id = al.user_id
    `;
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const orderBySql = `ORDER BY ${AUDIT_SORT_COLUMN_BY_KEY[queryParams.sort_by]} ${queryParams.sort_dir}`;
    const limit = queryParams.page_size;
    const offset = (queryParams.page - 1) * queryParams.page_size;

    return {
    sql: `
        SELECT
        al.id,
        al.user_id,
        u.display_name AS actor_display_name,
        u.username AS actor_username,
        al.action,
        al.resource,
        al.resource_id,
        al.data,
        al.created_at
        ${fromSql}
        ${whereSql}
        ${orderBySql}
        LIMIT ? OFFSET ?
    `,
    values: [...values, limit, offset],
    countSql: `
        SELECT COUNT(*) AS total
        ${fromSql}
        ${whereSql}
    `,
    countValues: values,
    };
}

export const auditRepository = {
  getAuditLogs,
};
