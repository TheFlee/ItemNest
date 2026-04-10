import i18n from "../i18n";

export function getReportReasonLabel(reason: number): string {
  switch (reason) {
    case 1:
      return i18n.t("report.spam");
    case 2:
      return i18n.t("report.fakePost");
    case 3:
      return i18n.t("report.offensiveContent");
    case 4:
      return i18n.t("report.wrongCategory");
    case 5:
      return i18n.t("report.other");
    default:
      return i18n.t("common.unknown");
  }
}

export function getReportStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return i18n.t("report.pending");
    case 2:
      return i18n.t("report.reviewed");
    case 3:
      return i18n.t("report.rejected");
    default:
      return i18n.t("common.unknown");
  }
}

export function getReportStatusClassName(status: number): string {
  switch (status) {
    case 1:
      return "bg-amber-100 text-amber-700";
    case 2:
      return "bg-emerald-100 text-emerald-700";
    case 3:
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
