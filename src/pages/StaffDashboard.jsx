import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ClipboardList, TrendingUp, CheckCircle, XCircle, Filter, Search, ClipboardCheck, CreditCard, PlayCircle, CheckCircle2, Ban, UserX, RotateCcw, Receipt } from "lucide-react";
import { isStaffAuthenticated, staffLogout, verifyStaffSession, getStoredStaffUser } from "../data/staffAuth";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchServiceRequests, fetchServiceRequestStats, updateServiceRequestStatus } from "../api/staff";
import { getStatusInfo } from "../data/statusMap";
import FeeAssessmentModal from "../components/FeeAssessmentModal";

const ASSESSABLE_STATUSES = ["pending", "pending_assessment"];

const STATUS_TRANSITIONS = {
  pending: ["pending_assessment", "pending_payment", "processing", "cancelled", "no_show"],
  pending_assessment: ["pending_payment", "cancelled"],
  pending_payment: ["processing", "cancelled"],
  processing: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: ["pending"],
  no_show: ["processing", "pending"],
};

// Icon + color per target status, used to render the Update column as one-click action buttons.
const STATUS_ACTION_ICONS = {
  pending: { Icon: RotateCcw, className: "text-yellow-700 hover:bg-yellow-50 border-yellow-200" },
  pending_assessment: { Icon: ClipboardCheck, className: "text-orange-700 hover:bg-orange-50 border-orange-200" },
  pending_payment: { Icon: CreditCard, className: "text-blue-700 hover:bg-blue-50 border-blue-200" },
  processing: { Icon: PlayCircle, className: "text-purple-700 hover:bg-purple-50 border-purple-200" },
  completed: { Icon: CheckCircle2, className: "text-green-700 hover:bg-green-50 border-green-200" },
  cancelled: { Icon: Ban, className: "text-red-700 hover:bg-red-50 border-red-200" },
  no_show: { Icon: UserX, className: "text-gray-700 hover:bg-gray-100 border-gray-300" },
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
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [assessTarget, setAssessTarget] = useState(null);

  const isGlobalRole = user?.role === "admin" || user?.role === "treasurer";

  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedDeptFilter = useDebouncedValue(deptFilter, 350);
  const requestIdRef = useRef(0);

  const buildParams = useCallback(() => {
    const params = {};
    if (isGlobalRole && debouncedDeptFilter) params.department_id = debouncedDeptFilter;
    if (dateFilter) params.date = dateFilter;
    if (statusFilter) params.status = statusFilter;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    return params;
  }, [isGlobalRole, debouncedDeptFilter, dateFilter, statusFilter, debouncedSearch]);

  const loadData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    try {
      const params = buildParams();
      const [listRes, statsRes] = await Promise.all([
        fetchServiceRequests(params),
        fetchServiceRequestStats(params),
      ]);
      if (requestIdRef.current !== requestId) return;
      setRequests(listRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError("Couldn't load dashboard data. Please try again.");
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
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

  const handleStatusChange = async (request, newStatus, cancellation_reason) => {
    try {
      await updateServiceRequestStatus(request.id, {
        status: newStatus,
        ...(cancellation_reason ? { cancellation_reason } : {}),
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update status.");
    }
  };

  const openCancelModal = (request) => {
    setCancelTarget(request);
    setCancelReason("");
    setCancelError("");
  };

  const closeCancelModal = () => {
    setCancelTarget(null);
    setCancelReason("");
    setCancelError("");
  };

  const handleConfirmCancel = async () => {
    const reason = cancelReason.trim();
    if (reason.length < 3) {
      setCancelError("Please enter a reason of at least 3 characters.");
      return;
    }
    setCancelSubmitting(true);
    try {
      await handleStatusChange(cancelTarget, "cancelled", reason);
      closeCancelModal();
    } finally {
      setCancelSubmitting(false);
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
                      <div className="text-sm">{r.service?.name}</div>
                      <div className="text-xs text-muted-foreground">{r.department?.name}</div>
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
                      {(nextOptions.length > 0 || ASSESSABLE_STATUSES.includes(r.status)) ? (
                        <div className="flex flex-wrap gap-1.5">
                          {ASSESSABLE_STATUSES.includes(r.status) && (
                            <button
                              type="button"
                              title="Assess Fees"
                              aria-label="Assess Fees"
                              onClick={() => setAssessTarget(r)}
                              className="flex items-center justify-center w-7 h-7 rounded-lg border bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 text-primary hover:bg-primary/10 border-primary/40"
                            >
                              <Receipt size={14} />
                            </button>
                          )}
                          {nextOptions.map((s) => {
                            const { Icon, className } = STATUS_ACTION_ICONS[s] || {};
                            return (
                              <button
                                key={s}
                                type="button"
                                title={getStatusInfo(s).label}
                                aria-label={`Mark as ${getStatusInfo(s).label}`}
                                onClick={() => (s === "cancelled" ? openCancelModal(r) : handleStatusChange(r, s))}
                                className={`flex items-center justify-center w-7 h-7 rounded-lg border bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${className || "text-muted-foreground hover:bg-secondary/40 border-border"}`}
                              >
                                {Icon && <Icon size={14} />}
                              </button>
                            );
                          })}
                        </div>
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

      {cancelTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeCancelModal}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-lg w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-bold text-foreground mb-1">Cancel appointment</h2>
            <p className="text-xs text-muted-foreground mb-3">
              {cancelTarget.reference_code} · {cancelTarget.resident_name}
            </p>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Reason for cancellation
            </label>
            <textarea
              autoFocus
              rows={3}
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value);
                if (cancelError) setCancelError("");
              }}
              placeholder="e.g. Resident requested reschedule"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            {cancelError && (
              <p className="text-xs text-destructive mt-1">{cancelError}</p>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={closeCancelModal}
                disabled={cancelSubmitting}
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/40 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelSubmitting}
                className="text-sm px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {cancelSubmitting ? "Cancelling…" : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {assessTarget && (
        <FeeAssessmentModal
          request={assessTarget}
          onClose={() => setAssessTarget(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}