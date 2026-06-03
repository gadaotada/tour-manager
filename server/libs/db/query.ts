import type {
    ExecuteValues,
    FieldPacket,
    PoolConnection,
    QueryResult,
    ResultSetHeader,
    RowDataPacket,
} from 'mysql2/promise';
import { isRetryableDbError, toPublicDbError, type PublicDbError } from "./errors";
import { pool } from "./pool";

type DbReadOk<T> = {
    ok: true;
    rows: T[];
    error: null;
};

type DBReadErr = {
    ok: false;
    rows: null;
    error: PublicDbError;
};

type DbReadResult<T> = DbReadOk<T> | DBReadErr;

type DbMutateHeaderOk = {
    ok: true;
    result: ResultSetHeader;
    error: null;
};

type DbMutateWithRowsOk<TRow> = {
    ok: true;
    result: ResultSetHeader;
    rows: TRow[];
    error: null;
};

type DbMutateErr = {
    ok: false;
    result: null;
    error: PublicDbError;
};

type DbMutateResult = DbMutateHeaderOk | DbMutateErr;

type DbMutateResultWithRows<TRow> = DbMutateWithRowsOk<TRow> | DbMutateErr;

const QUERY_MODE = {
    execute: 'execute',
    query: 'query',
} as const;

type QueryMode = typeof QUERY_MODE[keyof typeof QUERY_MODE];

type ConnectionMethod = <T extends QueryResult>(
    sql: string,
    values?: ExecuteValues,
) => Promise<[T, FieldPacket[]]>;

type ConnectionMethods = Record<QueryMode, ConnectionMethod>;

type QueryOptions = {
    retryCount?: number;
    shouldThrow?: boolean;
};

type ReadReturn<T, O extends QueryOptions | undefined> = O extends { shouldThrow: false }
    ? DbReadResult<T>
    : T[];

function isResultSetHeader(value: unknown): value is ResultSetHeader {
    return (
        typeof value === "object" &&
        value !== null &&
        "affectedRows" in value &&
        typeof (value as ResultSetHeader).affectedRows === "number"
    );
}

function resultSetHeaderFromReturningRows(rows: RowDataPacket[]): ResultSetHeader {
    const first = rows[0] as { id?: number } | undefined;

    return {
        fieldCount: 0,
        affectedRows: rows.length,
        insertId: Number(first?.id ?? 0),
        info: "",
        serverStatus: 0,
        warningStatus: 0,
        changedRows: 0,
    } as ResultSetHeader;
}

class QueryEngine {
    private methods: ConnectionMethods;

    constructor(connection: PoolConnection) {
        this.methods = {
            execute: connection.execute.bind(connection),
            query: connection.query.bind(connection),
        };
    }

    async read<T = RowDataPacket, O extends QueryOptions | undefined = undefined>(
        mode: QueryMode,
        sql: string,
        values?: ExecuteValues,
        options?: O,
    ): Promise<ReadReturn<T, O>> {
        const parsedOptions = {
            retryCount: options?.retryCount ?? 0,
            shouldThrow: options?.shouldThrow ?? true,
        };

        try {
            const [rows] = await this.methods[mode]<RowDataPacket[]>(sql, values);
            const typedRows = rows as T[];

            if (parsedOptions.shouldThrow) {
                return typedRows as ReadReturn<T, O>;
            }

            return { ok: true, rows: typedRows, error: null } as ReadReturn<T, O>;
        } catch (error) {
            if (parsedOptions.retryCount > 0 && isRetryableDbError(error)) {
                return this.read(mode, sql, values, {
                    ...options,
                    retryCount: parsedOptions.retryCount - 1,
                } as O);
            }

            if (parsedOptions.shouldThrow) {
                throw error;
            }

            return { ok: false, rows: null, error: toPublicDbError(error) } as ReadReturn<T, O>;
        }
    }

    async mutate(
        mode: QueryMode,
        sql: string,
        values?: ExecuteValues,
        options?: QueryOptions,
    ): Promise<DbMutateResult>;
    async mutate<TRow>(
        mode: QueryMode,
        sql: string,
        values?: ExecuteValues,
        options?: QueryOptions,
    ): Promise<DbMutateResultWithRows<TRow>>;
    async mutate<TRow>(
        mode: QueryMode,
        sql: string,
        values?: ExecuteValues,
        options?: QueryOptions,
    ): Promise<DbMutateResult | DbMutateResultWithRows<TRow>> {
        const parsedOptions = {
            retryCount: options?.retryCount ?? 0,
            shouldThrow: options?.shouldThrow ?? false,
        };

        try {
            const [first] = await this.methods[mode]<RowDataPacket[] | ResultSetHeader>(sql, values);

            // INSERT … RETURNING (MariaDB): mysql2 gives a row array; plain INSERT gives ResultSetHeader.
            if (Array.isArray(first)) {
                const rows = first as TRow[];
                const result = resultSetHeaderFromReturningRows(first);

                return { ok: true, result, rows, error: null };
            }

            if (!isResultSetHeader(first)) {
                throw new Error("Mutate returned an unexpected result shape.");
            }

            return { ok: true, result: first, error: null };
        } catch (error) {
            if (parsedOptions.retryCount > 0 && isRetryableDbError(error)) {
                return this.mutate(mode, sql, values, { ...options, retryCount: parsedOptions.retryCount - 1 });
            }

            if (parsedOptions.shouldThrow) {
                throw error;
            }

            return { ok: false, result: null, error: toPublicDbError(error) };
        }
    }
}

const query = async <T>(fn: (qe: QueryEngine) => Promise<T>): Promise<T> => {
    const conn = await pool.getConnection();
    const qe = new QueryEngine(conn);
    try {
        return await fn(qe);
    } finally {
        conn.release();
    }
};

const transaction = async <T>(fn: (qe: QueryEngine) => Promise<T>): Promise<T> => {
    const conn = await pool.getConnection();
    const qe = new QueryEngine(conn);
    try {
        await conn.beginTransaction();
        const result = await fn(qe);
        await conn.commit();
        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};

export {
    QueryEngine,
    QUERY_MODE,
    type DbMutateResult,
    type DbMutateResultWithRows,
    type QueryMode,
    query,
    transaction,
};
