import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import type { LoginInput } from "@tour-manager/shared";
import { loginSchema } from "@tour-manager/shared";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { t } from "@libs/i18n";
import { APP_PATHS } from "@libs/routes/app-paths";

import { login } from "./login.api";

function LoginPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      password: "",
      username: "",
    } satisfies LoginInput,
    onSubmit: async ({ value }) => {
      await submitLogin(value);
    },
  });

  async function submitLogin(values: LoginInput) {
    setErrorMessage(null);
    setValidationMessage(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setValidationMessage(t("login.validation.required"));
      return;
    }

    try {
      await login(parsed.data);
      await navigate({ to: APP_PATHS.dashboard });
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : t("login.error.fallback"),
      );
    }
  }

  const visibleErrorMessage = errorMessage ?? validationMessage;

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
          <p className="mt-4 text-base leading-7 text-muted">
            {t("login.description")}
          </p>
        </div>

        <form
          className="rounded-lg border bg-card p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
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
            <form.Field name="username">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>{t("login.form.username")}</Label>
                  <form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        autoComplete="username"
                        disabled={isSubmitting}
                        value={field.state.value}
                        aria-invalid={Boolean(validationMessage)}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                    )}
                  </form.Subscribe>
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>{t("login.form.password")}</Label>
                  <form.Subscribe selector={(state) => state.isSubmitting}>
                    {(isSubmitting) => (
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        value={field.state.value}
                        aria-invalid={Boolean(validationMessage)}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                      />
                    )}
                  </form.Subscribe>
                </div>
              )}
            </form.Field>
          </div>

          {visibleErrorMessage ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {visibleErrorMessage}
            </p>
          ) : null}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button className="mt-6 w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? t("login.form.submitting") : t("login.form.submit")}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </section>
    </main>
  );
}

export { LoginPage };
