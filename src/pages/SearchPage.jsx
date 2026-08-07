import { useMemo, useRef, useEffect } from "react";
import { Search, X, ArrowRight, FileText, ArrowLeft, SearchX } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useServices } from "../hooks/useServices";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { QUICK_CHIPS } from "../data/services";
import { matchServices } from "../utils/search";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const debouncedQ = useDebouncedValue(q, 300);
  const inputRef = useRef(null);

  const { data: services = [], isLoading, isError } = useServices();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => matchServices(services, debouncedQ), [debouncedQ, services]);

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

  const runSearch = (value) => {
    setSearchParams(value.trim() ? { q: value } : {}, { replace: true });
  };

  const hasQuery = q.trim().length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Search header */}
      <div className="bg-card border-b border-border sticky top-16 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder='Search services — try "prenatal", "indigency", "medical"'
              value={q}
              onChange={e => runSearch(e.target.value)}
              className="w-full bg-background border border-border text-foreground placeholder-muted-foreground rounded-2xl pl-12 pr-12 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              aria-label="Search services"
            />
            {q && (
              <button
                onClick={() => {
                  runSearch("");
                  inputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {hasQuery && !isLoading && !isError && (
            <p className="text-sm text-muted-foreground mt-3">
              <span className="font-semibold text-foreground">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for "{q}"
            </p>
          )}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Loading state: skeleton cards */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Loading results">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-full" />
                    <div className="h-3 bg-secondary rounded w-2/3" />
                  </div>
                </div>
                <div className="h-8 bg-secondary rounded-xl w-28 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-destructive text-sm">Couldn't load services. Please try again shortly.</p>
          </div>
        )}

        {/* Empty state: no query yet */}
        {!isLoading && !isError && !hasQuery && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search size={26} className="text-primary" strokeWidth={1.75} />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Search for a service
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Start typing above, or try one of these popular searches.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  onClick={() => runSearch(chip.label)}
                  className="text-sm bg-card border border-border text-foreground rounded-full px-4 py-2 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results grouped by department */}
        {!isLoading && !isError && hasQuery && departmentGroups.map(dept => (
          <section key={dept.id} className="mb-10 last:mb-0">
            <div className="flex items-baseline gap-2 border-b border-border pb-2 mb-4">
              <h2 className="text-base font-semibold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
                {dept.name}
              </h2>
              <span className="text-xs text-muted-foreground">({dept.services.length})</span>
            </div>
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
                    <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2.5 py-1">
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

        {/* No results */}
        {!isLoading && !isError && hasQuery && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <SearchX size={26} className="text-muted-foreground" strokeWidth={1.75} />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              No services found
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              We couldn't find anything for "{q}". Try a different keyword or one of these:
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {QUICK_CHIPS.slice(0, 4).map(chip => (
                <button
                  key={chip.label}
                  onClick={() => runSearch(chip.label)}
                  className="text-sm bg-card border border-border text-foreground rounded-full px-4 py-2 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
