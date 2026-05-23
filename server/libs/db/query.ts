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

type DbMutateOk = {
    ok: true;
    result: ResultSetHeader;
    error: null;
};

type DbMutateErr = {
    ok: false;
    result: null;
    error: PublicDbError;
};

type DbMutateResult = DbMutateOk | DbMutateErr;

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

class QueryEngine {
    private methods: ConnectionMethods;

    constructor(connection: PoolConnection) {
        this.methods = {
            execute: connection.execute.bind(connection) as ConnectionMethod,
            query: connection.query.bind(connection) as ConnectionMethod,
        };
    }

    async read<T = RowDataPacket>(mode: QueryMode, sql: string, values?: ExecuteValues, options?: QueryOptions): Promise<DbReadResult<T>>  {
        const parsedOptions = {
            retryCount: options?.retryCount ?? 0,
            shouldThrow: options?.shouldThrow ?? false,
        }

        try {
            const [rows] = await this.methods[mode]<RowDataPacket[]>(sql, values);

            return { ok: true, rows: rows as T[], error: null };
        } catch (error) {
            if (parsedOptions.retryCount > 0 && isRetryableDbError(error)) {
                return this.read(mode, sql, values, { ...options, retryCount: parsedOptions.retryCount - 1 });
            }

            if (parsedOptions.shouldThrow) {
                throw error;
            }

            return { ok: false, rows: null, error: toPublicDbError(error) };
        }
    }

    async mutate(mode: QueryMode, sql: string, values?: ExecuteValues, options?: QueryOptions): Promise<DbMutateResult> {
        const parsedOptions = {
            retryCount: options?.retryCount ?? 0,
            shouldThrow: options?.shouldThrow ?? false,
        }

        try {
            const [result] = await this.methods[mode]<ResultSetHeader>(sql, values);

            return { ok: true, result, error: null };
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
    type QueryMode,
    query,
    transaction
}
