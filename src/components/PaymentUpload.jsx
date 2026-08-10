import { useState } from "react";
import { Upload, CheckCircle2, Clock } from "lucide-react";
import { uploadPaymentReceipt } from "../api/serviceRequests";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function PaymentUpload({ referenceCode, residentPhone, orderOfPayment, onUploaded }) {
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const receiptStatus = orderOfPayment?.payment_receipt_status ?? "none";

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] ?? null;
    setErrorMessage("");
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setErrorMessage("Please upload a JPG, PNG, WEBP, or PDF file.");
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setErrorMessage("File is too large. Max size is 5MB.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("Please choose a receipt file first.");
      return;
    }
    setErrorMessage("");
    setSubmitting(true);
    try {
      await uploadPaymentReceipt(referenceCode, residentPhone, file);
      setFile(null);
      onUploaded?.();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't upload receipt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (receiptStatus === "verified") {
    return (
      <div className="px-6 pb-5">
        <div className="flex items-center gap-2 text-sm text-foreground bg-secondary/40 border border-border rounded-xl px-4 py-3">
          <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
          Payment verified by staff.
        </div>
      </div>
    );
  }

  if (receiptStatus === "submitted") {
    return (
      <div className="px-6 pb-5">
        <div className="flex items-center gap-2 text-sm text-foreground bg-secondary/40 border border-border rounded-xl px-4 py-3">
          <Clock size={16} className="text-muted-foreground flex-shrink-0" />
          Receipt submitted — awaiting staff verification.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Pay Online
      </div>
      {orderOfPayment?.qr_image_url ? (
        <div className="flex flex-col items-center bg-secondary/40 border border-border rounded-xl px-4 py-4 mb-3">
          <img
            src={orderOfPayment.qr_image_url}
            alt="Payment QR code"
            className="w-40 h-40 object-contain rounded-lg bg-white"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Scan to pay ₱{orderOfPayment.total_amount.toFixed(2)}
          </p>
        </div>
      ) : null}

      <label className="block text-xs text-muted-foreground mb-1.5">
        Upload your payment receipt
      </label>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={submitting}
          className="flex-1 text-xs text-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-secondary/60 file:text-foreground hover:file:bg-secondary disabled:opacity-50"
        />
      </div>

      {errorMessage && <p className="text-xs text-destructive mt-2">{errorMessage}</p>}

      <button
        type="button"
        onClick={handleUpload}
        disabled={submitting || !file}
        className="w-full mt-3 flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Upload size={14} /> {submitting ? "Uploading…" : "Upload Receipt"}
      </button>
    </div>
  );
}
