import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/error";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage("");

        if (form.password !== form.confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            await register(form);
            navigate("/dashboard");
        } catch (error: any) {
            setErrorMessage(getApiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Register</h1>
            <p className="mt-1 text-sm text-slate-500">Create a new ItemNest account.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-500"
                        required
                    />
                </div>

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

                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
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
                    {isSubmitting ? "Creating account..." : "Register"}
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-slate-800 underline">
                    Login
                </Link>
            </p>
        </div>
    );
}