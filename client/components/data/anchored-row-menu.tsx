import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@libs/utils";

type AnchoredRowMenuProps = {
  anchorCell: HTMLTableCellElement;
  children: React.ReactNode;
  menuAttribute?: string;
  onClose: () => void;
  tableViewport: HTMLDivElement | null;
};

type RowMenuButtonProps = {
  children: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function AnchoredRowMenu({
  anchorCell,
  children,
  menuAttribute = "data-row-menu",
  onClose,
  tableViewport,
}: AnchoredRowMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const style = useMemo(() => {
    if (!tableViewport) return undefined;

    const cellRect = anchorCell.getBoundingClientRect();
    const viewportRect = tableViewport.getBoundingClientRect();

    return {
      left: cellRect.left - viewportRect.left + tableViewport.scrollLeft,
      top: cellRect.bottom - viewportRect.top + tableViewport.scrollTop + 4,
    };
  }, [anchorCell, tableViewport]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Node && menuRef.current?.contains(target)) return;

      onClose();
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  if (!tableViewport || !style) {
    return null;
  }

  return createPortal(
    <div
      ref={menuRef}
      {...{ [menuAttribute]: true }}
      className="absolute z-1 min-w-40 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg"
      style={style}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    tableViewport,
  );
}

function RowMenuButton({
  children,
  destructive = false,
  disabled = false,
  onClick,
}: RowMenuButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
        destructive && "text-destructive hover:bg-destructive/10",
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export {
  AnchoredRowMenu,
  RowMenuButton,
  type AnchoredRowMenuProps,
  type RowMenuButtonProps,
};
