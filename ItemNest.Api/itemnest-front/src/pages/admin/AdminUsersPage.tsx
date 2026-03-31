import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminUsers, updateAdminUserRole } from "../../api/userApi";
import PageState from "../../components/common/PageState";
import type { AdminUserItem } from "../../types/user";
import { getApiErrorMessage } from "../../utils/error";
import { formatDateTime } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsersPage() {
  const { user: currentUser, refreshUser } = useAuth();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getAdminUsers();
        setUsers(data);
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, []);

  async function handleRoleChange(userId: string, role: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setProcessingId(userId);

    try {
      const updatedUser = await updateAdminUserRole(userId, { role });

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );

      if (currentUser?.id === userId) {
        await refreshUser();
      }

      setSuccessMessage("User role was updated successfully.");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  }

  const metrics = useMemo(() => {
    const admins = users.filter((user) => user.roles.includes("Admin")).length;
    const standardUsers = users.filter((user) => !user.roles.includes("Admin")).length;
    const currentAccountIsAdmin = currentUser?.roles.includes("Admin") ? 1 : 0;

    return {
      total: users.length,
      admins,
      standardUsers,
      currentAccountIsAdmin,
    };
  }, [users, currentUser]);

  if (isLoading || errorMessage || users.length === 0) {
    return (
      <div className="space-y-4">
        {successMessage && !isLoading && !errorMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {successMessage}
          </div>
        )}

        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && users.length === 0}
          emptyMessage="There are no users in the system."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              User management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              Admin Users
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Review registered accounts, inspect roles, and manage admin access with a cleaner and more consistent moderation layout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Back to Admin Dashboard
            </Link>

            <Link
              to="/admin/reports"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Open Reports
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Total users</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Admins</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.admins}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Standard users</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.standardUsers}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Your admin access</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {metrics.currentAccountIsAdmin ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </section>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Registered accounts
        </h2>
        <p className="text-sm text-slate-600">
          Review user details, identify administrative access, and update roles where appropriate.
        </p>
      </section>

      <section className="grid gap-4">
        {users.map((user) => {
          const primaryRole = user.roles[0] ?? "User";
          const isSelf = currentUser?.id === user.id;
          const isAdmin = user.roles.includes("Admin");
          const isProcessing = processingId === user.id;
          const disableSetUser = isProcessing || (isSelf && primaryRole === "Admin");

          return (
            <article
              key={user.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {user.fullName}
                    </h2>

                    {isSelf && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        Your Account
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Registered platform account with role management available from this admin panel.
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                    isAdmin
                      ? "bg-purple-100 text-purple-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {primaryRole}
                </span>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 font-medium text-slate-700">{user.email}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Current Role
                  </p>
                  <p className="mt-1 font-medium text-slate-700">{primaryRole}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Created At
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {formatDateTime(user.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Account Type
                  </p>
                  <p className="mt-1 font-medium text-slate-700">
                    {isAdmin ? "Administrative access" : "Standard access"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Role Management
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Promote trusted users to admin when they need moderation access, or return accounts to the standard user role when admin access is no longer required.
                </p>

                {isSelf && primaryRole === "Admin" && (
                  <p className="mt-3 text-sm text-blue-700">
                    Your current admin account cannot be downgraded from this screen while it is the active account.
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleRoleChange(user.id, "User")}
                  disabled={disableSetUser}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing ? "Processing..." : "Set as User"}
                </button>

                <button
                  type="button"
                  onClick={() => void handleRoleChange(user.id, "Admin")}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isProcessing ? "Processing..." : "Set as Admin"}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}