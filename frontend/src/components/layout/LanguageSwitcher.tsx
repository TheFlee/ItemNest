import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const languageOptions = [
  { value: "en", labelKey: "language.english" },
  { value: "az", labelKey: "language.azerbaijani" },
] as const;

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams<{ lang?: string }>();

  const activeLanguage = lang === "az" ? "az" : "en";

  function handleLanguageChange(language: "en" | "az") {
    const currentLang = activeLanguage;
    const newPathname = location.pathname.startsWith(`/${currentLang}`)
      ? `/${language}${location.pathname.slice(currentLang.length + 1)}`
      : `/${language}`;
    navigate(newPathname + location.search, { replace: true });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
        {t("language.label")}
      </label>

      <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-1">
        {languageOptions.map((option) => {
          const isActive = option.value === activeLanguage;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleLanguageChange(option.value)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              {option.value.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
