import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { assessServiceRequestFees } from "../api/staff";

const emptyItem = () => ({ fee_name: "", amount: "" });

export default function FeeAssessmentModal({ request, onClose, onSuccess }) {
  const [items, setItems] = useState([emptyItem()]);
  const [penaltyAmount, setPenaltyAmount] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!request) return null;

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const parsedPenalty = parseFloat(penaltyAmount) || 0;
  const itemsTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const grandTotal = itemsTotal + parsedPenalty;

  const validate = () => {
    if (items.length === 0) return "Add at least one fee item.";
    for (const item of items) {
      if (!item.fee_name.trim()) return "Every fee item needs a name.";
      const amount = parseFloat(item.amount);
      if (!Number.isFinite(amount) || amount <= 0) return "Every fee item needs an amount greater than 0.";
    }
    if (parsedPenalty < 0) return "Penalty amount can't be negative.";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setErrorMessage("");
    setSubmitting(true);
    try {
      await assessServiceRequestFees(request.id, {
        penalty_amount: parsedPenalty,
        items: items.map((item) => ({
          fee_name: item.fee_name.trim(),
          amount: parseFloat(item.amount),
        })),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't submit fee assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary text-white px-5 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Assess Fees
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
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Fee Items
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Fee name"
                  value={item.fee_name}
                  onChange={(e) => updateItem(index, "fee_name", e.target.value)}
                  className="flex-1 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={item.amount}
                  onChange={(e) => updateItem(index, "amount", e.target.value)}
                  className="w-28 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:hover:text-muted-foreground flex-shrink-0"
                  aria-label="Remove fee item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
          >
            <Plus size={14} /> Add fee item
          </button>

          <div className="mt-4 pt-4 border-t border-border">
            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Penalty Amount (optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(e.target.value)}
              className="w-32 bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>
              ₱{grandTotal.toFixed(2)}
            </span>
          </div>

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
            {submitting ? "Submitting…" : "Submit Assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}
