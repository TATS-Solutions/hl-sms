import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div
            className="w-8 h-8 rounded bg-accent flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            MH
          </div>
          <div className="text-left">
            <div className="text-[9px] uppercase tracking-[0.18em] text-white/40 leading-none">
              Municipality of
            </div>
            <div className="text-sm font-semibold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Hilongos
            </div>
          </div>
        </button>

        <nav className="flex items-center gap-1">
        <button
            onClick={() => navigate("/")}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
            isActive("/") ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
        >
            Home
        </button>
        <button
            onClick={() => navigate("/my-bookings")}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
            isActive("/my-bookings") ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
        >
            My Bookings
        </button>
        <button
            onClick={() => navigate("/staff/login")}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
            isActive("/staff/login") ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
        >
            Staff
        </button>
        </nav>
      </div>
    </header>
  );
}