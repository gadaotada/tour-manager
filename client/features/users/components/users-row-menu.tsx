import { PenIcon, PowerIcon, TrashIcon } from "lucide-react";

import type { ManagedUser } from "@tour-manager/shared";

import { AnchoredRowMenu, RowMenuButton } from "@components/data";
import { useT } from "@libs/i18n";

type UsersRowMenuProps = {
  anchorCell: HTMLTableCellElement;
  canDelete: boolean;
  canUpdate: boolean;
  isStatusPending: boolean;
  onClose: () => void;
  onDelete: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onToggleStatus: (user: ManagedUser) => void;
  tableViewport: HTMLDivElement | null;
  user: ManagedUser;
};

function UsersRowMenu({
  anchorCell,
  canDelete,
  canUpdate,
  isStatusPending,
  onClose,
  onDelete,
  onEdit,
  onToggleStatus,
  tableViewport,
  user,
}: UsersRowMenuProps) {
  const t = useT();

  return (
    <AnchoredRowMenu
      anchorCell={anchorCell}
      menuAttribute="data-users-row-menu"
      onClose={onClose}
      tableViewport={tableViewport}
    >
      {canUpdate ? (
        <>
          <RowMenuButton onClick={() => onEdit(user)}>
            <PenIcon className="size-4" />
            {t("users.actions.edit")}
          </RowMenuButton>
          <RowMenuButton disabled={isStatusPending} onClick={() => onToggleStatus(user)}>
            <PowerIcon className="size-4" />
            {t("users.actions.toggleStatus")}
          </RowMenuButton>
        </>
      ) : null}

      {canDelete ? (
        <RowMenuButton destructive onClick={() => onDelete(user)}>
          <TrashIcon className="size-4" />
          {t("users.actions.delete")}
        </RowMenuButton>
      ) : null}
    </AnchoredRowMenu>
  );
}

export { UsersRowMenu };
