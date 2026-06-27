import { useForm } from "@tanstack/react-form";

import { createClientSchema, type Client, type CreateClientInput } from "@tour-manager/shared";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@components/ui/dialog";
import {
    createApiFieldErrors,
    FormSubmitButtons,
    FormTextField,
    getSubmitErrorMessage,
} from "@libs/forms";
import { useT, type MessageKey } from "@libs/i18n";
import { toast } from "@libs/toasts";

import { createClient, updateClient } from "./clients.api";

type ClientFormDialogProps = {
    mode: "create" | "edit";
    open: boolean;
    client: Client | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

type ClientFormValues = {
    name: string;
    egn: string;
    address: string;
    phone_number: string;
    email: string;
};

type ClientFormProps = {
    defaultValues: ClientFormValues;
    client: Client | null;
    isEdit: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

const CLIENT_FORM_FIELDS = ["name", "egn", "address", "phone_number", "email"] as const;

type ClientTextField = {
    id: string;
    label: MessageKey;
    name: keyof ClientFormValues;
    autoComplete: string;
    type?: "email" | "tel" | "text";
};

const CLIENT_TEXT_FIELDS: readonly ClientTextField[] = [
    { id: "client-name", label: "clients.form.name", name: "name", autoComplete: "name" },
    { id: "client-egn", label: "clients.form.egn", name: "egn", autoComplete: "off" },
    {
        id: "client-address",
        label: "clients.form.address",
        name: "address",
        autoComplete: "street-address",
    },
    {
        id: "client-phone-number",
        label: "clients.form.phone_number",
        name: "phone_number",
        autoComplete: "tel",
        type: "tel",
    },
    {
        id: "client-email",
        label: "clients.form.email",
        name: "email",
        autoComplete: "email",
        type: "email",
    },
];

const DEFAULT_CLIENT_FORM_VALUES = {
    name: "",
    egn: "",
    address: "",
    phone_number: "",
    email: "",
} satisfies ClientFormValues;

function toClientFormValues(client: Client): ClientFormValues {
    return {
        name: client.name,
        egn: client.egn,
        address: client.address ?? "",
        phone_number: client.phone_number ?? "",
        email: client.email ?? "",
    };
}

function ClientFormDialog({ mode, open, client, onOpenChange, onSuccess }: ClientFormDialogProps) {
    const t = useT();
    const isEdit = mode === "edit";
    const defaultValues =
        isEdit && client ? toClientFormValues(client) : DEFAULT_CLIENT_FORM_VALUES;
    const formKey = isEdit && client ? `edit-${client.id}` : "create";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? t("clients.form.editTitle") : t("clients.form.createTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t("clients.form.editDescription")
                            : t("clients.form.createDescription")}
                    </DialogDescription>
                </DialogHeader>

                {open ? (
                    <ClientForm
                        key={formKey}
                        defaultValues={defaultValues}
                        client={client}
                        isEdit={isEdit}
                        onOpenChange={onOpenChange}
                        onSuccess={onSuccess}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function ClientForm({ defaultValues, client, isEdit, onOpenChange, onSuccess }: ClientFormProps) {
    const t = useT();
    const form = useForm({
        defaultValues,
        validators: {
            onSubmit: createClientSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value);
        },
    });

    async function onSubmit(values: ClientFormValues) {
        try {
            const input: CreateClientInput = createClientSchema.parse(values);

            if (isEdit && client) {
                await updateClient({
                    ...input,
                    id: client.id,
                    version: client.version,
                });
            } else {
                await createClient(input);
            }

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            const message = getSubmitErrorMessage(error, t("clients.form.error.fallback"));
            const apiErrors = createApiFieldErrors(error, CLIENT_FORM_FIELDS, t);

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
                    toast.error(getSubmitErrorMessage(error, t("clients.form.error.fallback")));
                });
            }}
        >
            {CLIENT_TEXT_FIELDS.map(({ id, label, name, autoComplete, type }) => (
                <form.Field key={name} name={name}>
                    {(field) => (
                        <form.Subscribe selector={(state) => state.isSubmitting}>
                            {(isSubmitting) => (
                                <FormTextField
                                    id={id}
                                    label={t(label)}
                                    field={field}
                                    type={type}
                                    autoComplete={autoComplete}
                                    disabled={isSubmitting}
                                    errorClassName="text-base text-destructive"
                                />
                            )}
                        </form.Subscribe>
                    )}
                </form.Field>
            ))}

            <DialogFooter>
                <FormSubmitButtons
                    form={form}
                    requireDirty
                    cancelLabel={t("common.actions.cancel")}
                    submittingLabel={t("common.actions.saving")}
                    submitLabel={isEdit ? t("clients.form.save") : t("clients.form.create")}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogFooter>
        </form>
    );
}

export { ClientFormDialog };
