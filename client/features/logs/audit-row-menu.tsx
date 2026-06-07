import { EyeIcon } from "lucide-react";

import type { AuditLog } from "@tour-manager/shared";

import { AnchoredRowMenu, RowMenuButton } from "@components/data";
import { useT } from "@libs/i18n";

type AuditRowMenuProps = {
  anchorCell: HTMLTableCellElement;
  audit: AuditLog;
  onClose: () => void;
  onViewDetails: (audit: AuditLog) => void;
  tableViewport: HTMLDivElement | null;
};

function AuditRowMenu({
  anchorCell,
  audit,
  onClose,
  onViewDetails,
  tableViewport,
}: AuditRowMenuProps) {
  const t = useT();

  return (
    <AnchoredRowMenu
      anchorCell={anchorCell}
      menuAttribute="data-audit-row-menu"
      onClose={onClose}
      tableViewport={tableViewport}
    >
      <RowMenuButton onClick={() => onViewDetails(audit)}>
        <EyeIcon className="size-4" />
        {t("logs.actions.viewDetails")}
      </RowMenuButton>
    </AnchoredRowMenu>
  );
}

export { AuditRowMenu };
