import { useState } from "react";
import { Search } from "lucide-react";
import { findBooking, cancelBooking } from "../data/bookings";
import StatusBadge from "../components/StatusBadge";

export default function MyBookings() {
  const [reference, setReference] = useState("");
  const [mobile, setMobile] = useState("");
  const [booking, setBooking] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const found = findBooking(reference, mobile);
    setBooking(found || null);
    setSearched(true);
    setError(found ? "" : "No booking found. Check your reference code and mobile number.");
  };

  const handleCancel = () => {
    cancelBooking(booking.reference);
    setBooking({ ...booking, status: "cancelled" });
  };

  const date = booking ? new Date(booking.date) : null;

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-xl font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>
        My Bookings
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Look up your appointment using your reference code and mobile number.
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
            placeholder="HLG-DEMO1"
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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
            className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={!reference.trim() || !mobile.trim()}
          className="w-full bg-primary text-white rounded py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search size={15} /> Find Booking
        </button>
      </form>

      {searched && error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}

      {booking && (
        <div className="bg-card rounded border border-border overflow-hidden">
          <div className="bg-primary px-5 py-4 flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
                {booking.departmentName}
              </div>
              <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {booking.serviceName}
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="px-5 py-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Date</div>
              <div className="text-sm text-foreground">
                {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Time</div>
              <div className="text-sm text-foreground">{booking.slot}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Reference</div>
              <div className="text-sm text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                {booking.reference}
              </div>
            </div>
          </div>

          {booking.status === "upcoming" && (
            <div className="px-5 pb-4">
              <button
                onClick={handleCancel}
                className="w-full border border-destructive text-destructive rounded py-2 text-sm font-medium hover:bg-destructive/5 transition-colors"
              >
                Cancel Appointment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}