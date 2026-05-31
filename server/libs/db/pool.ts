import { createPool } from "mysql2/promise";
import { env } from "@libs/config";

// Internal module — consumed only by ./query.ts.
const pool = createPool({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    connectTimeout: env.dbConnectTimeout,
    waitForConnections: env.dbWaitForConnections,
    connectionLimit: env.dbConnectionLimit,
    queueLimit: env.dbQueueLimit,
});

export { pool };
