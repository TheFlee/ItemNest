import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/error";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setErrorMessage("");
      setIsSubmitting(true);

      try {
        await googleLogin(credential);
        navigate("/dashboard");
      } catch (error: any) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
    },
    [googleLogin, navigate]
  );

  return (
    <div>
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Account access
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Login
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in to manage your posts, requests, favorites, matches, and reports.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <GoogleLoginButton
          text="signin_with"
          isDisabled={isSubmitting}
          onCredential={handleGoogleCredential}
        />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Or continue with email
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
          </div>

          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500"
            placeholder="Enter your password"
            required
          />
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-sm text-slate-600">
          Do not have an account?{" "}
          <Link to="/register" className="font-semibold text-slate-900 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}