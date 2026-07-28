import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ClipboardList, TrendingUp, CheckCircle, XCircle, Filter, Search } from "lucide-react";
import { isStaffAuthenticated, staffLogout, verifyStaffSession, getStoredStaffUser } from "../data/staffAuth";
import { fetchServiceRequests, fetchServiceRequestStats, updateServiceRequestStatus } from "../api/staff";
import { getStatusInfo } from "../data/statusMap";

const STATUS_TRANSITIONS = {
  pending: ["pending_assessment", "pending_payment", "processing", "cancelled", "no_show"],
  pending_assessment: ["pending_payment", "cancelled"],
  pending_payment: ["processing", "cancelled"],
  processing: ["completed", "cancelled", "no_show"],
  completed: ["no_show"],
  cancelled: ["pending"],
  no_show: ["processing", "pending"],
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredStaffUser());
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [deptFilter, setDeptFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isGlobalRole = user?.role === "admin" || user?.role === "treasurer";

  const buildParams = useCallback(() => {
    const params = {};
    if (isGlobalRole && deptFilter) params.department_id = deptFilter;
    if (dateFilter) params.date = dateFilter;
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    return params;
  }, [isGlobalRole, deptFilter, dateFilter, statusFilter, search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = buildParams();
      const [listRes, statsRes] = await Promise.all([
        fetchServiceRequests(params),
        fetchServiceRequestStats(params),
      ]);
      setRequests(listRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      setError("Couldn't load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      navigate("/staff/login");
      return;
    }
    verifyStaffSession()
      .then((freshUser) => setUser(freshUser))
      .catch(() => {
        staffLogout();
        navigate("/staff/login");
      });
  }, [navigate]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleLogout = async () => {
    await staffLogout();
    navigate("/staff/login");
  };

  const handleStatusChange = async (request, newStatus) => {
    let cancellation_reason;
    if (newStatus === "cancelled") {
      cancellation_reason = window.prompt("Reason for cancellation (required):");
      if (!cancellation_reason || cancellation_reason.trim().length < 3) return;
    }
    try {
      await updateServiceRequestStatus(request.id, {
        status: newStatus,
        ...(cancellation_reason ? { cancellation_reason: cancellation_reason.trim() } : {}),
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update status.");
    }
  };

  const STAT_CARDS = stats ? [
    { label: "Today's Appointments", value: stats.todays_appointments, Icon: ClipboardList, color: "text-primary" },
    { label: "All Upcoming", value: stats.upcoming_appointments, Icon: TrendingUp, color: "text-blue-600" },
    { label: "Completed Today", value: stats.completed_today, Icon: CheckCircle, color: "text-green-600" },
    { label: "No-shows", value: stats.no_shows, Icon: XCircle, color: "text-amber-600" },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Appointments Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.department?.name || "Municipality of Hilongos"} · {user?.name} · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight">
                  {s.label}
                </span>
                <s.Icon size={16} className={s.color} />
              </div>
              <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        {isGlobalRole && (
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-muted-foreground" />
            <input
              type="number"
              placeholder="Department ID"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">All Statuses</option>
          {Object.keys(STATUS_TRANSITIONS).map((s) => (
            <option key={s} value={s}>{getStatusInfo(s).label}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">
          {requests.length} record{requests.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Reference", "Resident", "Service", "Date & Time", "Status", "Update"].map((h, i) => (
                  <th
                    key={h}
                    className={`text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground ${
                      i === 2 ? "hidden sm:table-cell" : i === 3 ? "hidden md:table-cell" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-12 text-sm">Loading…</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="text-center text-destructive py-12 text-sm">{error}</td></tr>
              )}
              {!loading && !error && requests.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted-foreground py-12 text-sm">No records match the current filters.</td></tr>
              )}
              {!loading && !error && requests.map((r) => {
                const nextOptions = STATUS_TRANSITIONS[r.status] || [];
                return (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-primary font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-mono)" }}>
                      {r.reference_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{r.resident_name}</div>
                      <div className="text-xs text-muted-foreground">{r.resident_phone}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-sm">{r.service_name}</div>
                      <div className="text-xs text-muted-foreground">{r.department_name}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm">
                        {r.scheduled_date && new Date(r.scheduled_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.scheduled_time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${getStatusInfo(r.status).color}`}>
                        {getStatusInfo(r.status).label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {nextOptions.length > 0 ? (
                        <select
                          value=""
                          onChange={(e) => e.target.value && handleStatusChange(r, e.target.value)}
                          className="text-xs border border-border rounded-lg px-2 py-1.5 bg-card focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          <option value="">Change status…</option>
                          {nextOptions.map((s) => (
                            <option key={s} value={s}>{getStatusInfo(s).label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}