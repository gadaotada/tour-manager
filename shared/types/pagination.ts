type PaginatedResult<TData, TQuery = unknown> = {
    page: number;
    last_page: number;
    page_size: number;
    total: number;
    data: TData;
    query: TQuery;
};

export type { PaginatedResult };
