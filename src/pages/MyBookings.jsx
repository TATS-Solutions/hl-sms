import { useState } from "react";
import { Search, Upload } from "lucide-react";
import { lookupServiceRequest, replaceDocument } from "../api/serviceRequests";
import { getStatusInfo } from "../data/statusMap";
import PaymentUpload from "../components/PaymentUpload";

const ACCEPTED_DOC_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function RejectedDocumentCard({ document, referenceCode, residentPhone, onUploaded }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null;
    setErrorMessage("");
    if (selected && !ACCEPTED_DOC_TYPES.includes(selected.type)) {
      setErrorMessage("Please upload a JPG, PNG, WEBP, or PDF file.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Choose a replacement file first.");
      return;
    }
    setErrorMessage("");
    setSubmitting(true);
    try {
      await replaceDocument(referenceCode, document.id, residentPhone, file);
      setFile(null);
      onUploaded();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't upload replacement document.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-3">
      <div className="text-sm font-medium text-foreground mb-1">
        {document.requirement?.requirement_text || "Document"}
      </div>
      <p className="text-xs text-destructive mb-2">Rejected: {document.rejection_reason}</p>
      <div className="flex items-center gap-2 border border-dashed border-border rounded-lg px-3 py-2 bg-input-background mb-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={submitting}
          className="flex-1 text-xs text-muted-foreground cursor-pointer file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90 disabled:opacity-50"
        />
      </div>
      {errorMessage && <p className="text-xs text-destructive mb-2">{errorMessage}</p>}
      <button
        type="button"
        onClick={handleUpload}
        disabled={submitting || !file}
        className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-2 text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Upload size={13} /> {submitting ? "Uploading…" : "Upload Replacement"}
      </button>
    </div>
  );
}

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

  const refreshBooking = async () => {
    try {
      const response = await lookupServiceRequest(reference.trim(), mobile.trim());
      setBooking(response.data.data);
    } catch {
      // silently ignore — the receipt upload itself already succeeded
    }
  };

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
                {booking.department?.name}
              </div>
              <div className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {booking.service?.name}
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold whitespace-nowrap ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="px-5 py-4">
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{statusInfo.note}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Booked By</div>
                <div className="text-sm text-foreground">{booking.resident_name}</div>
              </div>
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
                {booking.order_of_payment.paid_at && (
                  <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    <span>
                      Paid {new Date(booking.order_of_payment.paid_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {booking.order_of_payment.or_number && (
                      <span style={{ fontFamily: "var(--font-mono)" }}>OR# {booking.order_of_payment.or_number}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {booking.status === "pending_payment" && booking.order_of_payment && (
              <div className="mt-4 pt-4 border-t border-border">
                <PaymentUpload
                  referenceCode={booking.reference_code}
                  residentPhone={mobile.trim()}
                  orderOfPayment={booking.order_of_payment}
                  onUploaded={refreshBooking}
                />
              </div>
            )}

            {booking.documents?.some((d) => d.status === "rejected") && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Documents Needing Attention
                </div>
                {booking.documents
                  .filter((d) => d.status === "rejected")
                  .map((d) => (
                    <RejectedDocumentCard
                      key={d.id}
                      document={d}
                      referenceCode={booking.reference_code}
                      residentPhone={mobile.trim()}
                      onUploaded={refreshBooking}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}