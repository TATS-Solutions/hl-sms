import { useState } from "react";
import { Search } from "lucide-react";
import { lookupServiceRequest } from "../api/serviceRequests";
import { getStatusInfo } from "../data/statusMap";

export default function MyBookings() {
  const [reference, setReference] = useState("");
  const [mobile, setMobile] = useState("");
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setBooking(null);
    try {
      const response = await lookupServiceRequest(reference.trim(), mobile.trim());
      setBooking(response.data.data);
      setStatus("success");
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many lookup attempts. Please wait 1 minute.");
      } else if (err.response?.status === 404) {
        setError("No booking found. Check your reference code and mobile number.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setStatus("error");
    }
  };

  const statusInfo = booking ? getStatusInfo(booking.status) : null;

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        My Bookings
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Look up your application using your reference code and mobile number.
      </p>

      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Reference Code
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="HLG-20260721-AL0KMS"
            className="w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
            Mobile Number
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="09171234567"
            className="w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={!reference.trim() || !mobile.trim() || status === "loading"}
          className="w-full bg-primary text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={15} /> {status === "loading" ? "Searching…" : "Find Booking"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-destructive text-sm text-center mb-4">{error}</p>
      )}

      {booking && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="bg-primary px-5 py-4 flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
                {booking.department_name}
              </div>
              <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {booking.service_name}
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{statusInfo.note}</p>

            <div className="grid grid-cols-2 gap-4">
              {booking.scheduled_date && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Date</div>
                  <div className="text-sm text-foreground">
                    {new Date(booking.scheduled_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                </div>
              )}
              {booking.scheduled_time && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Time</div>
                  <div className="text-sm text-foreground">{booking.scheduled_time}</div>
                </div>
              )}
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Reference</div>
                <div className="text-sm text-primary break-all" style={{ fontFamily: "var(--font-mono)" }}>
                  {booking.reference_code}
                </div>
              </div>
            </div>

            {booking.order_of_payment && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Fee Assessment
                </div>
                <div className="space-y-1.5">
                  {booking.order_of_payment.items.map((item) => (
                    <div key={item.fee_name} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.fee_name}</span>
                      <span className="text-foreground">₱{item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-border">
                    <span>Total</span>
                    <span>₱{booking.order_of_payment.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}