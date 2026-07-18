import { useParams, useNavigate } from "react-router-dom";
import { getBookingByReference } from "../data/bookings";

export default function ClaimTicket() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const booking = getBookingByReference(reference);

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Booking not found.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-accent hover:underline text-sm">
          Back to home
        </button>
      </div>
    );
  }

  const date = new Date(booking.date);

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
          You're booked!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Save this ticket or note your reference code.</p>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-lg">
        <div className="bg-primary px-6 py-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
            {booking.departmentName}
          </div>
          <div className="text-lg text-white font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            {booking.serviceName}
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
            <div className="text-sm text-foreground">{booking.fullName}</div>
          </div>
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
          <div className="text-2xl font-semibold text-primary tracking-wider" style={{ fontFamily: "var(--font-mono)" }}>
            {booking.reference}
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

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate("/my-bookings")}
          className="flex-1 border border-border rounded py-2.5 text-sm font-medium hover:bg-card transition-colors"
        >
          View My Bookings
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 bg-primary text-white rounded py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}