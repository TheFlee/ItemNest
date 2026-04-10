import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageState from "../../components/common/PageState";
import FormInput from "../../components/forms/FormInput";
import { useAuth } from "../../context/AuthContext";
import { changeMyPassword, updateMyEmail } from "../../api/userApi";
import { getApiErrorMessage } from "../../utils/error";

function getRoleLabel(roles: string[], fallback: string) {
  if (roles.length === 0) {
    return fallback;
  }

  return roles.join(", ");
}

export default function AccountPage() {
  const { t } = useTranslation();
  const { user, isLoading, updateAuth } = useAuth();

  const [newEmail, setNewEmail] = useState(user?.email ?? "");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [emailSuccessMessage, setEmailSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (isLoading || !user) {
    return (
      <PageState
        isLoading={isLoading}
        errorMessage=""
        isEmpty={!isLoading && !user}
        emptyMessage={t("accountPage.empty")}
      />
    );
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailErrorMessage("");
    setEmailSuccessMessage("");

    if (!newEmail.trim()) {
      setEmailErrorMessage(t("accountPage.emailSection.requiredNewEmail"));
      return;
    }

    if (!emailCurrentPassword.trim()) {
      setEmailErrorMessage(t("accountPage.emailSection.requiredPassword"));
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const response = await updateMyEmail({
        newEmail: newEmail.trim(),
        currentPassword: emailCurrentPassword,
      });

      await updateAuth(response);
      setNewEmail(response.email);
      setEmailCurrentPassword("");
      setEmailSuccessMessage(t("accountPage.emailSection.success"));
    } catch (error: any) {
      setEmailErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsUpdatingEmail(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordErrorMessage("");
    setPasswordSuccessMessage("");

    if (!currentPassword.trim()) {
      setPasswordErrorMessage(t("accountPage.passwordSection.requiredCurrentPassword"));
      return;
    }

    if (!newPassword.trim()) {
      setPasswordErrorMessage(t("accountPage.passwordSection.requiredNewPassword"));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMessage(t("accountPage.passwordSection.minLength"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMessage(t("accountPage.passwordSection.mismatch"));
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await changeMyPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccessMessage(t("accountPage.passwordSection.success"));
    } catch (error: any) {
      setPasswordErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {t("accountPage.badge")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {t("accountPage.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              {t("accountPage.description")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("accountPage.cards.fullName")}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {user.fullName}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("accountPage.cards.fullNameDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("accountPage.cards.emailAddress")}
            </p>
            <p className="mt-2 break-all text-xl font-semibold tracking-tight text-slate-900">
              {user.email}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("accountPage.cards.emailDescription")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">
              {t("accountPage.cards.accountRole")}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {getRoleLabel(user.roles, t("accountPage.roleMember"))}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t("accountPage.cards.memberSince", {
                date: new Date(user.createdAt).toLocaleDateString(),
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {t("accountPage.emailSection.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t("accountPage.emailSection.description")}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleEmailSubmit}>
            <FormInput
              label={t("accountPage.emailSection.newEmail")}
              type="email"
              value={newEmail}
              onChange={setNewEmail}
              placeholder={t("accountPage.emailSection.newEmailPlaceholder")}
              required
            />

            <FormInput
              label={t("accountPage.emailSection.currentPassword")}
              type="password"
              value={emailCurrentPassword}
              onChange={setEmailCurrentPassword}
              placeholder={t("accountPage.emailSection.currentPasswordPlaceholder")}
              required
            />

            {emailErrorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {emailErrorMessage}
              </div>
            )}

            {emailSuccessMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {emailSuccessMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingEmail}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdatingEmail
                ? t("accountPage.emailSection.updating")
                : t("accountPage.emailSection.update")}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              {t("accountPage.passwordSection.title")}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {t("accountPage.passwordSection.description")}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
            <FormInput
              label={t("accountPage.passwordSection.currentPassword")}
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder={t("accountPage.passwordSection.currentPasswordPlaceholder")}
              required
            />

            <FormInput
              label={t("accountPage.passwordSection.newPassword")}
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder={t("accountPage.passwordSection.newPasswordPlaceholder")}
              required
            />

            <FormInput
              label={t("accountPage.passwordSection.confirmNewPassword")}
              type="password"
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
              placeholder={t("accountPage.passwordSection.confirmNewPasswordPlaceholder")}
              required
            />

            {passwordErrorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {passwordErrorMessage}
              </div>
            )}

            {passwordSuccessMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {passwordSuccessMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdatingPassword
                ? t("accountPage.passwordSection.updating")
                : t("accountPage.passwordSection.update")}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}