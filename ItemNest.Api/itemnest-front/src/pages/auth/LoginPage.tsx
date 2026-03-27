import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/error";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

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

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Login</h1>
            <p className="mt-1 text-sm text-slate-500">Access your ItemNest account.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Email
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Password
                    </label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
                        required
                    />
                </div>

                {errorMessage && (
                    <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900 disabled:opacity-60"
                >
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
                Do not have an account?{" "}
                <Link to="/register" className="font-medium text-slate-800 underline">
                    Register
                </Link>
            </p>
        </div>
    );
}