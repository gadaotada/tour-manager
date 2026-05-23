type PaginatedResult<TData, TQuery = unknown> = {
    page: number;
    lastPage: number;
    pageSize: number;
    total: number;
    data: TData;
    query: TQuery;
};

const PAGINATION_LIMITS = {
    minPage: 1,
    maxPage: 100000,
    minPageSize: 1,
    maxPageSize: 100,
} as const;

const clampInt = (value: number, min: number, max: number): number => {
    if (!Number.isInteger(value)) return min;
    if (value < min) return min;
    if (value > max) return max;
    return value;
};

const normalizePagination = (
    pagination: { page: number; pageSize: number },
): { page: number; pageSize: number; offset: number } => {
    const page = clampInt(pagination.page, PAGINATION_LIMITS.minPage, PAGINATION_LIMITS.maxPage);
    const pageSize = clampInt(pagination.pageSize, PAGINATION_LIMITS.minPageSize, PAGINATION_LIMITS.maxPageSize);

    return {
        page,
        pageSize,
        offset: (page - 1) * pageSize,
    };
};

const buildPaginatedResult = <TData, TQuery>(
    payload: {
        page: number;
        pageSize: number;
        total: number;
        data: TData;
        query: TQuery;
    },
): PaginatedResult<TData, TQuery> => {
    const safeTotal = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, payload.total));
    const rawLastPage = Math.max(1, Math.ceil(safeTotal / payload.pageSize));
    const lastPage = clampInt(rawLastPage, PAGINATION_LIMITS.minPage, PAGINATION_LIMITS.maxPage);

    return {
        page: payload.page,
        lastPage,
        pageSize: payload.pageSize,
        total: safeTotal,
        data: payload.data,
        query: payload.query,
    };
};

export {
    PAGINATION_LIMITS,
    normalizePagination,
    buildPaginatedResult,
};
