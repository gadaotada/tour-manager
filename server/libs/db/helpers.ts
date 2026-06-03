import type { SortDir } from "@tour-manager/shared";
import type { ExecuteValues } from "mysql2";
import { normalizePagination } from "./paginations";

type BaseUpdateFields<Id = number> = {
    id: Id;
    version: number;
};

const GENERAL_EXCLUDED_COLS = ["id", "version"];

function buildGeneralUpdateSql<T extends BaseUpdateFields>(fields: T, tableName: string) {
    const safeEntries = Object.entries(fields)
        .filter(([key]) => !GENERAL_EXCLUDED_COLS.includes(key))
        .map(([key, value]) => ({
            name: key,
            value,
        }));

    if (safeEntries.length === 0) throw new Error("No fields to update");

    const setSql = safeEntries.map((entry) => `${entry.name} = ?`).join(", ");

    const sql = `
        UPDATE ${tableName}
        SET ${setSql}, version = version + 1
        WHERE id = ? AND version = ?;
    `.trim();

    return {
        sql,
        values: [...safeEntries.map((entry) => entry.value), fields.id, fields.version] as ExecuteValues,
    };
}

type PaginationFilter = {
    column: string;
    operator?: "=" | "<>";
    value: string | number | boolean;
};

type PaginationConfig = {
    page: number;
    page_size: number;
    searchBy?: string[];
    searchValue?: string | number;
    sort_by?: string;
    sort_dir?: SortDir;
    filters?: PaginationFilter[];
};

function buildGeneralPaginatedSelectSql(tableName: string, cols: readonly string[], paginationConfig: PaginationConfig) {
    const values: ExecuteValues = [];
    const countValues: ExecuteValues = [];
    const selectCols = cols.join(", ");
    const searchBy = paginationConfig.searchBy;
    const searchValue = paginationConfig.searchValue;
    const shouldSearch =
        searchBy &&
        searchBy.length > 0 &&
        searchValue !== undefined &&
        searchValue !== "";

    let sql = `SELECT ${selectCols} FROM ${tableName}`;
    let countSql = `SELECT COUNT(*) AS total FROM ${tableName}`;

    const whereClauses: string[] = [];
    const whereValues: ExecuteValues = [];

    if (shouldSearch) {
        const searchSql = searchBy.map((col) => `${col} LIKE ?`).join(" OR ");
        whereClauses.push(`(${searchSql})`);
        whereValues.push(...searchBy.map(() => `%${searchValue}%`));
    }

    for (const filter of paginationConfig.filters ?? []) {
        whereClauses.push(`${filter.column} ${filter.operator ?? "="} ?`);
        whereValues.push(filter.value);
    }

    if (whereClauses.length > 0) {
        const whereSql = ` WHERE ${whereClauses.join(" AND ")}`;
        sql += whereSql;
        countSql += whereSql;
        values.push(...whereValues);
        countValues.push(...whereValues);
    }

    if (paginationConfig.sort_by) {
        sql += ` ORDER BY ${paginationConfig.sort_by} ${paginationConfig.sort_dir ?? "DESC"}`;
    }

    const { page_size, offset } = normalizePagination({
        page: paginationConfig.page,
        page_size: paginationConfig.page_size,
    });

    sql += ` LIMIT ? OFFSET ?`;
    values.push(page_size, offset);

    return { sql, values, countSql, countValues };
}

export { buildGeneralUpdateSql, buildGeneralPaginatedSelectSql };
