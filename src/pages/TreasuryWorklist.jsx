import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Receipt, LogOut } from "lucide-react";
import { isStaffAuthenticated, staffLogout, verifyStaffSession, getStoredStaffUser } from "../data/staffAuth";
import { fetchTreasuryWorklist, fetchServiceRequestStats } from "../api/staff";
import { getStatusInfo } from "../data/statusMap";
import FeeAssessmentModal from "../components/FeeAssessmentModal";
import PaymentVerificationModal from "../components/PaymentVerificationModal";

// There is deliberately no email/SMS notification in this system — this worklist
// plus the tab badge counts (from stats()) are the entire mechanism by which the
// Treasurer learns work is waiting.
const BUCKETS = [
  { key: "issuance", label: "Issuance", statKey: "pending_issuance" },
  { key: "payment", label: "Payment", statKey: "pending_payment" },
  { key: "receipts", label: "Receipts", statKey: "receipts_submitted" },
];

export default function TreasuryWorklist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredStaffUser());
  const [bucket, setBucket] = useState("issuance");
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessTarget, setAssessTarget] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [listRes, statsRes] = await Promise.all([
        fetchTreasuryWorklist(bucket),
        fetchServiceRequestStats(),
      ]);
      setRequests(listRes.data.data);
      setStats(statsRes.data.data);
    } catch {
      setError("Couldn't load the worklist. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      navigate("/staff/login");
      return;
    }
    verifyStaffSession()
      .then((freshUser) => {
        setUser(freshUser);
        if (freshUser.role !== "admin" && freshUser.role !== "treasurer") {
          navigate("/staff/dashboard");
        }
      })
      .catch(() => {
        staffLogout();
        navigate("/staff/login");
      });
  }, [navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) loadData();
  }, [user, loadData]);

  const handleLogout = async () => {
    await staffLogout();
    navigate("/staff/login");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <button
            onClick={() => navigate("/staff/dashboard")}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-heading)" }}>
            Treasury Worklist
          </h1>
          <p className="text-sm text-muted-foreground">{user?.name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {BUCKETS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBucket(b.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
              bucket === b.key
                ? "bg-primary text-white border-primary"
                : "bg-card border-border text-foreground hover:bg-secondary/40"
            }`}
          >
            {b.label}
            {stats && stats[b.statKey] != null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${bucket === b.key ? "bg-white/20" : "bg-secondary"}`}>
                {stats[b.statKey]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Reference", "Resident", "Service", "Amount", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
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
                <tr><td colSpan={6} className="text-center text-muted-foreground py-12 text-sm">Nothing waiting in this queue.</td></tr>
              )}
              {!loading && !error && requests.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-primary font-semibold whitespace-nowrap" style={{ fontFamily: "var(--font-mono)" }}>
                    {r.reference_code}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{r.resident_name}</div>
                    <div className="text-xs text-muted-foreground">{r.resident_phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{r.service?.name}</div>
                    <div className="text-xs text-muted-foreground">{r.department?.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                    {r.order_of_payment ? `₱${r.order_of_payment.total_amount.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${getStatusInfo(r.status).color}`}>
                      {getStatusInfo(r.status).label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {bucket === "issuance" && r.can?.issue_order_of_payment && (
                      <button
                        onClick={() => setAssessTarget(r)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-card text-xs font-medium text-primary hover:bg-primary/10 border-primary/40 transition-colors"
                      >
                        <Receipt size={13} /> Review
                      </button>
                    )}
                    {(bucket === "payment" || bucket === "receipts") && r.can?.confirm_payment && (
                      <button
                        onClick={() => setPaymentTarget(r)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-card text-xs font-medium text-blue-700 hover:bg-blue-50 border-blue-200 transition-colors"
                      >
                        <CreditCard size={13} /> Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assessTarget && (
        <FeeAssessmentModal request={assessTarget} onClose={() => setAssessTarget(null)} onSuccess={loadData} />
      )}
      {paymentTarget && (
        <PaymentVerificationModal request={paymentTarget} onClose={() => setPaymentTarget(null)} onSuccess={loadData} />
      )}
    </div>
  );
}
