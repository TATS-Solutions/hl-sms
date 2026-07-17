import { useState, useMemo } from "react";
import { Search, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS, CATEGORIES, SERVICES, getDept } from "../data/services";

export default function Homepage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(null);

  const filtered = useMemo(() =>
    SERVICES.filter(s =>
      (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.desc.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || s.catId === cat)
    ), [q, cat]);

  return (
    <div className="min-h-screen bg-background">
      {/* Full-bleed search band */}
      <div className="bg-primary pb-12 pt-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-2">
            Hilongos Municipal Services Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
            What do you need today?
          </h1>
          <p className="text-white/55 text-sm mb-6">
            Book an appointment with any municipal office — one portal for all services.
          </p>
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
            <input
              type="search"
              placeholder='Search — try "prenatal", "indigency", "medical consultation"'
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full bg-white text-foreground placeholder-muted-foreground rounded pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent shadow-xl"
              aria-label="Search services"
            />
          </div>
        </div>
      </div>

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