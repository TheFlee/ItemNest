import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import i18n from "../i18n";

const SUPPORTED_LANGS = ["en", "az"] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function isSupportedLang(lang: string): lang is SupportedLang {
  return (SUPPORTED_LANGS as readonly string[]).includes(lang);
}

export default function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();

  useEffect(() => {
    if (lang && isSupportedLang(lang) && i18n.resolvedLanguage !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang]);

  if (!lang || !isSupportedLang(lang)) {
    return <Navigate to="/en" replace />;
  }

  return <Outlet />;
}
