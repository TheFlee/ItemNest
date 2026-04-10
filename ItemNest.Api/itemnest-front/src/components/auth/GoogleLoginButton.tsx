import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface GoogleLoginButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
  isDisabled?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
}

export default function GoogleLoginButton({
  text = "continue_with",
  isDisabled = false,
  onCredential,
}: GoogleLoginButtonProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !clientId || !window.google || isDisabled) {
      return;
    }

    container.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        if (!response.credential) {
          return;
        }

        await onCredential(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: "popup",
    });

    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text,
      shape: "pill",
      width: 360,
    });

    return () => {
      container.innerHTML = "";
    };
  }, [clientId, isDisabled, onCredential, text]);

  if (!clientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t("auth.googleNotConfigured")}
      </div>
    );
  }

  return (
    <div className={isDisabled ? "pointer-events-none opacity-60" : ""}>
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}