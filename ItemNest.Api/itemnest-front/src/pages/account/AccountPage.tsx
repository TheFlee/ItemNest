import { useState } from "react";
import PageState from "../../components/common/PageState";
import FormInput from "../../components/forms/FormInput";
import { useAuth } from "../../context/AuthContext";
import { changeMyPassword, updateMyEmail } from "../../api/userApi";
import { getApiErrorMessage } from "../../utils/error";

function getRoleLabel(roles: string[]) {
  if (roles.length === 0) {
    return "Member";
  }

  return roles.join(", ");
}

export default function AccountPage() {
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
        emptyMessage="User information could not be loaded."
      />
    );
  }

  async function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailErrorMessage("");
    setEmailSuccessMessage("");

    if (!newEmail.trim()) {
      setEmailErrorMessage("New email is required.");
      return;
    }

    if (!emailCurrentPassword.trim()) {
      setEmailErrorMessage("Current password is required to update your email.");
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
      setEmailSuccessMessage("Your email address was updated successfully.");
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
      setPasswordErrorMessage("Current password is required.");
      return;
    }

    if (!newPassword.trim()) {
      setPasswordErrorMessage("New password is required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMessage("New password and confirmation do not match.");
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
      setPasswordSuccessMessage("Your password was updated successfully.");
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
              User cabinet
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Account settings
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Review your profile information and securely manage your email address and password.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Full name</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {user.fullName}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This is the name currently assigned to your ItemNest account.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Email address</p>
            <p className="mt-2 break-all text-xl font-semibold tracking-tight text-slate-900">
              {user.email}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your sign-in email used for account access and platform identity.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Account role</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {getRoleLabel(user.roles)}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Member since {new Date(user.createdAt).toLocaleDateString()}.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Change email
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Update the email address used for your ItemNest account.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleEmailSubmit}>
            <FormInput
              label="New email"
              type="email"
              value={newEmail}
              onChange={setNewEmail}
              placeholder="Enter your new email"
              required
            />

            <FormInput
              label="Current password"
              type="password"
              value={emailCurrentPassword}
              onChange={setEmailCurrentPassword}
              placeholder="Enter your current password"
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
              {isUpdatingEmail ? "Updating Email..." : "Update Email"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Change password
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep your account secure by setting a new password.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
            <FormInput
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter your current password"
              required
            />

            <FormInput
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter your new password"
              required
            />

            <FormInput
              label="Confirm new password"
              type="password"
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
              placeholder="Repeat your new password"
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
              {isUpdatingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}