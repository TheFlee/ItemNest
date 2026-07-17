import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/error";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setErrorMessage("");
      setIsSubmitting(true);

      try {
        await googleLogin(credential);
        navigate("/dashboard");
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [googleLogin, navigate]
  );

  return (
    <div>
      <div className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          {t("auth.login.badge")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {t("auth.login.title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {t("auth.login.description")}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <GoogleLoginButton
          text="signin_with"
          isDisabled={isSubmitting}
          onCredential={handleGoogleCredential}
        />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            {t("auth.login.orContinueWithEmail")}
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
            {t("auth.login.email")}
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
            placeholder={t("auth.login.emailPlaceholder")}
            required
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              {t("auth.login.password")}
            </label>
          </div>

          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
            placeholder={t("auth.login.passwordPlaceholder")}
            required
          />
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
        <p className="text-sm text-[var(--text-secondary)]">
          {t("auth.login.noAccount")} {" "}
          <Link to="/register" className="font-semibold text-[var(--text-primary)] hover:underline">
            {t("auth.login.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
