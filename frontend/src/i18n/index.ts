import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import az from "./locales/az";
import en from "./locales/en";

const resources = {
  en: {
    translation: en,
  },
  az: {
    translation: az,
  },
} as const;

void i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "az"],
    defaultNS: "translation",
    ns: ["translation"],
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (language) => {
  document.documentElement.lang = language;
});

document.documentElement.lang = i18n.resolvedLanguage ?? i18n.language ?? "en";

export default i18n;
