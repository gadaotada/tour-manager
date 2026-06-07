import { TABLE_PAGE_SIZE_OPTIONS } from "@tour-manager/shared";

import { PaginationControls } from "@components/data/pagination-controls";

import { useAuditPagination } from "./audit.store";

type AuditPaginationProps = {
  onPageChange: (page: number) => void;
  onPageSizeChange: (page_size: number) => void;
};

function AuditPagination({
  onPageChange,
  onPageSizeChange,
}: AuditPaginationProps) {
  const pagination = useAuditPagination();

  if (!pagination) {
    return null;
  }

  return (
    <PaginationControls
      page={pagination.page}
      page_size={pagination.page_size}
      last_page={pagination.last_page}
      total={pagination.total}
      pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}

export { AuditPagination };
