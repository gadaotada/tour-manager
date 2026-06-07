import { RotateCcwIcon } from "lucide-react";

import { AUDIT_ACTIONS, AUDIT_RESOURCES } from "@tour-manager/shared";

import { SearchInput } from "@components/data";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useT, type MessageKey } from "@libs/i18n";

import type { AuditListFilters } from "./audit.query";

const AUDIT_RESOURCE_FILTER_OPTIONS = AUDIT_RESOURCES.filter((resource) => resource !== "AUDIT");

type AuditToolbarProps = {
  columnVisibility?: React.ReactNode;
  filters: AuditListFilters;
  onActionChange: (value: AuditListFilters["action"]) => void;
  onResourceChange: (value: AuditListFilters["resource"]) => void;
  onResourceIdChange: (value: string) => void;
  onReset: () => void;
  onSearchChange: (value: string) => void;
};

function AuditToolbar({
  columnVisibility,
  filters,
  onActionChange,
  onResourceChange,
  onResourceIdChange,
  onReset,
  onSearchChange,
}: AuditToolbarProps) {
  const t = useT();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="audit-search">{t("logs.filters.search")}</Label>
          <SearchInput
            id="audit-search"
            value={filters.search}
            placeholder={t("logs.filters.searchPlaceholder")}
            onSearchChange={onSearchChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t("logs.columns.action")}</Label>
          <Select
            value={filters.action}
            onValueChange={(value) => onActionChange(value as AuditListFilters["action"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("logs.filters.allActions")}</SelectItem>
              {AUDIT_ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {t(`logs.actions.${action}` as MessageKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{t("logs.columns.resource")}</Label>
          <Select
            value={filters.resource}
            onValueChange={(value) => onResourceChange(value as AuditListFilters["resource"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("logs.filters.allResources")}</SelectItem>
              {AUDIT_RESOURCE_FILTER_OPTIONS.map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {t(`logs.resources.${resource}` as MessageKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="audit-resource-id">{t("logs.columns.resource_id")}</Label>
          <Input
            id="audit-resource-id"
            value={filters.resource_id}
            placeholder={t("logs.filters.resourceIdPlaceholder")}
            onChange={(event) => onResourceIdChange(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {columnVisibility}

        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcwIcon className="size-4" />
          {t("logs.filters.reset")}
        </Button>
      </div>
    </div>
  );
}

export { AuditToolbar };
