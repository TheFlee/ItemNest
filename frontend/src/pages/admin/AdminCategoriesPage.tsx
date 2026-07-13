import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";
import PageState from "../../components/common/PageState";
import { useToast } from "../../context/ToastContext";
import type { Category } from "../../types/category";
import { getApiErrorMessage } from "../../utils/error";

export default function AdminCategoriesPage() {
  const { t } = useTranslation();
  const { show } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newName, setNewName] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setIsAdding(true);
    try {
      const created = await createCategory(newName.trim());
      setCategories((prev) => [...prev, created]);
      setNewName("");
      show(t("adminPages.categories.successCreated"), "success");
    } catch (error: unknown) {
      show(getApiErrorMessage(error), "error");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleUpdate(id: number) {
    if (!editingName.trim()) return;
    setProcessingId(id);
    try {
      const updated = await updateCategory(id, editingName.trim());
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      show(t("adminPages.categories.successUpdated"), "success");
    } catch (error: unknown) {
      show(getApiErrorMessage(error), "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(id: number) {
    setProcessingId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
      show(t("adminPages.categories.successDeleted"), "success");
    } catch (error: unknown) {
      show(getApiErrorMessage(error), "error");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-6 shadow-sm sm:px-8 sm:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("adminPages.categories.badge")}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              {t("adminPages.categories.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {t("adminPages.categories.description")}
            </p>
          </div>
          <Link
            to="/admin/dashboard"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
          >
            <ion-icon name="arrow-back-outline" style={{ fontSize: "14px" }} />
            {t("adminPages.categories.backToDashboard")}
          </Link>
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4">
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {t("adminPages.categories.totalCategories")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {categories.length}
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm overflow-hidden">
        <PageState
          isLoading={isLoading}
          errorMessage={errorMessage}
          isEmpty={!isLoading && !errorMessage && categories.length === 0}
          emptyMessage={t("adminPages.categories.emptyMessage")}
        />

        {!isLoading && !errorMessage && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {t("adminPages.categories.tableId")}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {t("adminPages.categories.tableName")}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                    {t("adminPages.categories.tableActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)]">
                    <td className="px-5 py-4 font-mono text-xs text-[var(--text-secondary)]">
                      {cat.id}
                    </td>
                    <td className="px-5 py-4">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="rounded-xl border border-[var(--accent)] bg-[var(--bg-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleUpdate(cat.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {deleteConfirmId === cat.id ? (
                          <>
                            <span className="text-xs text-[var(--text-secondary)]">
                              {t("adminPages.categories.confirmDelete").slice(0, 40)}...
                            </span>
                            <button
                              onClick={() => void handleDelete(cat.id)}
                              disabled={processingId === cat.id}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {t("common.confirm")}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                            >
                              {t("common.cancel")}
                            </button>
                          </>
                        ) : editingId === cat.id ? (
                          <>
                            <button
                              onClick={() => void handleUpdate(cat.id)}
                              disabled={processingId === cat.id}
                              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
                            >
                              {t("common.save")}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                            >
                              {t("common.cancel")}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                            >
                              <ion-icon name="create-outline" style={{ fontSize: "13px" }} />
                              {t("common.edit")}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(cat.id)}
                              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              <ion-icon name="trash-outline" style={{ fontSize: "13px" }} />
                              {t("common.delete")}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Add new row */}
                <tr className="bg-[var(--bg-surface)]">
                  <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">—</td>
                  <td className="px-5 py-4">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t("adminPages.categories.namePlaceholder")}
                      className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)]"
                      onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => void handleCreate()}
                      disabled={isAdding || !newName.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
                    >
                      <ion-icon name="add-outline" style={{ fontSize: "14px" }} />
                      {t("adminPages.categories.addCategory")}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
