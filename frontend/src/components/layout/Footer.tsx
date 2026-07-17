import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-10 border-t border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-bold text-white">
                IN
              </span>
              <p className="font-semibold text-[var(--text-primary)]">{t("brand.name")}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {t("brand.footerTagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("footer.navigation")}
            </p>
            <ul className="mt-3 space-y-2">
              {[
                { to: "/", label: t("nav.home") },
                { to: "/login", label: t("nav.login") },
                { to: "/register", label: t("nav.register") },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {t("footer.platform")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <ion-icon name="search-outline" style={{ fontSize: "14px" }} />
                {t("footer.browsePosts")}
              </li>
              <li className="flex items-center gap-2">
                <ion-icon name="git-compare-outline" style={{ fontSize: "14px" }} />
                {t("footer.matching")}
              </li>
              <li className="flex items-center gap-2">
                <ion-icon name="shield-checkmark-outline" style={{ fontSize: "14px" }} />
                {t("footer.moderation")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="text-sm text-[var(--text-secondary)]">
            © {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
