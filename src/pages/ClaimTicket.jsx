import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Link2, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ClaimTicket() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const booking = location.state;

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Ticket details aren't available. This page only works right after submitting an application —
          use My Bookings to look up an existing one instead.
        </p>
        <button onClick={() => navigate("/my-bookings")} className="mt-4 text-accent hover:underline text-sm">
          Go to My Bookings
        </button>
      </div>
    );
  }

  const date = new Date(booking.date);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(booking.trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — silently ignore, copy button just won't confirm
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          Application submitted!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Save this ticket or note your reference code.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        <div className="bg-primary px-6 py-5 flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
              {booking.departmentName}
            </div>
            <div className="text-lg text-white font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
              {booking.serviceName}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-4">
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
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Name</div>
            <div className="text-sm text-foreground">{booking.residentName}</div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <p className="text-sm text-foreground bg-secondary/40 border border-border rounded-xl px-4 py-3">
            Your application has been received. Check My Bookings anytime to track its status and fee assessment.
          </p>
        </div>

        {/* Perforation */}
        <div className="relative flex items-center">
          <div className="absolute -left-3 w-6 h-6 rounded-full bg-background" />
          <div className="flex-1 border-t-2 border-dashed border-border mx-3" />
          <div className="absolute -right-3 w-6 h-6 rounded-full bg-background" />
        </div>

        <div className="px-6 py-5 text-center">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Reference Code
          </div>
          <div className="text-xl font-semibold text-primary tracking-wide break-all" style={{ fontFamily: "var(--font-mono)" }}>
            {reference}
          </div>
        </div>

        <div
          className="h-3"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-background) 3px, transparent 3px)",
            backgroundSize: "12px 12px",
            backgroundPosition: "top",
          }}
        />
      </div>

      {booking.trackingUrl && (
        <button
          onClick={handleCopyLink}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-card transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-accent" /> Link copied
            </>
          ) : (
            <>
              <Link2 size={14} /> Copy tracking link
            </>
          )}
        </button>
      )}

      <div className="flex gap-3 mt-3">
        <button
          onClick={() => navigate("/my-bookings")}
          className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-card transition-colors"
        >
          View My Bookings
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}