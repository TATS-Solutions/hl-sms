import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { isStaffAuthenticated, staffLogout } from "../data/staffAuth";
import { getAllBookings, updateBookingStatus } from "../data/bookings";
import { DEPARTMENTS } from "../data/services";
import StatusBadge from "../components/StatusBadge";

export default function StaffDashboard() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [deptFilter, setDeptFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

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

    const filtered = useMemo(() => {
        return bookings
            .filter((b) => !deptFilter || b.deptId === deptFilter)
            .filter((b) => !dateFrom || new Date(b.date) >= new Date(dateFrom))
            .filter((b) => !dateTo || new Date(b.date) <= new Date(dateTo))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [bookings, deptFilter, dateFrom, dateTo]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                        Staff Dashboard
                    </h1>
                    <p className="text-muted-foreground text-sm">All bookings across departments.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <LogOut size={14} /> Sign Out
                </button>
            </div>

            <div className="bg-secondary/40 border border-border rounded px-4 py-2.5 text-xs text-muted-foreground mb-6">
                Phase 2: SMS/email notifications, staff roles, and reporting are planned for a later release.
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-5">
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                        Department
                    </label>
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="bg-input-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">All Departments</option>
                        {DEPARTMENTS.map((d) => (
                            <option key={d.id} value={d.id}>{d.shortName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                        From
                    </label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-input-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                        To
                    </label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-input-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                {(deptFilter || dateFrom || dateTo) && (
                    <button
                        onClick={() => { setDeptFilter(""); setDateFrom(""); setDateTo(""); }}
                        className="text-accent hover:underline text-sm pb-2"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            <div className="bg-card border border-border rounded overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left">
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Reference</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Service</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Resident</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Date & Time</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Status</th>
                            <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((b) => (
                            <tr key={b.reference} className="border-b border-border last:border-0">
                                <td className="px-4 py-3 text-primary" style={{ fontFamily: "var(--font-mono)" }}>{b.reference}</td>
                                <td className="px-4 py-3">
                                    <div className="text-foreground">{b.serviceName}</div>
                                    <div className="text-muted-foreground text-xs">{b.departmentName}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-foreground">{b.fullName}</div>
                                    <div className="text-muted-foreground text-xs">{b.mobile}</div>
                                </td>
                                <td className="px-4 py-3 text-foreground whitespace-nowrap">
                                    {new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {b.slot}
                                </td>
                                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                                <td className="px-4 py-3">
                                    {b.status === "upcoming" ? (
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => handleAction(b.reference, "done")}
                                                className="text-xs px-2 py-1 rounded border border-accent text-accent hover:bg-accent/10 transition-colors"
                                            >
                                                Done
                                            </button>
                                            <button
                                                onClick={() => handleAction(b.reference, "no-show")}
                                                className="text-xs px-2 py-1 rounded border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                No-show
                                            </button>
                                            <button
                                                onClick={() => handleAction(b.reference, "cancelled")}
                                                className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:bg-secondary transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                                    No bookings match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}