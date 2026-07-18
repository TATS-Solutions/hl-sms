import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffLogin } from "../data/staffAuth";

export default function StaffLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (staffLogin(email, password)) {
            navigate("/staff/dashboard");
        } else {
            setError("Incorrect email or password.");
        }
    };

    return (
        <div className="max-w-sm mx-auto px-4 py-16">
            <h1 className="text-xl font-semibold text-foreground mb-1 text-center" style={{ fontFamily: "var(--font-heading)" }}>
                Staff Sign In
            </h1>
            <p className="text-muted-foreground text-sm mb-6 text-center">
                Municipal staff access only.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@hilongos.gov.ph"
                        className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={!email.trim() || !password}
                    className="w-full bg-primary text-white rounded py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
}