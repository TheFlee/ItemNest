import { useTranslation } from "react-i18next";

interface PageStateProps {
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export default function PageState({ isLoading, errorMessage, emptyMessage, isEmpty }: PageStateProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-10 text-center shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        <p className="mt-4 text-base font-medium text-[var(--text-primary)]">{t("common.loading")}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("pageState.loadingDescription")}</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <ion-icon name="warning-outline" style={{ fontSize: "18px", marginTop: "1px", flexShrink: 0 }} />
        <div>
          <p className="font-semibold">{t("pageState.errorTitle")}</p>
          <p className="mt-1 leading-6">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-surface)] text-[var(--text-secondary)]">
          <ion-icon name="search-outline" style={{ fontSize: "24px" }} />
        </div>
        <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">
          {t("common.noDataFoundTitle")}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
          {emptyMessage ?? t("common.noDataFound")}
        </p>
      </div>
    );
  }

  return null;
}
