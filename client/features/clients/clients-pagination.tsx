import { TABLE_PAGE_SIZE_OPTIONS } from "@tour-manager/shared";

import { PaginationControls } from "@components/data/pagination-controls";

import { useClientsPagination } from "./clients.store";

type ClientsPaginationProps = {
    onPageChange: (page: number) => void;
    onPageSizeChange: (page_size: number) => void;
};

function ClientsPagination({ onPageChange, onPageSizeChange }: ClientsPaginationProps) {
    const pagination = useClientsPagination();

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

export { ClientsPagination };
