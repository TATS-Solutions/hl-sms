import { useState, useMemo, useRef } from "react";
import { Search, ChevronRight, Clock, X, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS, CATEGORIES, SERVICES, QUICK_CHIPS, getDept, getSvc } from "../data/services";

export default function Homepage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cat, setCat] = useState(null);
  const searchInputRef = useRef(null);

  const suggestions = useMemo(() =>
    q.trim().length > 0
      ? SERVICES.filter(s =>
          s.name.toLowerCase().includes(q.toLowerCase()) || s.desc.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 5)
      : [],
    [q]);

  const filtered = useMemo(() =>
    SERVICES.filter(s =>
      (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.desc.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || s.catId === cat)
    ), [q, cat]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center bg-primary">
        <img
          src="https://images.unsplash.com/photo-1755344166932-ae7b6d99376d?w=1600&h=900&fit=crop&auto=format"
          alt="Hilongos Municipal Hall"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/65 to-primary/90" />

        <div className="relative w-full max-w-4xl mx-auto px-4 pt-28 pb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6 border border-white/20">
              <Shield size={12} className="text-accent" />
              <span className="text-[11px] text-white/80 uppercase tracking-widest font-medium">
                Official Digital Portal
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              What service do you need today?
            </h1>
            <p className="text-white/60 text-lg mb-8 leading-relaxed max-w-xl">
              Book appointments, submit applications, and access municipal services from one unified portal.
            </p>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none z-10"
              />
              <input
                ref={searchInputRef}
                type="search"
                placeholder='Search services — try "prenatal", "indigency", "medical"'
                value={q}
                onChange={e => {
                  setQ(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                className="w-full bg-white text-foreground placeholder-muted-foreground rounded-2xl pl-12 pr-12 py-4 text-base shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent/50"
                aria-label="Search services"
              />
              {q && (
                <button
                  onClick={() => {
                    setQ("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50">
                  {suggestions.map(s => {
                    const dept = getDept(s.deptId);
                    return (
                      <button
                        key={s.id}
                        onMouseDown={() => navigate(`/services/${s.id}`)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary text-left transition-colors border-b border-border/50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                          <s.Icon size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{dept.shortName}</div>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {QUICK_CHIPS.map(chip => {
                const s = getSvc(chip.svcId);
                return (
                  <button
                    key={chip.svcId}
                    onClick={() => navigate(`/services/${s.id}`)}
                    className="flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/22 text-white rounded-full px-3.5 py-2 text-sm hover:bg-white/22 transition-colors"
                  >
                    <s.Icon size={14} />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Category filter bar */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1 hidden sm:inline">Filter by</span>
          <button
            onClick={() => setCat(null)}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${!cat ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary/40"}`}
          >
            All Services
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(cat === c.id ? null : c.id)}
              className={`px-3 py-1.5 rounded text-sm border transition-colors ${cat === c.id ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary/40"}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {q && (
          <p className="text-sm text-muted-foreground mb-5">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{q}"
            <button onClick={() => setQ("")} className="ml-2 text-accent hover:underline text-sm">Clear</button>
          </p>
        )}

        {/* Service grid grouped by category */}
        {CATEGORIES.filter(c => !cat || c.id === cat).map(c => {
          const catSvcs = filtered.filter(s => s.catId === c.id);
          if (catSvcs.length === 0) return null;
          return (
            <section key={c.id} className="mb-10">
              <h2 className="text-base font-semibold text-primary border-b border-border pb-2 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {c.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {catSvcs.map(s => {
                  const dept = getDept(s.deptId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/services/${s.id}`)}
                      className="bg-card text-left rounded border border-border hover:border-accent/50 hover:shadow-sm transition-all p-5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-medium">{dept.shortName}</div>
                          <div className="font-semibold text-foreground mb-1.5 text-sm">{s.name}</div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{s.desc}</p>
                        </div>
                        <ChevronRight size={15} className="text-accent flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock size={11} /><span>{s.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search size={36} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No services found. Try a different keyword.</p>
          </div>
        )}
      </main>
    </div>
  );
}