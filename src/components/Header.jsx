import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import hilongosLogo from "../assets/hilongos-logo.png";

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    const isHome = location.pathname === "/";

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const solid = scrolled || !isHome;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
                solid
                    ? "bg-white/95 backdrop-blur shadow-sm border-border"
                    : "bg-transparent border-transparent"
            }`}
        >
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <img
                        src={hilongosLogo}
                        alt="Municipality of Hilongos"
                        className="w-9 h-9 object-contain flex-shrink-0"
                    />
                    <div className="text-left hidden sm:block">
                        <div
                            className={`text-[9px] uppercase tracking-[0.2em] leading-none ${
                                solid ? "text-muted-foreground" : "text-white/60"
                            }`}
                        >
                            Official Portal
                        </div>
                        <div
                            className={`text-sm font-bold leading-tight ${
                                solid ? "text-primary" : "text-white"
                            }`}
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            Hilongos, Leyte
                        </div>
                    </div>
                </button>

                <nav className="flex items-center gap-1">
                    <button
                        onClick={() => navigate("/")}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            solid
                                ? isActive("/")
                                    ? "bg-secondary text-primary font-medium"
                                    : "text-foreground/70 hover:bg-secondary hover:text-primary"
                                : isActive("/")
                                ? "bg-white/15 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => navigate("/my-bookings")}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            solid
                                ? isActive("/my-bookings")
                                    ? "bg-secondary text-primary font-medium"
                                    : "text-foreground/70 hover:bg-secondary hover:text-primary"
                                : isActive("/my-bookings")
                                ? "bg-white/15 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        My Bookings
                    </button>
                    <button
                        onClick={() => navigate("/staff/login")}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                            solid
                                ? isActive("/staff/login")
                                    ? "bg-secondary text-primary font-medium"
                                    : "text-foreground/70 hover:bg-secondary hover:text-primary"
                                : isActive("/staff/login")
                                ? "bg-white/15 text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        Staff
                    </button>
                </nav>
            </div>
        </header>
    );
}