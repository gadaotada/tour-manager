import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginInput>({
    defaultValues: {
      password: "",
      username: "",
    },
    resolver: loginFormResolver,
  });

  async function submitLogin(values: LoginInput) {
    setErrorMessage(null);

    try {
      await login(values);
      await navigate({ to: APP_PATHS.dashboard });
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        error instanceof Error ? error.message : t("login.error.fallback"),
      );
    }
  }

  const validationMessage =
    errors.username?.message ?? errors.password?.message ?? null;
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
          onSubmit={handleSubmit(submitLogin)}
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
            <div className="space-y-1.5">
              <Label htmlFor="username">{t("login.form.username")}</Label>
              <Input
                id="username"
                autoComplete="username"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.username)}
                {...register("username", { required: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("login.form.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                {...register("password", { required: true })}
              />
            </div>
          </div>

          {visibleErrorMessage ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {visibleErrorMessage}
            </p>
          ) : null}

          <Button className="mt-6 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? t("login.form.submitting") : t("login.form.submit")}
          </Button>
        </form>
      </section>
    </main>
  );
}

const loginFormResolver: Resolver<LoginInput> = async (values) => {
  const parsed = loginSchema.safeParse(values);

  if (parsed.success) {
    return {
      errors: {},
      values: parsed.data,
    };
  }

  return {
    errors: {
      password: {
        message: t("login.validation.required"),
        type: "validation",
      },
      username: {
        message: t("login.validation.required"),
        type: "validation",
      },
    },
    values: {},
  };
};

export { LoginPage };
