import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import { useT } from "@libs/i18n";

type PaginationControlsProps = {
    page: number;
    page_size: number;
    last_page: number;
    total: number;
    pageSizeOptions: readonly number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (page_size: number) => void;
};

function PaginationControls({
    page,
    page_size,
    last_page,
    total,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
}: PaginationControlsProps) {
    const t = useT();
    const [pageInput, setPageInput] = useState(String(page));

    useEffect(() => {
        setPageInput(String(page));
    }, [page]);

    const visibleRange = useMemo(() => {
        if (total === 0) {
            return "0-0";
        }

        const first = (page - 1) * page_size + 1;
        const last = Math.min(total, page * page_size);

        return `${first}-${last}`;
    }, [page, page_size, total]);

    function commitPageInput() {
        const parsed = Number(pageInput);
        const nextPage = Number.isInteger(parsed)
            ? Math.min(Math.max(parsed, 1), last_page)
            : page;

        setPageInput(String(nextPage));

        if (nextPage !== page) {
            onPageChange(nextPage);
        }
    }

    return (
        <div className="grid gap-3 rounded-md border bg-surface-muted px-3 py-2 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                    {t("common.pagination.summary")
                        .replace("{page}", String(page))
                        .replace("{last_page}", String(last_page))
                        .replace("{total}", String(total))}
                </span>
                <span className="border-l pl-2">
                    {visibleRange}
                </span>
            </div>

            <div className="flex items-center gap-2 md:justify-self-center">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ArrowLeftIcon />
                </Button>
                <Input
                    className="h-8 w-16 text-center bg-white"
                    value={pageInput}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    aria-label={t("common.pagination.summary")
                        .replace("{page}", String(page))
                        .replace("{last_page}", String(last_page))
                        .replace("{total}", String(total))}
                    onBlur={commitPageInput}
                    onChange={(event) => setPageInput(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            commitPageInput();
                        }
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= last_page}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ArrowRightIcon />
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-self-end">
                <Select
                    value={String(page_size)}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                    <SelectTrigger size="sm" aria-label={t("common.pagination.pageSize")}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {pageSizeOptions.map((option) => (
                            <SelectItem key={option} value={String(option)}>
                                {t("common.pagination.pageSizeOption").replace(
                                    "{count}",
                                    String(option),
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

export { PaginationControls, type PaginationControlsProps };
