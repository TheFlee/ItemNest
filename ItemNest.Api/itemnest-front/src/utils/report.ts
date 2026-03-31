export function getReportReasonLabel(reason: number): string {
  switch (reason) {
    case 1:
      return "Spam";
    case 2:
      return "Fake Post";
    case 3:
      return "Offensive Content";
    case 4:
      return "Wrong Category";
    case 5:
      return "Other";
    default:
      return "Unknown";
  }
}

export function getReportStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Reviewed";
    case 3:
      return "Rejected";
    default:
      return "Unknown";
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