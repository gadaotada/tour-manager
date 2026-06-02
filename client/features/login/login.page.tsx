import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { LoginInput } from "@tour-manager/shared";
import { loginSchema } from "@tour-manager/shared";

import { FormSubmitButtons, FormTextField } from "@libs/forms";
import { t } from "@libs/i18n";
import { APP_PATHS } from "@libs/routes/app-paths";

import { login } from "./login.api";

const LOGIN_FIELDS = [
  {
    autoComplete: "username",
    label: "login.form.username",
    name: "username",
    type: "text",
  },
  {
    autoComplete: "current-password",
    label: "login.form.password",
    name: "password",
    type: "password",
  },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      password: "",
      username: "",
    } satisfies LoginInput,
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await submitLogin(value);
    },
  });

  async function submitLogin(values: LoginInput) {

    try {
      await login(values);
      await navigate({ to: APP_PATHS.dashboard });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("login.error.fallback"),
      );
    }
  }

  return (
    <main className="flex min-h-dvh bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_var(--width-login-form)]">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium text-primary">
            {t("login.brand")}
          </p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
            {t("login.title")}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {t("login.description")}
          </p>
        </div>

        <form
          className="rounded-lg border bg-card p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit().catch((error: unknown) => {
              setErrorMessage(
                error instanceof Error ? error.message : t("login.error.fallback"),
              );
            });
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-normal">
              {t("login.form.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("login.form.description")}
            </p>
          </div>

          <div className="space-y-4">
            {LOGIN_FIELDS.map(({ autoComplete, label, name, type }) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <FormTextField
                        id={name}
                        label={t(label)}
                        field={field}
                        type={type}
                        autoComplete={autoComplete}
                        disabled={isSubmitting}
                        onChange={() => setErrorMessage(null)}
                      />
                    )}
                  </form.Subscribe>
                )}
              </form.Field>
            ))}
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <FormSubmitButtons
            form={form}
            requireDirty
            submitClassName="mt-6 w-full"
            submitLabel={t("login.form.submit")}
            submittingLabel={t("login.form.submitting")}
          />
        </form>
      </section>
    </main>
  );
}

export { LoginPage };
