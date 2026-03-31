export function getPostTypeLabel(type: number): string {
  return type === 0 ? "Lost" : "Found";
}

export function getPostTypeClassName(type: number): string {
  return type === 0
    ? "bg-red-100 text-red-700"
    : "bg-emerald-100 text-emerald-700";
}

export function getPostStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return "Open";
    case 1:
      return "Returned";
    case 2:
      return "Closed";
    default:
      return "Unknown";
  }
}

export function getPostStatusClassName(status: number): string {
  switch (status) {
    case 0:
      return "bg-blue-100 text-blue-700";
    case 1:
      return "bg-emerald-100 text-emerald-700";
    case 2:
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function getItemColorLabel(color: number): string {
  switch (color) {
    case 0:
      return "Black";
    case 1:
      return "White";
    case 2:
      return "Gray";
    case 3:
      return "Blue";
    case 4:
      return "Red";
    case 5:
      return "Green";
    case 6:
      return "Yellow";
    case 7:
      return "Brown";
    case 8:
      return "Pink";
    case 9:
      return "Purple";
    case 10:
      return "Orange";
    case 11:
      return "Gold";
    case 12:
      return "Silver";
    case 13:
      return "Beige";
    case 14:
      return "Other";
    default:
      return "Unknown";
  }
}