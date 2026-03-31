import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold tracking-wide text-white">
              IN
            </span>

            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                ItemNest
              </p>
              <p className="text-sm text-slate-500">Lost and found platform</p>
            </div>
          </Link>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Outlet />
        </section>
      </div>
    </div>
  );
}