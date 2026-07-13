import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/layout/LanguageSwitcher";
import { useTheme } from "../context/ThemeContext";

export default function AuthLayout() {
  const { t } = useTranslation();
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — brand statement (hidden on mobile) */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #fdf6ee 0%, #f5d5b8 100%)" }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-bold text-white">IN</span>
          <span className="text-lg font-semibold text-[var(--text-primary)]">{t("brand.name")}</span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            {t("brand.tagline")}
          </p>
          <h2
            className="mt-4 text-4xl font-bold italic leading-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lost something?<br />Found something?<br />
            <span className="not-italic font-normal text-3xl text-[var(--text-secondary)]">We connect people.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {[
            { icon: "search-outline", text: "Browse lost & found items" },
            { icon: "git-compare-outline", text: "Smart item matching" },
            { icon: "shield-checkmark-outline", text: "Moderated & safe community" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/60">
                <ion-icon name={item.icon} style={{ fontSize: "15px" }} />
              </div>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col bg-[var(--bg)] px-4 py-8 sm:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-xs font-bold text-white">IN</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{t("brand.name")}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
            >
              <ion-icon name={isDark ? "sunny-outline" : "moon-outline"} style={{ fontSize: "16px" }} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
