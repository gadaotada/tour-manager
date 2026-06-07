import { useState } from "react";

import type { AuditLog } from "@tour-manager/shared";

import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { useT } from "@libs/i18n";

import { formatAuditLog } from "./audit.formatter";

type AuditDetailsDialogProps = {
  audit: AuditLog | null;
  onOpenChange: (open: boolean) => void;
};

function AuditDetailsDialog({ audit, onOpenChange }: AuditDetailsDialogProps) {
  const t = useT();
  const [showRawData, setShowRawData] = useState(false);
  const open = audit !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setShowRawData(false);
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("logs.details.title")}</DialogTitle>
          <DialogDescription>
            {audit ? formatAuditLog(audit, t) : ""}
          </DialogDescription>
        </DialogHeader>

        {audit ? (
          <div className="space-y-3">
            <div className="grid gap-2 rounded-md border bg-surface-muted p-3 text-sm sm:grid-cols-2">
              <AuditDetailItem label={t("logs.columns.actor")} value={audit.actor_display_name} />
              <AuditDetailItem label={t("logs.columns.action")} value={t(`logs.actions.${audit.action}`)} />
              <AuditDetailItem label={t("logs.columns.resource")} value={t(`logs.resources.${audit.resource}`)} />
              <AuditDetailItem
                label={t("logs.columns.resource_id")}
                value={audit.resource_id ?? t("logs.table.noResourceId")}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRawData((value) => !value)}
            >
              {showRawData ? t("logs.details.hideRaw") : t("logs.details.showRaw")}
            </Button>

            {showRawData ? (
              <pre className="max-h-80 overflow-auto rounded-md border bg-background p-3 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
                {JSON.stringify(audit.data, null, 2)}
              </pre>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type AuditDetailItemProps = {
  label: string;
  value: string;
};

function AuditDetailItem({ label, value }: AuditDetailItemProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm">{value}</dd>
    </div>
  );
}

export { AuditDetailsDialog };
