export interface SelectOption<T extends string | number> {
  label: string;
  value: T;
}

export const postTypeOptions: SelectOption<number>[] = [
  { label: "Lost", value: 0 },
  { label: "Found", value: 1 },
];

export const postStatusOptions: SelectOption<number>[] = [
  { label: "Open", value: 0 },
  { label: "Returned", value: 1 },
  { label: "Closed", value: 2 },
];

export const itemColorOptions: SelectOption<number>[] = [
  { label: "Unknown", value: 0 },
  { label: "Black", value: 1 },
  { label: "White", value: 2 },
  { label: "Gray", value: 3 },
  { label: "Blue", value: 4 },
  { label: "Red", value: 5 },
  { label: "Green", value: 6 },
  { label: "Yellow", value: 7 },
  { label: "Brown", value: 8 },
  { label: "Pink", value: 9 },
  { label: "Purple", value: 10 },
  { label: "Orange", value: 11 },
  { label: "Silver", value: 12 },
  { label: "Gold", value: 13 },
];

export const reportReasonOptions: SelectOption<number>[] = [
  { label: "Spam", value: 1 },
  { label: "Fake Post", value: 2 },
  { label: "Offensive Content", value: 3 },
  { label: "Wrong Category", value: 4 },
  { label: "Other", value: 5 },
];