import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ClipboardList, TrendingUp, CheckCircle, XCircle, AlertCircle, Filter } from "lucide-react";
import { isStaffAuthenticated, staffLogout } from "../data/staffAuth";
import { getAllBookings, updateBookingStatus } from "../data/bookings";
import { DEPARTMENTS, getDept, getSvc } from "../data/services";

const STATUS_BADGE = {
  upcoming: "bg-blue-50 text-blue-800 border-blue-200",
  done: "bg-green-50 text-green-800 border-green-200",
  "no-show": "bg-amber-50 text-amber-800 border-amber-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

const STATUS_LABEL = {
  upcoming: "Upcoming",
  done: "Completed",
  "no-show": "No-show",
  cancelled: "Cancelled",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [deptFilter, setDeptFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      navigate("/staff/login");
      return;
    }
    setBookings(getAllBookings());
  }, [navigate]);

  const handleAction = (reference, status) => {
    updateBookingStatus(reference, status);
    setBookings(getAllBookings());
  };

  const handleLogout = () => {
    staffLogout();
    navigate("/staff/login");
  };

  const today = todayStr();

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (deptFilter !== "all") list = list.filter((b) => b.deptId === deptFilter);
    if (dateFilter === "today") {
      list = list.filter((b) => b.date.slice(0, 10) === today);
    } else if (dateFilter === "upcoming") {
      list = list.filter((b) => b.date.slice(0, 10) >= today && b.status === "upcoming");
    }
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [bookings, deptFilter, dateFilter, today]);

  const stats = useMemo(() => {
    const todayBookings = bookings.filter((b) => b.date.slice(0, 10) === today);
    return {
      todayTotal: todayBookings.length,
      todayDone: todayBookings.filter((b) => b.status === "done").length,
      upcomingAll: bookings.filter((b) => b.date.slice(0, 10) >= today && b.status === "upcoming").length,
      noShows: bookings.filter((b) => b.status === "no-show").length,
    };
  }, [bookings, today]);

  const STAT_CARDS = [
    { label: "Today's Appointments", value: stats.todayTotal, Icon: ClipboardList, color: "text-primary" },
    { label: "All Upcoming", value: stats.upcomingAll, Icon: TrendingUp, color: "text-blue-600" },
    { label: "Completed Today", value: stats.todayDone, Icon: CheckCircle, color: "text-green-600" },
    { label: "No-shows", value: stats.noShows, Icon: XCircle, color: "text-amber-600" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Appointments Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Municipality of Hilongos · Staff View · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

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

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-800 flex items-start gap-2">
        <AlertCircle size={13} className="mt-px flex-shrink-0" />
        <span>
          <strong>Phase 2 roadmap:</strong> Department-specific staff accounts and role-based access control are planned for the next phase.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-muted-foreground" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.shortName}</option>
            ))}
          </select>
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="today">
            Today ({new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })})
          </option>
          <option value="upcoming">All Upcoming</option>
          <option value="all">All Records</option>
        </select>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Reference", "Resident", "Service", "Date & Time", "Status", "Actions"].map((h, i) => (
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                    No records match the current filter.
                  </td>
                </tr>
              )}
              {filtered.map((b) => {
                const service = getSvc(b.serviceId);
                const dept = getDept(b.deptId);
                return (
                  <tr key={b.reference} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-primary font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-mono)" }}>
                      {b.reference}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{b.fullName}</div>
                      <div className="text-xs text-muted-foreground">{b.mobile}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-sm">{service.name}</div>
                      <div className="text-xs text-muted-foreground">{dept.shortName}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm">
                        {new Date(b.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div className="text-xs text-muted-foreground">{b.slot}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap ${STATUS_BADGE[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.status === "upcoming" ? (
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleAction(b.reference, "done")}
                            className="text-xs px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Done
                          </button>
                          <button
                            onClick={() => handleAction(b.reference, "no-show")}
                            className="text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                          >
                            No-show
                          </button>
                          <button
                            onClick={() => handleAction(b.reference, "cancelled")}
                            className="text-xs px-2.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Cancel
                          </button>
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
    </div>
  );
}