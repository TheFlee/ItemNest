import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

function navLinkClass(isActive: boolean) {
  return [
    "inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

function renderLink(to: string, label: string) {
  return (
    <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)}>
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
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
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold tracking-wide text-white">
                    IN
                  </span>

                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-900">
                      {t("brand.name")}
                    </p>
                    <p className="text-sm text-slate-500">{t("brand.tagline")}</p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <LanguageSwitcher />

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        {t("nav.account")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {user?.fullName}
                      </p>
                    </Link>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/create-post"
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                      >
                        {t("nav.createPost")}
                      </Link>

                      <button
                        onClick={logout}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                      >
                        {t("nav.logout")}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    >
                      {t("nav.login")}
                    </Link>

                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                      {t("nav.register")}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {memberLinks.map((link) => renderLink(link.to, link.label))}
                  </div>
                </div>

                {isAdmin && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {adminLinks.map((link) => renderLink(link.to, link.label))}
                    </div>
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
