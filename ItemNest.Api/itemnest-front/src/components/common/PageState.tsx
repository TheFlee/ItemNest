import { useTranslation } from "react-i18next";

interface PageStateProps {
  isLoading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export default function PageState({
  isLoading,
  errorMessage,
  emptyMessage,
  isEmpty,
}: PageStateProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
        <p className="mt-4 text-base font-medium text-slate-700">{t("common.loading")}</p>
        <p className="mt-1 text-sm text-slate-500">
          {t("pageState.loadingDescription")}
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <p className="font-semibold">{t("pageState.errorTitle")}</p>
        <p className="mt-1 leading-6">{errorMessage}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-600 shadow-sm">
        <p className="text-lg font-semibold text-slate-800">
          {t("common.noDataFoundTitle")}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {emptyMessage ?? t("common.noDataFound")}
        </p>
      </div>
    );
  }

  return null;
}