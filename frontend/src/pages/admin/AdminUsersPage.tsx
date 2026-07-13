import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  getAdminUsers,
  updateAdminUserBlockStatus,
  updateAdminUserRole,
} from "../../api/userApi";
import FormInput from "../../components/forms/FormInput";
import PageState from "../../components/common/PageState";
import type { AdminUserItem } from "../../types/user";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { show } = useToast();
  const { user: currentUser, refreshUser, logout } = useAuth();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getAdminUsers();
        setUsers(data);
      } catch (error: unknown) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, []);

  async function handleRoleChange(userId: string, role: string) {
    setErrorMessage("");
    setProcessingId(userId);

    try {
      const updatedUser = await updateAdminUserRole(userId, { role });

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );

      if (currentUser?.id === userId) {
        await refreshUser();
      }

      show(t("adminPages.users.successRoleUpdated"), "success");
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleBlockStatusChange(userId: string, isBlocked: boolean) {
    const confirmationMessage = isBlocked
      ? t("adminPages.users.confirmBlock")
      : t("adminPages.users.confirmUnblock");

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setErrorMessage("");
    setProcessingId(userId);

    try {
      const updatedUser = await updateAdminUserBlockStatus(userId, { isBlocked });

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );

      if (currentUser?.id === userId && isBlocked) {
        logout();
        return;
      }

      if (currentUser?.id === userId) {
        await refreshUser();
      }

      show(
        isBlocked
          ? t("adminPages.users.successBlocked")
          : t("adminPages.users.successUnblocked"),
        "success"
      );
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    if (!normalized) {
      return users;
    }

    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized)
    );
  }, [users, searchTerm]);

  const metrics = useMemo(() => {
    const admins = users.filter((user) => user.roles.includes("Admin")).length;
    const blocked = users.filter((user) => user.isBlocked).length;
    const standardUsers = users.filter((user) => !user.roles.includes("Admin")).length;
    const currentAccountIsAdmin = currentUser?.roles.includes("Admin") ? 1 : 0;

    return {
      total: users.length,
      admins,
      blocked,
      standardUsers,
      currentAccountIsAdmin,
    };
  }, [users, currentUser]);

  if (isLoading || errorMessage || users.length === 0) {
    return (
      <div className="space-y-4">
        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && users.length === 0}
          emptyMessage={t("adminPages.users.emptyMessage")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("adminPages.users.badge")}
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">
              <ion-icon name="people-outline" style={{ fontSize: "20px" }} />
              {t("adminPages.users.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              {t("adminPages.users.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
            >
              {t("adminPages.users.backToDashboard")}
            </Link>

            <Link
              to="/admin/reports"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            >
              {t("adminPages.users.openReports")}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.users.totalUsers")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.users.admins")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.admins}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.users.standardUsers")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.standardUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.users.blockedUsers")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.blocked}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t("adminPages.users.yourAdminAccess")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
              {metrics.currentAccountIsAdmin ? t("common.yes") : t("common.no")}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              {t("adminPages.users.registeredAccounts")}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {t("adminPages.users.registeredDescription")}
            </p>
          </div>

          <div className="w-full max-w-md">
            <FormInput
              label={t("adminPages.users.searchLabel")}
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("adminPages.users.searchPlaceholder")}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <PageState
            isLoading={false}
            errorMessage=""
            isEmpty
            emptyMessage={t("adminPages.users.noMatch")}
          />
        ) : (
          filteredUsers.map((user) => {
            const primaryRole = user.roles[0] ?? "User";
            const isSelf = currentUser?.id === user.id;
            const isAdmin = user.roles.includes("Admin");
            const isProcessing = processingId === user.id;
            const disableSetUser = isProcessing || (isSelf && primaryRole === "Admin");
            const disableBlock = isProcessing || isSelf;

            return (
              <article
                key={user.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                        {user.fullName}
                      </h2>

                      {isSelf && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {t("adminPages.users.yourAccount")}
                        </span>
                      )}

                      {user.isBlocked && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                          {t("adminPages.users.blockedBadge")}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {t("adminPages.users.cardDescription")}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      isAdmin
                        ? "bg-purple-100 text-purple-700"
                        : "bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    }`}
                  >
                    {primaryRole}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {t("adminPages.users.email")}
                    </p>
                    <p className="mt-1 font-medium text-[var(--text-primary)]">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {t("adminPages.users.currentRole")}
                    </p>
                    <p className="mt-1 font-medium text-[var(--text-primary)]">{primaryRole}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {t("adminPages.users.createdAt")}
                    </p>
                    <p className="mt-1 font-medium text-[var(--text-primary)]">
                      {formatDateTime(user.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      {t("adminPages.users.accessStatus")}
                    </p>
                    <p className="mt-1 font-medium text-[var(--text-primary)]">
                      {user.isBlocked ? t("adminPages.users.blockedStatus") : t("adminPages.users.active")}
                    </p>
                  </div>
                </div>

                {isSelf && primaryRole === "Admin" && (
                  <p className="mt-3 ml-1 text-sm text-blue-700">
                    {t("adminPages.users.yourAdminNote")}
                  </p>
                )}

                {isSelf && (
                  <p className="mt-2 ml-1 text-sm text-blue-700">
                    {t("adminPages.users.yourBlockNote")}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleRoleChange(user.id, "User")}
                    disabled={disableSetUser}
                    className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing ? t("adminPages.users.processing") : t("adminPages.users.setAsUser")}
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleRoleChange(user.id, "Admin")}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isProcessing ? t("adminPages.users.processing") : t("adminPages.users.setAsAdmin")}
                  </button>

                  {user.isBlocked ? (
                    <button
                      type="button"
                      onClick={() => void handleBlockStatusChange(user.id, false)}
                      disabled={disableBlock}
                      className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? t("adminPages.users.processing") : t("adminPages.users.unblockUser")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleBlockStatusChange(user.id, true)}
                      disabled={disableBlock}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? t("adminPages.users.processing") : t("adminPages.users.blockUser")}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
