import { useCallback, useState } from "react";

type RowActionMenuState<TItem> = {
  anchorCell: HTMLTableCellElement;
  item: TItem;
};

type UseRowActionMenuOptions = {
  enabled: boolean;
};

function useRowActionMenu<TItem>({ enabled }: UseRowActionMenuOptions) {
  const [menu, setMenu] = useState<RowActionMenuState<TItem> | null>(null);

  const closeMenu = useCallback(() => {
    setMenu(null);
  }, []);

  const openMenu = useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, item: TItem) => {
      if (!enabled) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select, [role='button']")) return;

      const anchorCell = target?.closest("td");
      if (!anchorCell) return;

      setMenu({ anchorCell, item });
    },
    [enabled],
  );

  return {
    closeMenu,
    menu,
    openMenu,
    selectedItem: menu?.item ?? null,
  };
}

export { useRowActionMenu, type RowActionMenuState };
