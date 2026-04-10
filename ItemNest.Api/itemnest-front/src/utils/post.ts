import i18n from "../i18n";

export function getPostTypeLabel(type: number): string {
  return type === 0 ? i18n.t("post.lost") : i18n.t("post.found");
}

export function getPostTypeClassName(type: number): string {
  return type === 0
    ? "bg-red-100 text-red-700"
    : "bg-emerald-100 text-emerald-700";
}

export function getPostStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return i18n.t("post.open");
    case 1:
      return i18n.t("post.returned");
    case 2:
      return i18n.t("post.closed");
    default:
      return i18n.t("common.unknown");
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
      return i18n.t("common.unknown");
    case 1:
      return i18n.t("post.black");
    case 2:
      return i18n.t("post.white");
    case 3:
      return i18n.t("post.gray");
    case 4:
      return i18n.t("post.blue");
    case 5:
      return i18n.t("post.red");
    case 6:
      return i18n.t("post.green");
    case 7:
      return i18n.t("post.yellow");
    case 8:
      return i18n.t("post.brown");
    case 9:
      return i18n.t("post.pink");
    case 10:
      return i18n.t("post.purple");
    case 11:
      return i18n.t("post.orange");
    case 12:
      return i18n.t("post.silver");
    case 13:
      return i18n.t("post.gold");
    default:
      return i18n.t("common.unknown");
  }
}
