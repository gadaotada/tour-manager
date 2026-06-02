import { useForm } from "@tanstack/react-form";

import { createHotelSchema, type CreateHotelInput, type Hotel } from "@tour-manager/shared";

import { StarsSelect } from "@components/data";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import {
    clearFieldServerError,
    createApiFieldErrors,
    FormFieldError,
    FormSubmitButtons,
    FormTextField,
    getSubmitErrorMessage,
    hasFormErrors,
} from "@libs/forms";
import { useT } from "@libs/i18n";
import { toast } from "@libs/toasts";

import { createHotel, updateHotel } from "./hotels.api";

type HotelFormDialogProps = {
    mode: "create" | "edit";
    open: boolean;
    hotel: Hotel | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

type HotelFormProps = {
    defaultValues: CreateHotelInput;
    hotel: Hotel | null;
    isEdit: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const HOTEL_FORM_FIELDS = ["name", "address", "stars"] as const;
const HOTEL_TEXT_FIELDS = [
    { id: "hotel-name", label: "hotels.form.name", name: "name" },
    { id: "hotel-address", label: "hotels.form.address", name: "address" },
] as const;

const DEFAULT_HOTEL_FORM_VALUES = {
    name: "",
    address: "",
    stars: 3,
} satisfies CreateHotelInput;

function HotelFormDialog({
    mode,
    open,
    hotel,
    onOpenChange,
    onSuccess,
}: HotelFormDialogProps) {
    const t = useT();
    const isEdit = mode === "edit";
    const defaultValues =
        isEdit && hotel
            ? {
                name: hotel.name,
                address: hotel.address,
                stars: hotel.stars,
            }
            : DEFAULT_HOTEL_FORM_VALUES;
    const formKey = isEdit && hotel ? `edit-${hotel.id}` : "create";

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

                {open ? (
                    <HotelForm
                        key={formKey}
                        defaultValues={defaultValues}
                        hotel={hotel}
                        isEdit={isEdit}
                        onOpenChange={onOpenChange}
                        onSuccess={onSuccess}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function HotelForm({
    defaultValues,
    hotel,
    isEdit,
    onOpenChange,
    onSuccess,
}: HotelFormProps) {
    const t = useT();
    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: createHotelSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

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
            const message = getSubmitErrorMessage(error, t("hotels.form.error.fallback"));
            const apiErrors = createApiFieldErrors(error, HOTEL_FORM_FIELDS, t);

            if (Object.values(apiErrors).some(Boolean)) {
                form.setErrorMap({
                    onServer: {
                        fields: apiErrors,
                        form: apiErrors.root ?? message,
                    },
                } as never);
            }

            toast.error(message);
        }
    }

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit().catch((error: unknown) => {
                    toast.error(getSubmitErrorMessage(error, t("hotels.form.error.fallback")));
                });
            }}
        >
            {HOTEL_TEXT_FIELDS.map(({ id, label, name }) => (
                <form.Field key={name} name={name}>
                    {(field) => (
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <FormTextField
                                    id={id}
                                    label={t(label)}
                                    field={field}
                                    disabled={isSubmitting}
                                    errorClassName="text-base text-destructive"
                                />
                            )}
                        </form.Subscribe>
                    )}
                </form.Field>
            ))}

            <form.Field name="stars">
                {(field) => (
                    <div className="space-y-1.5">
                        <Label htmlFor="hotel-stars">{t("hotels.form.stars")}</Label>
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <StarsSelect
                                    id="hotel-stars"
                                    className="w-full"
                                    disabled={isSubmitting}
                                    value={field.state.value}
                                    ariaInvalid={hasFormErrors(field.state.meta.errors)}
                                    onBlur={field.handleBlur}
                                    onValueChange={(value) => {
                                        clearFieldServerError(field);
                                        field.handleChange(value);
                                    }}
                                />
                            )}
                        </form.Subscribe>
                        <FormFieldError className="text-base text-destructive" errors={field.state.meta.errors} />
                    </div>
                )}
            </form.Field>

            <DialogFooter>
                <FormSubmitButtons
                    form={form}
                    requireDirty
                    cancelLabel={t("common.actions.cancel")}
                    submittingLabel={t("common.actions.saving")}
                    submitLabel={isEdit ? t("hotels.form.save") : t("hotels.form.create")}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogFooter>
        </form>
    );
}

export { HotelFormDialog };
