import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";

import {
    createHotelSchema,
    type CreateHotelInput,
    type Hotel,
} from "@tour-manager/shared";

import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";
import {
    createTranslatedFieldErrors,
    getSubmitErrorMessage,
    type FieldErrors,
} from "@libs/forms";
import { useT } from "@libs/i18n";
import { toast } from "@libs/toasts";

import { HotelStars } from "./hotel-stars";
import { createHotel, updateHotel } from "./hotels.api";

type HotelFormDialogProps = {
    mode: "create" | "edit";
    open: boolean;
    hotel: Hotel | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const HOTEL_FORM_FIELDS = ["name", "address", "stars"] as const;
type HotelFormField = (typeof HOTEL_FORM_FIELDS)[number];

function HotelFormDialog({
    mode,
    open,
    hotel,
    onOpenChange,
    onSuccess,
}: HotelFormDialogProps) {
    const t = useT();
    const isEdit = mode === "edit";
    const [errors, setErrors] = useState<FieldErrors<HotelFormField>>({});

    const form = useForm({
        defaultValues: {
            name: "",
            address: "",
            stars: 3,
        } satisfies CreateHotelInput,
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

    useEffect(() => {
        if (!open) return;

        setErrors({});

        if (isEdit && hotel) {
            form.reset({
                name: hotel.name,
                address: hotel.address,
                stars: hotel.stars,
            });
            return;
        }

        form.reset({
            name: "",
            address: "",
            stars: 3,
        });
    }, [form, hotel, isEdit, open]);

    async function onSubmit(values: CreateHotelInput) {
        setErrors({});

        const parsed = createHotelSchema.safeParse(values);
        if (!parsed.success) {
            setErrors(createTranslatedFieldErrors(parsed.error.issues, HOTEL_FORM_FIELDS, t));
            return;
        }

        try {
            if (isEdit && hotel) {
                await updateHotel({
                    ...parsed.data,
                    id: hotel.id,
                    version: hotel.version,
                    is_active: hotel.is_active,
                });
            } else {
                await createHotel(parsed.data);
            }

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            const message = getSubmitErrorMessage(error, t("hotels.form.error.fallback"));
            toast.error(message);
            setErrors({
                root: message,
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? t("hotels.form.editTitle") : t("hotels.form.createTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t("hotels.form.editDescription")
                            : t("hotels.form.createDescription")}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <form.Field name="name">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="hotel-name">{t("hotels.form.name")}</Label>
                                <form.Subscribe selector={(state) => state.isSubmitting}>
                                    {(isSubmitting) => (
                                        <Input
                                            id="hotel-name"
                                            name={field.name}
                                            disabled={isSubmitting}
                                            value={field.state.value}
                                            aria-invalid={Boolean(errors.name)}
                                            onBlur={field.handleBlur}
                                            onChange={(event) => field.handleChange(event.target.value)}
                                        />
                                    )}
                                </form.Subscribe>
                                {errors.name ? (
                                    <p className="text-base text-destructive">{errors.name}</p>
                                ) : null}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="address">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="hotel-address">{t("hotels.form.address")}</Label>
                                <form.Subscribe selector={(state) => state.isSubmitting}>
                                    {(isSubmitting) => (
                                        <Input
                                            id="hotel-address"
                                            name={field.name}
                                            disabled={isSubmitting}
                                            value={field.state.value}
                                            aria-invalid={Boolean(errors.address)}
                                            onBlur={field.handleBlur}
                                            onChange={(event) => field.handleChange(event.target.value)}
                                        />
                                    )}
                                </form.Subscribe>
                                {errors.address ? (
                                    <p className="text-base text-destructive">{errors.address}</p>
                                ) : null}
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="stars">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label htmlFor="hotel-stars">{t("hotels.form.stars")}</Label>
                                <form.Subscribe selector={(state) => state.isSubmitting}>
                                    {(isSubmitting) => (
                                        <Select
                                            disabled={isSubmitting}
                                            value={String(field.state.value)}
                                            onValueChange={(value) => field.handleChange(Number(value))}
                                        >
                                            <SelectTrigger
                                                id="hotel-stars"
                                                className="w-full"
                                                aria-invalid={Boolean(errors.stars)}
                                                onBlur={field.handleBlur}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 7 }, (_, index) => (
                                                    <SelectItem key={index} value={String(index)}>
                                                        <span className="flex items-center gap-2">
                                                            <HotelStars value={index} />
                                                            <span>
                                                                {t("hotels.filters.starsOption").replace(
                                                                    "{count}",
                                                                    String(index),
                                                                )}
                                                            </span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </form.Subscribe>
                                {errors.stars ? (
                                    <p className="text-base text-destructive">{errors.stars}</p>
                                ) : null}
                            </div>
                        )}
                    </form.Field>

                    {errors.root ? (
                        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-base text-destructive">
                            {errors.root}
                        </p>
                    ) : null}

                    <DialogFooter>
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isSubmitting}
                                        onClick={() => onOpenChange(false)}
                                    >
                                        {t("common.actions.cancel")}
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting
                                            ? t("common.actions.saving")
                                            : isEdit
                                                ? t("hotels.form.save")
                                                : t("hotels.form.create")}
                                    </Button>
                                </>
                            )}
                        </form.Subscribe>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export { HotelFormDialog };
