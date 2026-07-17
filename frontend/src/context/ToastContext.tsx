import { createContext, useCallback, useContext, useState } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toasts: ToastMessage[];
  show: (message: string, type?: ToastMessage["type"]) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  show: () => {},
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, type: ToastMessage["type"] = "success") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}
