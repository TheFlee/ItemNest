import i18n from "../i18n";

export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}

export function getPostTypeOptions(): SelectOption<number>[] {
  return [
    { label: i18n.t("post.lost"), value: 0 },
    { label: i18n.t("post.found"), value: 1 },
  ];
}

export function getPostStatusOptions(): SelectOption<number>[] {
  return [
    { label: i18n.t("post.open"), value: 0 },
    { label: i18n.t("post.returned"), value: 1 },
    { label: i18n.t("post.closed"), value: 2 },
  ];
}

export function getItemColorOptions(): SelectOption<number>[] {
  return [
    { label: i18n.t("common.unknown"), value: 0 },
    { label: i18n.t("post.black"), value: 1 },
    { label: i18n.t("post.white"), value: 2 },
    { label: i18n.t("post.gray"), value: 3 },
    { label: i18n.t("post.blue"), value: 4 },
    { label: i18n.t("post.red"), value: 5 },
    { label: i18n.t("post.green"), value: 6 },
    { label: i18n.t("post.yellow"), value: 7 },
    { label: i18n.t("post.brown"), value: 8 },
    { label: i18n.t("post.pink"), value: 9 },
    { label: i18n.t("post.purple"), value: 10 },
    { label: i18n.t("post.orange"), value: 11 },
    { label: i18n.t("post.silver"), value: 12 },
    { label: i18n.t("post.gold"), value: 13 },
  ];
}

export function getReportReasonOptions(): SelectOption<number>[] {
  return [
    { label: i18n.t("report.spam"), value: 1 },
    { label: i18n.t("report.fakePost"), value: 2 },
    { label: i18n.t("report.offensiveContent"), value: 3 },
    { label: i18n.t("report.wrongCategory"), value: 4 },
    { label: i18n.t("report.other"), value: 5 },
  ];
}
