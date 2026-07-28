import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { staffLogin } from "../data/staffAuth";

export default function StaffLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await staffLogin(email, password);
            navigate("/staff/dashboard");
        } catch (err) {
            setError(
                err.response?.status === 401 || err.response?.status === 422
                    ? "Incorrect email or password."
                    : "Something went wrong. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto px-4 py-16">
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <Building2 size={24} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                    Staff Portal
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Municipality of Hilongos — Internal Use Only
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
                <div>
                    <label htmlFor="staff-email" className="block text-sm font-medium mb-1.5">
                        Email
                    </label>
                    <input
                        id="staff-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@hilongos.gov.ph"
                        autoComplete="username"
                        className="w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>
                <div>
                    <label htmlFor="staff-password" className="block text-sm font-medium mb-1.5">
                        Password
                    </label>
                    <input
                        id="staff-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={!email.trim() || !password || submitting}
                    className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? "Signing in…" : "Sign In"}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                    Demo: mho@hilongos.gov.ph / password123
                </p>

                <p className="text-xs text-center text-muted-foreground">
                    Demo: staff@hilongos.gov.ph / staff2026
                </p>
            </form>
        </div>
    );
}