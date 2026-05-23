import { createPool } from "mysql2/promise";
import { env } from "@libs/config";

export const pool = createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  connectTimeout: env.dbConnectTimeout, // 10 seconds
  waitForConnections: env.dbWaitForConnections,
  connectionLimit: env.dbConnectionLimit,
  queueLimit: env.dbQueueLimit,
});
