import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

const navIconMap: Record<string, string> = {
  "/": "home-outline",
  "/dashboard": "grid-outline",
  "/my-posts": "document-text-outline",
  "/favorites": "heart-outline",
  "/contact-requests/sent": "paper-plane-outline",
  "/contact-requests/received": "mail-open-outline",
  "/my-reports": "flag-outline",
};

const adminIconMap: Record<string, string> = {
  "/admin/dashboard": "speedometer-outline",
  "/admin/posts": "layers-outline",
  "/admin/reports": "shield-outline",
  "/admin/users": "people-outline",
  "/admin/categories": "pricetag-outline",
};

function navLinkClass(isActive: boolean) {
  return [
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-[var(--accent)] text-white"
      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]",
  ].join(" ");
}

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.roles.includes("Admin") ?? false;

  const memberLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/my-posts", label: t("nav.myPosts") },
    { to: "/favorites", label: t("nav.favorites") },
    { to: "/contact-requests/sent", label: t("nav.sentRequests") },
    { to: "/contact-requests/received", label: t("nav.receivedRequests") },
    { to: "/my-reports", label: t("nav.myReports") },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: t("nav.adminDashboard") },
    { to: "/admin/posts", label: t("nav.adminPosts") },
    { to: "/admin/reports", label: t("nav.adminReports") },
    { to: "/admin/users", label: t("nav.adminUsers") },
    // nav.adminCategories i18n key will be added in Task 10; hardcoded for now
    { to: "/admin/categories", label: "Categories" },
  ];

  function renderNavLink(to: string, label: string, iconMap: Record<string, string>) {
    return (
      <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)}>
        <ion-icon name={iconMap[to] ?? "ellipse-outline"} style={{ fontSize: "15px" }} />
        {label}
      </NavLink>
    );
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col gap-4">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold tracking-wide text-white">
                  IN
                </span>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                    {t("brand.name")}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{t("brand.tagline")}</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <LanguageSwitcher />

                {/* Mobile hamburger — hidden at lg and above */}
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] lg:hidden"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                >
                  <ion-icon name={menuOpen ? "close-outline" : "menu-outline"} style={{ fontSize: "18px" }} />
                </button>

                {/* Desktop auth actions — hidden on mobile */}
                <div className="hidden lg:flex lg:items-center lg:gap-3">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/account"
                        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 transition hover:border-[var(--accent)]"
                      >
                        <ion-icon name="person-circle-outline" style={{ fontSize: "16px", color: "var(--text-secondary)" }} />
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                            {t("nav.account")}
                          </p>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {user?.fullName}
                          </p>
                        </div>
                      </Link>
                      <Link
                        to="/create-post"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
                      >
                        <ion-icon name="add-circle-outline" style={{ fontSize: "15px" }} />
                        {t("nav.createPost")}
                      </Link>
                      <button
                        onClick={logout}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                      >
                        <ion-icon name="log-out-outline" style={{ fontSize: "15px" }} />
                        {t("nav.logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                      >
                        {t("nav.login")}
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)]"
                      >
                        {t("nav.register")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop nav links (authenticated) — hidden on mobile */}
            {isAuthenticated && (
              <div className="hidden lg:block">
                <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    {memberLinks.map((link) => renderNavLink(link.to, link.label, navIconMap))}
                  </div>
                  {isAdmin && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 ">
                      <div className="flex flex-wrap gap-2">
                        {adminLinks.map((link) => renderNavLink(link.to, link.label, adminIconMap))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile drawer */}
            {menuOpen && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 lg:hidden">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      {memberLinks.map((link) => renderNavLink(link.to, link.label, navIconMap))}
                    </div>
                    {isAdmin && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 ">
                        <div className="flex flex-col gap-1">
                          {adminLinks.map((link) => renderNavLink(link.to, link.label, adminIconMap))}
                        </div>
                      </div>
                    )}
                    <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-2">
                      <Link
                        to="/account"
                        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2"
                      >
                        <ion-icon name="person-circle-outline" style={{ fontSize: "16px" }} />
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{user?.fullName}</span>
                      </Link>
                      <Link
                        to="/create-post"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
                      >
                        <ion-icon name="add-circle-outline" style={{ fontSize: "15px" }} />
                        {t("nav.createPost")}
                      </Link>
                      <button
                        onClick={logout}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)]"
                      >
                        <ion-icon name="log-out-outline" style={{ fontSize: "15px" }} />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)]"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      {t("nav.register")}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
