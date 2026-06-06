import type { z } from "zod";

import type { listAuditLogsQuerySchema } from "../../schemas/audit";
import type { PaginatedResult } from "../pagination";
import type { AuditAction, AuditResource } from "../../schemas/audit";

type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;

type AuditLog = {
  id: number;
  user_id: string;
  actor_display_name: string;
  actor_username: string;
  action: AuditAction;
  resource: AuditResource;
  resource_id: string | null;
  data: Record<string, unknown>;
  created_at: string;
};

type AuditLogsListQuery = Pick<
  ListAuditLogsQuery,
  "search" | "action" | "resource" | "user_id" | "resource_id" | "sort_by" | "sort_dir"
>;

type AuditLogsListResult = PaginatedResult<AuditLog[], AuditLogsListQuery>;

export type {
  AuditLog,
  AuditLogsListQuery,
  AuditLogsListResult,
  ListAuditLogsQuery,
};
