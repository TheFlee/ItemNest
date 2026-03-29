export function getContactRequestStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Accepted";
    case 3:
      return "Rejected";
    case 4:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

export function getContactRequestStatusClassName(status: number): string {
  switch (status) {
    case 1:
      return "bg-amber-100 text-amber-700";
    case 2:
      return "bg-emerald-100 text-emerald-700";
    case 3:
      return "bg-red-100 text-red-700";
    case 4:
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}