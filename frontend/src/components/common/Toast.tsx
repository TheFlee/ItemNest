import { useToast } from "../../context/ToastContext";

const iconMap = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
} as const;

const colorMap = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300",
} as const;

export default function Toast() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${colorMap[toast.type]}`}
        >
          <ion-icon name={iconMap[toast.type]} style={{ fontSize: "18px", marginTop: "1px", flexShrink: 0 }} />
          <p className="flex-1 text-sm font-medium leading-5">{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            className="ml-1 opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            <ion-icon name="close" style={{ fontSize: "16px" }} />
          </button>
        </div>
      ))}
    </div>
  );
}
