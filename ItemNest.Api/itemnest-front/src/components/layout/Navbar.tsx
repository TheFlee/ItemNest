import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "font-medium text-slate-900"
    : "text-slate-700 hover:text-slate-900";
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.roles.includes("Admin") ?? false;

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-slate-800">
          ItemNest
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm">
          <NavLink to="/" className={navClassName}>
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/my-posts" className={navClassName}>
                My Posts
              </NavLink>
              <NavLink to="/favorites" className={navClassName}>
                Favorites
              </NavLink>
              <NavLink to="/contact-requests/sent" className={navClassName}>
                Sent Requests
              </NavLink>
              <NavLink to="/contact-requests/received" className={navClassName}>
                Received Requests
              </NavLink>
              <NavLink to="/my-reports" className={navClassName}>
                My Reports
              </NavLink>
              {isAdmin && (
                <>
                  <NavLink to="/admin/dashboard" className={navClassName}>
                    Admin Dashboard
                  </NavLink>
                  <NavLink to="/admin/reports" className={navClassName}>
                    Admin Reports
                  </NavLink>
                  <NavLink to="/admin/posts" className={navClassName}>
                    Admin Posts
                  </NavLink>
                  <NavLink to="/admin/users" className={navClassName}>
                    Admin Users
                  </NavLink>
                </>
              )}
              <NavLink to="/create-post" className={navClassName}>
                Create Post
              </NavLink>

              <span className="text-slate-500">{user?.fullName}</span>

              <button
                onClick={logout}
                className="rounded-lg bg-slate-800 px-3 py-2 text-white hover:bg-slate-900"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClassName}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive
                    ? "rounded-lg bg-slate-900 px-3 py-2 text-white"
                    : "rounded-lg bg-slate-800 px-3 py-2 text-white hover:bg-slate-900"
                }
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}