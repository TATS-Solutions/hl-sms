import { useState, useMemo, useRef } from "react";
import { Search, ChevronRight, Clock, X, Shield, SearchCheck, Calendar, CheckCircle, MapPin, ShieldCheck, ArrowRight, Users, Phone, Mail, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES_FULL, HOW_STEPS } from "../data/services";
import { useServices } from "../hooks/useServices";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { matchServices } from "../utils/search";
import hilongosLogo from "../assets/hilongos-logo.png";

const STEP_ICONS = [SearchCheck, Calendar, CheckCircle, MapPin, ShieldCheck];

// Maps a CATEGORIES_FULL id to a keyword found in the real department_name
// returned by the API — there's no category concept on the backend, so
// category pills filter by matching against each service's department name.
const CATEGORY_DEPARTMENT_KEYWORDS = {
  health: "Health Office",
  social: "Social Welfare",
};

export default function Homepage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cat, setCat] = useState(null);
  const searchInputRef = useRef(null);

  const { data: services = [], isLoading, isError } = useServices();
  const debouncedQ = useDebouncedValue(q, 300);

  const suggestions = useMemo(() => matchServices(services, debouncedQ).slice(0, 5), [debouncedQ, services]);

  const filtered = useMemo(() =>
    services.filter(s =>
      !cat || s.department_name?.includes(CATEGORY_DEPARTMENT_KEYWORDS[cat])
    ), [cat, services]);

  const departmentGroups = useMemo(() => {
    const map = new Map();
    filtered.forEach(s => {
      if (!map.has(s.department_id)) {
        map.set(s.department_id, { id: s.department_id, name: s.department_name, services: [] });
      }
      map.get(s.department_id).services.push(s);
    });
    return Array.from(map.values());
  }, [filtered]);

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
                type="text"
                placeholder='Search services — try "prenatal", "indigency", "medical"'
                value={q}
                onChange={e => {
                  setQ(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                onKeyDown={e => {
                  if (e.key === "Enter" && q.trim()) {
                    setShowSuggestions(false);
                    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
                  }
                }}
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
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onMouseDown={() => navigate(`/services/${s.slug}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary text-left transition-colors border-b border-border/50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.department_name}</div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                  <button
                    onMouseDown={() => navigate(`/search?q=${encodeURIComponent(q.trim())}`)}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-accent hover:bg-secondary transition-colors"
                  >
                    View all results for "{q.trim()}" <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {services.slice(0, 6).map(s => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/services/${s.slug}`)}
                  className="flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/22 text-white rounded-full px-3.5 py-2 text-sm hover:bg-white/22 transition-colors"
                >
                  <FileText size={14} />
                  <span>{s.name}</span>
                </button>
              ))}
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
          <h2 className="text-xl font-bold text-primary mb-2 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Browse by Category
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Explore every service by department — separate from the search box above.
          </p>
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
        {q.trim() && (
          <div className="flex items-center justify-between gap-3 mb-6 bg-secondary/60 border border-border rounded-xl px-4 py-3">
            <p className="text-sm text-muted-foreground">
              The list below shows every service, not results for <span className="font-medium text-foreground">"{q.trim()}"</span>.
            </p>
            <button
              onClick={() => navigate(`/search?q=${encodeURIComponent(q.trim())}`)}
              className="text-sm font-semibold text-accent hover:underline whitespace-nowrap flex items-center gap-1"
            >
              Search now <ArrowRight size={13} />
            </button>
          </div>
        )}

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

        {/* Loading / error states */}
        {isLoading && (
          <div className="text-center py-20 text-muted-foreground text-sm">Loading services…</div>
        )}
        {isError && (
          <div className="text-center py-20 text-destructive text-sm">
            Couldn't load services. Please try again shortly.
          </div>
        )}

        {/* Service grid grouped by department */}
        {!isLoading && !isError && departmentGroups.map(dept => (
          <section key={dept.id} className="mb-10">
            <h2 className="text-base font-semibold text-primary border-b border-border pb-2 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              {dept.name}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {dept.services.map(s => (
                <div
                  key={s.id}
                  className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <FileText size={22} className="text-primary" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm leading-snug">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{s.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {s.fixed_fee > 0 ? `₱${s.fixed_fee}` : s.has_variable_fee ? "Variable fee" : "No fee"}
                    </span>
                    <button
                      onClick={() => navigate(`/services/${s.slug}`)}
                      className="text-sm bg-primary text-white rounded-xl px-4 py-2 font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                    >
                      View Details <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search size={36} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No services found in this category.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src={hilongosLogo} alt="Municipality of Hilongos" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-white/40 leading-none">Official Portal</div>
                <div className="text-sm font-bold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Hilongos, Leyte
                </div>
              </div>
            </div>
            <p className="text-white/50 text-xs leading-relaxed mb-4">
              The official digital service portal of the Municipality of Hilongos, Leyte, Philippines.
            </p>
            <div className="flex gap-2">
              {["Facebook", "Twitter", "YouTube"].map(s => (
                <button
                  key={s}
                  className="text-[11px] bg-white/10 hover:bg-white/18 px-2.5 py-1.5 rounded-lg transition-colors text-white/60 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-semibold">Services</div>
            <ul className="space-y-2">
              {["Health & Family", "Social Services", "Civil Registry", "Business Permits", "Treasury"].map(item => (
                <li key={item}>
                  <button className="text-sm text-white/55 hover:text-white transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-semibold">Information</div>
            <ul className="space-y-2">
              {["Citizen Charter", "Privacy Policy", "Accessibility Statement", "Open Data", "Submit Feedback"].map(item => (
                <li key={item}>
                  <button className="text-sm text-white/55 hover:text-white transition-colors">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-semibold">Contact</div>
            <div className="space-y-2.5 text-sm text-white/55">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="mt-0.5 flex-shrink-0" />
                <span>Hilongos, Leyte 6524<br />Philippines</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} />
                <span>(053) 561-0001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} />
                <span>info@hilongos.gov.ph</span>
              </div>
            </div>
            <div className="mt-4 bg-white/8 border border-white/10 rounded-xl p-3 text-xs text-white/55">
              <div className="font-semibold text-white/75 mb-1.5 flex items-center gap-1.5">
                <Clock size={11} />
                Office Hours
              </div>
              <div>Monday – Friday</div>
              <div>8:00 AM – 5:00 PM</div>
              <div className="text-red-300 mt-1.5 font-medium">Emergency: (053) 561-0002</div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <span>&copy; 2026 Municipality of Hilongos. All rights reserved.</span>
          <span>Phase 1 — Unified Appointment System</span>
        </div>
      </footer>
    </div>
  );
}