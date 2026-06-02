import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
import { ApiClientError } from "@libs/api";
import { createZodResolver } from "@libs/forms";
import { useT } from "@libs/i18n";

import { createHotel, updateHotel } from "./hotels.api";

type HotelFormDialogProps = {
    mode: "create" | "edit";
    open: boolean;
    hotel: Hotel | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

function HotelFormDialog({
    mode,
    open,
    hotel,
    onOpenChange,
    onSuccess,
}: HotelFormDialogProps) {
    const t = useT();
    const isEdit = mode === "edit";

    const {
        formState: { errors, isSubmitting },
        handleSubmit,
        register,
        reset,
        setError,
    } = useForm<CreateHotelInput>({
        defaultValues: {
            name: "",
            address: "",
            stars: 3,
        },
        resolver: createZodResolver(createHotelSchema),
    });

    useEffect(() => {
        if (!open) return;

        if (isEdit && hotel) {
            reset({
                name: hotel.name,
                address: hotel.address,
                stars: hotel.stars,
            });
            return;
        }

        reset({
            name: "",
            address: "",
            stars: 3,
        });
    }, [hotel, isEdit, open, reset]);

    async function onSubmit(values: CreateHotelInput) {
        try {
            if (isEdit && hotel) {
                await updateHotel({
                    ...values,
                    id: hotel.id,
                    version: hotel.version,
                    is_active: hotel.is_active,
                });
            } else {
                await createHotel(values);
            }

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            if (error instanceof ApiClientError) {
                setError("root", { message: error.message });
            } else if (error instanceof Error) {
                setError("root", { message: error.message });
            } else {
                setError("root", { message: t("hotels.form.error.fallback") });
            }
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

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-1.5">
                        <Label htmlFor="hotel-name">{t("hotels.form.name")}</Label>
                        <Input
                            id="hotel-name"
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.name)}
                            {...register("name")}
                        />
                        {errors.name?.message ? (
                            <p className="text-base text-destructive">{errors.name.message}</p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="hotel-address">{t("hotels.form.address")}</Label>
                        <Input
                            id="hotel-address"
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.address)}
                            {...register("address")}
                        />
                        {errors.address?.message ? (
                            <p className="text-base text-destructive">{errors.address.message}</p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="hotel-stars">{t("hotels.form.stars")}</Label>
                        <Input
                            id="hotel-stars"
                            type="number"
                            min={0}
                            max={6}
                            disabled={isSubmitting}
                            aria-invalid={Boolean(errors.stars)}
                            {...register("stars", { valueAsNumber: true })}
                        />
                        {errors.stars?.message ? (
                            <p className="text-base text-destructive">{errors.stars.message}</p>
                        ) : null}
                    </div>

                    {errors.root?.message ? (
                        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-base text-destructive">
                            {errors.root.message}
                        </p>
                    ) : null}

                    <DialogFooter>
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export { HotelFormDialog };
