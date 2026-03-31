import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.roles.includes("Admin") ?? false;

  const memberLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/my-posts", label: "My Posts" },
    { to: "/favorites", label: "Favorites" },
    { to: "/contact-requests/sent", label: "Sent Requests" },
    { to: "/contact-requests/received", label: "Received Requests" },
    { to: "/my-reports", label: "My Reports" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Admin Dashboard" },
    { to: "/admin/posts", label: "Admin Posts" },
    { to: "/admin/reports", label: "Admin Reports" },
    { to: "/admin/users", label: "Admin Users" },
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
                      ItemNest
                    </p>
                    <p className="text-sm text-slate-500">
                      Lost and found platform
                    </p>
                  </div>
                </Link>
              </div>

              {isAuthenticated ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      Account
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {user?.fullName}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/create-post"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                      Create Post
                    </Link>

                    <button
                      onClick={logout}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    Register
                  </Link>
                </div>
              )}
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