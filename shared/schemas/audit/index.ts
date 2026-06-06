import { z } from "zod";

import { schemaMessage } from "../../libs/validation";
import { PERMISSIONS } from "../../types/users/users.permissions";
import { createTranslatedSortedListQuerySchema } from "../common";

const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "OTHER",
] as const;

type AuditAction = (typeof AUDIT_ACTIONS)[number];
type AuditResource = Exclude<keyof typeof PERMISSIONS, "DASHBOARD"> | "OTHER";

const AUDIT_RESOURCES = Object.freeze([
  ...Object.keys(PERMISSIONS).filter((resource) => resource !== "DASHBOARD"),
  "OTHER",
] as AuditResource[]);

const AUDIT_SORT_BY_COLS = [
  "created_at",
  "action",
  "resource",
  "actor_display_name",
] as const;

const auditSearchQuerySchema = z
  .string()
  .trim()
  .max(255, schemaMessage("audit.validation.search.max"))
  .optional()
  .transform((value) => (value === undefined || value.length === 0 ? undefined : value));

const isAuditResource = (value: string): value is AuditResource => {
  return (AUDIT_RESOURCES as readonly string[]).includes(value);
};

const listAuditLogsQuerySchema = createTranslatedSortedListQuerySchema(AUDIT_SORT_BY_COLS, {
  messagePrefix: "audit.validation.list",
  defaults: { sort_by: "created_at", sort_dir: "DESC" },
}).extend({
  search: auditSearchQuerySchema,
  action: z.enum(AUDIT_ACTIONS, schemaMessage("audit.validation.action.invalid")).optional(),
  resource: z
    .custom<AuditResource>(
      (value) => typeof value === "string" && isAuditResource(value),
      schemaMessage("audit.validation.resource.invalid"),
    )
    .optional(),
  user_id: z.string().uuid(schemaMessage("audit.validation.user_id.uuid")).optional(),
  resource_id: z
    .string()
    .trim()
    .max(80, schemaMessage("audit.validation.resource_id.max"))
    .optional()
    .transform((value) => (value === undefined || value.length === 0 ? undefined : value)),
});

export {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  AUDIT_SORT_BY_COLS,
  listAuditLogsQuerySchema,
  type AuditAction,
  type AuditResource,
};
