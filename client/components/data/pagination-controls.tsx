import { Button } from "@components/ui/button";
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

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base text-muted-foreground">
                {t("common.pagination.summary")
                    .replace("{page}", String(page))
                    .replace("{last_page}", String(last_page))
                    .replace("{total}", String(total))}
            </p>

            <div className="flex flex-wrap items-center gap-2">
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

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    {t("common.pagination.previous")}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= last_page}
                    onClick={() => onPageChange(page + 1)}
                >
                    {t("common.pagination.next")}
                </Button>
            </div>
        </div>
    );
}

export { PaginationControls, type PaginationControlsProps };
