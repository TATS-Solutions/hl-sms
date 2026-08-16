import { useState } from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import { markOrderOfPaymentPaid } from "../api/staff";

const PAYMENT_CHANNELS = [
  { value: "counter", label: "Counter (Cash)" },
  { value: "gcash", label: "GCash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
];

export default function PaymentVerificationModal({ request, onClose, onSuccess }) {
  const [orNumber, setOrNumber] = useState("");
  const [paymentChannel, setPaymentChannel] = useState("counter");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!request) return null;

  const orderOfPayment = request.order_of_payment;

  const handleSubmit = async () => {
    if (!orNumber.trim()) {
      setErrorMessage("Enter the official receipt (OR) number.");
      return;
    }
    setErrorMessage("");
    setSubmitting(true);
    try {
      await markOrderOfPaymentPaid(orderOfPayment.id, {
        or_number: orNumber.trim(),
        payment_channel: paymentChannel,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary text-white px-5 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Record Payment
            </h2>
            <p className="text-xs text-white/80 mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
              {request.reference_code} · {request.resident_name}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {orderOfPayment && (
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Amount Due</span>
              <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                ₱{orderOfPayment.total_amount.toFixed(2)}
              </span>
            </div>
          )}

          {orderOfPayment?.payment_receipt_url && (
            <div className="mb-4 pb-4 border-b border-border">
              <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Submitted Receipt
              </label>
              {orderOfPayment.payment_receipt_url.toLowerCase().endsWith(".pdf") ? (
                <a
                  href={orderOfPayment.payment_receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <FileText size={16} className="text-primary flex-shrink-0" />
                  View submitted PDF receipt
                  <ExternalLink size={12} className="ml-auto text-muted-foreground flex-shrink-0" />
                </a>
              ) : (
                <a
                  href={orderOfPayment.payment_receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative group"
                >
                  <img
                    src={orderOfPayment.payment_receipt_url}
                    alt="Submitted payment receipt"
                    className="w-full max-h-56 object-contain rounded-lg border border-border bg-secondary/40"
                  />
                  <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={10} /> View full size
                  </span>
                </a>
              )}
            </div>
          )}

          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            OR Number
          </label>
          <input
            type="text"
            autoFocus
            value={orNumber}
            onChange={(e) => setOrNumber(e.target.value)}
            placeholder="e.g. 2026-0001234"
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />

          <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1 mt-4">
            Payment Channel
          </label>
          <select
            value={paymentChannel}
            onChange={(e) => setPaymentChannel(e.target.value)}
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {PAYMENT_CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {errorMessage && (
            <p className="text-xs text-destructive mt-3">{errorMessage}</p>
          )}
        </div>

        <div className="flex gap-2 p-5 pt-0 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Recording…" : "Record Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
