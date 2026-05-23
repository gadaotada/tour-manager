import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["silent", "error", "warn", "info", "debug"]).default("info"),
  LOG_REPORT_ERRORS: z.coerce.boolean().default(false),
  LOG_REPORT_WARNINGS: z.coerce.boolean().default(false),
  APP_BUILD_ID: z.string().default("local"),
  APP_RELEASE: z.string().optional(),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default("password"),
  DB_NAME: z.string().default("tour_manager"),
  DB_CONNECT_TIMEOUT: z.coerce.number().int().positive().default(10000), // 10 seconds
  DB_WAIT_FOR_CONNECTIONS: z.coerce.boolean().default(true),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  DB_QUEUE_LIMIT: z.coerce.number().int().positive().default(0), // 0 means no limit
});

const parsedEnv = envSchema.parse(process.env);

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  clientOrigin: parsedEnv.CLIENT_ORIGIN,
  logLevel: parsedEnv.LOG_LEVEL,
  logReportErrors: parsedEnv.LOG_REPORT_ERRORS,
  logReportWarnings: parsedEnv.LOG_REPORT_WARNINGS,
  appBuildId: parsedEnv.APP_BUILD_ID,
  appRelease: parsedEnv.APP_RELEASE,
  dbHost: parsedEnv.DB_HOST,
  dbPort: parsedEnv.DB_PORT,
  dbUser: parsedEnv.DB_USER,
  dbPassword: parsedEnv.DB_PASSWORD,
  dbName: parsedEnv.DB_NAME,
  dbConnectTimeout: parsedEnv.DB_CONNECT_TIMEOUT,
  dbWaitForConnections: parsedEnv.DB_WAIT_FOR_CONNECTIONS,
  dbConnectionLimit: parsedEnv.DB_CONNECTION_LIMIT,
  dbQueueLimit: parsedEnv.DB_QUEUE_LIMIT,
};
