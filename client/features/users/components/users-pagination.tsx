import { TABLE_PAGE_SIZE_OPTIONS } from "@tour-manager/shared";

import { PaginationControls } from "@components/data/pagination-controls";

type UsersPaginationProps = {
  lastPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  total: number;
};

function UsersPagination({
  lastPage,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  total,
}: UsersPaginationProps) {
  return (
    <PaginationControls
      page={page}
      page_size={pageSize}
      last_page={lastPage}
      total={total}
      pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
}

export { UsersPagination };
