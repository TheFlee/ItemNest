import { useTranslation } from "react-i18next";

const languageOptions = [
  { value: "en", labelKey: "language.english" },
  { value: "az", labelKey: "language.azerbaijani" },
] as const;

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const activeLanguage = i18n.resolvedLanguage === "az" ? "az" : "en";

  function handleLanguageChange(language: "en" | "az") {
    void i18n.changeLanguage(language);
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {t("language.label")}
      </label>

      <div className="flex rounded-xl border border-slate-200 bg-white p-1">
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
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
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
