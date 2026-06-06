import { buildPaginatedResult } from "@libs/db";
import {
    PERMISSIONS,
    hasPermission,
    type ClientUser,
    type ListAuditLogsQuery,
} from "@tour-manager/shared";
import { auditRepository } from "./audit.repository";


async function listLogs(actor: ClientUser, payload: ListAuditLogsQuery) {
    const includeAdmins = hasPermission(actor.permissions, PERMISSIONS.USERS.READ_ANY);
    const { rows, total } = await auditRepository.getAuditLogs(payload, { includeAdmins });

    return buildPaginatedResult({
        page: payload.page,
        page_size: payload.page_size,
        total,
        data: rows,
        query: {
            action: payload.action,
            resource: payload.resource,
            resource_id: payload.resource_id,
            search: payload.search,
            sort_by: payload.sort_by,
            sort_dir: payload.sort_dir,
            user_id: payload.user_id,
        },
    });
}

export const auditService = {
    listLogs,
};
