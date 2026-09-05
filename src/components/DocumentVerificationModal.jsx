import { useState } from "react";
import { X, FileText, ExternalLink, Check } from "lucide-react";
import { verifyServiceRequestDocument } from "../api/staff";

function DocumentRow({ document, onChanged }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Verify/reject update the DB immediately, but the parent's `request` prop is a
  // point-in-time snapshot that doesn't get refreshed in place — onChanged() triggers
  // a background refetch, but this modal keeps rendering the stale object until it's
  // closed and reopened. Track the outcome locally so the buttons react right away.
  const [localOverride, setLocalOverride] = useState(null);

  const status = localOverride?.status ?? document.status ?? "pending";
  const rejectionReason = localOverride?.rejection_reason ?? document.rejection_reason;
  const isImage = document.mime_type?.startsWith("image/");

  const handleVerify = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      await verifyServiceRequestDocument(document.id, { status: "verified" });
      setLocalOverride({ status: "verified" });
      onChanged();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't verify document.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (reason.trim().length < 3) {
      setErrorMessage("Enter a reason of at least 3 characters.");
      return;
    }
    setSubmitting(true);
    setErrorMessage("");
    try {
      await verifyServiceRequestDocument(document.id, { status: "rejected", rejection_reason: reason.trim() });
      setLocalOverride({ status: "rejected", rejection_reason: reason.trim() });
      onChanged();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't reject document.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {document.requirement?.requirement_text || "Document"}
          </div>
          <div className="text-xs text-muted-foreground truncate">{document.original_filename}</div>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap flex-shrink-0 ${
            status === "verified"
              ? "bg-green-50 text-green-800 border-green-200"
              : status === "rejected"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-yellow-50 text-yellow-800 border-yellow-200"
          }`}
        >
          {status === "verified" ? "Verified" : status === "rejected" ? "Rejected" : "Pending Review"}
        </span>
      </div>

      {document.file_url && (
        isImage ? (
          <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="block relative group mb-2">
            <img
              src={document.file_url}
              alt={document.original_filename}
              className="w-full max-h-48 object-contain rounded-lg border border-border bg-secondary/40"
            />
          </a>
        ) : (
          <a
            href={document.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors mb-2"
          >
            <FileText size={15} className="text-primary flex-shrink-0" />
            View file
            <ExternalLink size={11} className="ml-auto text-muted-foreground flex-shrink-0" />
          </a>
        )
      )}

      {status === "pending" && !rejecting && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleVerify}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1 bg-accent text-white rounded-lg py-1.5 text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Check size={13} /> Verify
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1 border border-destructive text-destructive rounded-lg py-1.5 text-xs font-semibold hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <X size={13} /> Reject
          </button>
        </div>
      )}

      {rejecting && (
        <div>
          <textarea
            autoFocus
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection"
            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRejecting(false);
                setReason("");
                setErrorMessage("");
              }}
              disabled={submitting}
              className="flex-1 border border-border rounded-lg py-1.5 text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={submitting}
              className="flex-1 bg-destructive text-white rounded-lg py-1.5 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Rejecting…" : "Confirm Reject"}
            </button>
          </div>
        </div>
      )}

      {status !== "pending" && rejectionReason && (
        <p className="text-xs text-destructive mt-1">Reason: {rejectionReason}</p>
      )}

      {errorMessage && <p className="text-xs text-destructive mt-1">{errorMessage}</p>}
    </div>
  );
}

export default function DocumentVerificationModal({ request, onClose, onSuccess }) {
  if (!request) return null;

  const documents = request.documents || [];

  const handleChanged = () => {
    onSuccess();
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
              Uploaded Documents
            </h2>
            <p className="text-xs text-white/80 mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
              {request.reference_code} · {request.resident_name}
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No documents uploaded for this request.
            </p>
          ) : (
            documents.map((document) => (
              <DocumentRow key={document.id} document={document} onChanged={handleChanged} />
            ))
          )}
        </div>

        <div className="p-5 pt-0 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
