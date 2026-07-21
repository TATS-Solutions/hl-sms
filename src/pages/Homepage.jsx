import { useState, useMemo, useRef } from "react";
import { Search, ChevronRight, Clock, X, Shield, SearchCheck, Calendar, CheckCircle, MapPin, ShieldCheck, ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS, CATEGORIES, CATEGORIES_FULL, SERVICES, QUICK_CHIPS, HOW_STEPS, SERVICE_STATS, getDept, getSvc } from "../data/services";

const STEP_ICONS = [SearchCheck, Calendar, CheckCircle, MapPin, ShieldCheck];
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

      {/* How It Works */}
      <section className="bg-background py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              How it works
            </h2>
            <p className="text-muted-foreground text-sm">
              From search to service completion in five straightforward steps.
            </p>
          </div>

          {/* Desktop: connected horizontal flow */}
          <div className="hidden sm:block relative">
            <div className="absolute top-7 left-0 right-0 h-px bg-border" style={{ margin: "0 3.5rem" }} />
            <div className="relative flex justify-between">
              {HOW_STEPS.map((step, index) => {
                const StepIcon = STEP_ICONS[index];
                return (
                  <div key={step.n} className="flex flex-col items-center text-center w-32">
                    <div className="relative z-10 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-md ring-4 ring-background">
                      <StepIcon size={22} strokeWidth={1.75} />
                    </div>
                    <div
                      className="text-[10px] font-bold text-accent tracking-[0.15em] mt-4 mb-1 uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {step.n}
                    </div>
                    <div className="text-sm font-semibold text-foreground leading-snug">{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile: vertical flow */}
          <div className="sm:hidden space-y-6">
            {HOW_STEPS.map((step, index) => {
              const StepIcon = STEP_ICONS[index];
              const isLast = index === HOW_STEPS.length - 1;
              return (
                <div key={step.n} className="flex items-start gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                      <StepIcon size={20} strokeWidth={1.75} />
                    </div>
                    {!isLast && <div className="w-px flex-1 min-h-6 bg-border mt-2" />}
                  </div>
                  <div className="pt-2.5">
                    <div
                      className="text-[10px] font-bold text-accent tracking-[0.15em] mb-1 uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {step.n}
                    </div>
                    <div className="text-sm font-semibold text-foreground leading-snug">{step.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="bg-card py-12 px-4 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-primary mb-6 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Browse by Category
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES_FULL.map(c => (
              <button
                key={c.id}
                onClick={() => c.active && setCat(cat === c.id ? null : c.id)}
                disabled={!c.active}
                title={!c.active ? "Coming in a future phase" : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
                  !c.active
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : cat === c.id
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-background border-border text-foreground hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <c.Icon size={16} strokeWidth={1.75} />
                <span>{c.label}</span>
                {!c.active && <span className="text-[9px] uppercase tracking-wide ml-0.5 opacity-50">Soon</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {(cat) && (
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setCat(null)}
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              <X size={13} /> Clear category filter
            </button>
          </div>
        )}

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
              <div className="grid gap-4 sm:grid-cols-2">
                {catSvcs.map(s => {
                  const dept = getDept(s.deptId);
                  const stats = SERVICE_STATS[s.id] ?? { queue: 6, next: "3:00 PM" };
                  return (
                    <div
                      key={s.id}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                          <s.Icon size={22} className="text-primary" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-foreground text-sm leading-snug">{s.name}</h3>
                            <span className="text-[10px] bg-primary/8 text-primary rounded-full px-2 py-0.5 font-semibold flex-shrink-0 border border-primary/12">
                              {dept.shortName}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{s.desc}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-background rounded-xl px-2 py-2 text-center">
                          <Clock size={12} className="text-muted-foreground mx-auto mb-1" />
                          <div className="text-[10px] text-muted-foreground mb-0.5">Duration</div>
                          <div className="font-semibold text-foreground text-[11px] leading-tight">{s.time}</div>
                        </div>
                        <div className="bg-background rounded-xl px-2 py-2 text-center">
                          <Users size={12} className="text-muted-foreground mx-auto mb-1" />
                          <div className="text-[10px] text-muted-foreground mb-0.5">Queue</div>
                          <div className="font-semibold text-foreground text-[11px] leading-tight">{stats.queue} now</div>
                        </div>
                        <div className="bg-background rounded-xl px-2 py-2 text-center">
                          <Calendar size={12} className="text-muted-foreground mx-auto mb-1" />
                          <div className="text-[10px] text-muted-foreground mb-0.5">Next slot</div>
                          <div className="font-semibold text-foreground text-[11px] leading-tight">{stats.next}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs text-green-700 font-medium">Available Today</span>
                        </div>
                        <button
                          onClick={() => navigate(`/services/${s.id}`)}
                          className="text-sm bg-primary text-white rounded-xl px-4 py-2 font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                        >
                          Book <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
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