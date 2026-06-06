import type {
  AuditLogsListResult,
  ListAuditLogsQuery,
} from "@tour-manager/shared";

import { api } from "@libs/api";

function toListParams(query: ListAuditLogsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    page_size: query.page_size,
    sort_by: query.sort_by,
    sort_dir: query.sort_dir,
  };

  if (query.search) {
    params.search = query.search;
  }

  if (query.action) {
    params.action = query.action;
  }

  if (query.resource) {
    params.resource = query.resource;
  }

  if (query.user_id) {
    params.user_id = query.user_id;
  }

  if (query.resource_id) {
    params.resource_id = query.resource_id;
  }

  return params;
}

async function listAudits(query: ListAuditLogsQuery): Promise<AuditLogsListResult> {
  return api.json.get<AuditLogsListResult>("/api/audit/list", {
    params: toListParams(query),
  });
}

export { listAudits };
