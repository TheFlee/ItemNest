import { useEffect, useState } from "react";
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

  if (isLoading || errorMessage || users.length === 0) {
    return (
      <div className="space-y-4">
        {successMessage && !isLoading && !errorMessage && (
          <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Users</h1>
        <p className="mt-2 text-slate-600">
          Review registered users and manage their roles.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4">
        {users.map((user) => {
          const primaryRole = user.roles[0] ?? "User";
          const isSelf = currentUser?.id === user.id;

          return (
            <div key={user.id} className="rounded-2xl bg-white p-5 shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {user.fullName}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Email:</span>{" "}
                    {user.email}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Current Role:</span>{" "}
                    {primaryRole}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Created At:</span>{" "}
                    {formatDateTime(user.createdAt)}
                  </p>

                  {isSelf && (
                    <p className="mt-2 text-xs font-medium text-blue-700">
                      This is your account.
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    primaryRole === "Admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {primaryRole}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleRoleChange(user.id, "User")}
                  disabled={processingId === user.id || (isSelf && primaryRole === "Admin")}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {processingId === user.id ? "Processing..." : "Set as User"}
                </button>

                <button
                  type="button"
                  onClick={() => void handleRoleChange(user.id, "Admin")}
                  disabled={processingId === user.id}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-60"
                >
                  {processingId === user.id ? "Processing..." : "Set as Admin"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}