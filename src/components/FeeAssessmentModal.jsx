import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { proposeAssessment, issueOrderOfPayment, voidOrderOfPayment } from "../api/staff";

const emptyItem = () => ({ fee_name: "", amount: "" });

const itemsFromFeeSchedule = (feeItems) =>
  feeItems && feeItems.length > 0
    ? feeItems.map((fi) => ({ fee_name: fi.fee_name, amount: String(fi.amount) }))
    : [emptyItem()];

const itemsFromOrder = (order) =>
  order?.items?.length > 0
    ? order.items.map((i) => ({ fee_name: i.fee_name, amount: String(i.amount) }))
    : [emptyItem()];

function FeeItemsEditor({ items, setItems, penaltyAmount, setPenaltyAmount }) {
  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Fee Items</div>
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
    </div>
  );
}

export default function FeeAssessmentModal({ request, onClose, onSuccess }) {
  const can = request?.can || {};
  const order = request?.order_of_payment || null;
  // Issue takes priority: an admin has both rights simultaneously once a proposal
  // exists (they're department AND treasury), and reviewing/approving what's already
  // proposed is the relevant next step, not re-proposing from scratch.
  const mode = can.issue_order_of_payment ? "issue" : can.propose_assessment ? "propose" : "readonly";

  const [items, setItems] = useState(() =>
    // A proposal may already exist if this is a re-propose/amend (department editing
    // their own not-yet-issued proposal) — pre-fill from it rather than resetting to
    // the Charter fee schedule, which would silently discard their prior numbers.
    order ? itemsFromOrder(order) : itemsFromFeeSchedule(request?.service?.fee_items)
  );
  const [penaltyAmount, setPenaltyAmount] = useState(() => String(order?.penalty_amount ?? 0));
  const [assessmentBasis, setAssessmentBasis] = useState(() => order?.assessment_basis || "");
  const [amending, setAmending] = useState(false);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [voiding, setVoiding] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!request) return null;

  const parsedPenalty = parseFloat(penaltyAmount) || 0;
  const itemsTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const grandTotal = itemsTotal + parsedPenalty;

  const validateItems = () => {
    if (items.length === 0) return "Add at least one fee item.";
    for (const item of items) {
      if (!item.fee_name.trim()) return "Every fee item needs a name.";
      const amount = parseFloat(item.amount);
      if (!Number.isFinite(amount) || amount <= 0) return "Every fee item needs an amount greater than 0.";
    }
    if (parsedPenalty < 0) return "Penalty amount can't be negative.";
    return "";
  };

  const handlePropose = async () => {
    const itemsError = validateItems();
    if (itemsError) {
      setErrorMessage(itemsError);
      return;
    }
    if (assessmentBasis.trim().length < 10) {
      setErrorMessage("State the basis for this assessment (inspection findings, measurements, or the fee schedule applied) — at least 10 characters.");
      return;
    }
    setErrorMessage("");
    setSubmitting(true);
    try {
      await proposeAssessment(request.id, {
        assessment_basis: assessmentBasis.trim(),
        penalty_amount: parsedPenalty,
        items: items.map((item) => ({ fee_name: item.fee_name.trim(), amount: parseFloat(item.amount) })),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssue = async () => {
    if (amending) {
      const itemsError = validateItems();
      if (itemsError) {
        setErrorMessage(itemsError);
        return;
      }
      if (adjustmentNote.trim().length < 5) {
        setErrorMessage("Explain why the department's proposed amounts are being changed.");
        return;
      }
    }
    setErrorMessage("");
    setSubmitting(true);
    try {
      const payload = amending
        ? {
            items: items.map((item) => ({ fee_name: item.fee_name.trim(), amount: parseFloat(item.amount) })),
            penalty_amount: parsedPenalty,
            adjustment_note: adjustmentNote.trim(),
          }
        : {};
      await issueOrderOfPayment(request.id, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't issue the Order of Payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoid = async () => {
    if (voidReason.trim().length < 5) {
      setErrorMessage("Enter a reason of at least 5 characters.");
      return;
    }
    setErrorMessage("");
    setSubmitting(true);
    try {
      await voidOrderOfPayment(order.id, { reason: voidReason.trim() });
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Couldn't void this order.");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "propose" ? "Assess Fees" : mode === "issue" ? "Issue Order of Payment" : "Order of Payment";

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary text-white px-5 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {title}
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
          {mode === "propose" && (
            <>
              <FeeItemsEditor
                items={items}
                setItems={setItems}
                penaltyAmount={penaltyAmount}
                setPenaltyAmount={setPenaltyAmount}
              />
              <div className="mt-4 pt-4 border-t border-border">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Assessment Basis <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={2}
                  value={assessmentBasis}
                  onChange={(e) => setAssessmentBasis(e.target.value)}
                  placeholder="e.g. Ocular inspection: 120 sqm residential structure, standard zone."
                  className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  What the Treasurer reads before issuing, and what an audit reads later.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                  ₱{grandTotal.toFixed(2)}
                </span>
              </div>
            </>
          )}

          {mode === "issue" && !amending && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Department's Assessment Basis
              </div>
              <p className="text-sm text-foreground bg-secondary/40 border border-border rounded-lg px-3 py-2 mb-4">
                {order?.assessment_basis || "—"}
              </p>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Proposed Fee Items</div>
              <div className="space-y-1.5">
                {(order?.items || []).map((item) => (
                  <div key={item.fee_name} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.fee_name}</span>
                    <span className="text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                      ₱{item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {order?.penalty_amount > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Penalty</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>₱{order.penalty_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-border font-semibold">
                  <span className="text-sm text-foreground">Total</span>
                  <span className="text-lg text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                    ₱{order?.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAmending(true)}
                className="mt-4 text-xs font-semibold text-primary hover:text-primary/80"
              >
                Amend the proposed amounts instead
              </button>
            </div>
          )}

          {mode === "issue" && amending && (
            <>
              <FeeItemsEditor
                items={items}
                setItems={setItems}
                penaltyAmount={penaltyAmount}
                setPenaltyAmount={setPenaltyAmount}
              />
              <div className="mt-4 pt-4 border-t border-border">
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Adjustment Note <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={2}
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  placeholder="e.g. Floor area was under-measured by the department."
                  className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Shown to the department when they review why their proposal changed.</p>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                  ₱{grandTotal.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAmending(false)}
                className="mt-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Discard changes, issue as proposed
              </button>
            </>
          )}

          {mode === "readonly" && (
            <div>
              {order?.assessment_basis && (
                <>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Assessment Basis</div>
                  <p className="text-sm text-foreground bg-secondary/40 border border-border rounded-lg px-3 py-2 mb-4">
                    {order.assessment_basis}
                  </p>
                </>
              )}
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Fee Items</div>
              <div className="space-y-1.5">
                {(order?.items || []).map((item) => (
                  <div key={item.fee_name} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.fee_name}</span>
                    <span className="text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                      ₱{item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1.5 border-t border-border font-semibold">
                  <span className="text-sm text-foreground">Total</span>
                  <span className="text-lg text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                    ₱{order?.total_amount?.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Issued by the Treasurer's Office — this office can view but not change it.
              </p>
            </div>
          )}

          {(mode === "issue" || mode === "readonly") && can.void_order_of_payment && (
            <div className="mt-4 pt-4 border-t border-border">
              {!voiding ? (
                <button
                  type="button"
                  onClick={() => setVoiding(true)}
                  className="text-xs font-semibold text-destructive hover:text-destructive/80"
                >
                  Void this order
                </button>
              ) : (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Reason for voiding <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="e.g. Amount does not match the site inspection report."
                    className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/40 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => { setVoiding(false); setVoidReason(""); }}
                      disabled={submitting}
                      className="flex-1 border border-border rounded-lg py-1.5 text-xs font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleVoid}
                      disabled={submitting}
                      className="flex-1 bg-destructive text-white rounded-lg py-1.5 text-xs font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Voiding…" : "Confirm Void"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorMessage && <p className="text-xs text-destructive mt-3">{errorMessage}</p>}
        </div>

        {mode !== "readonly" && !voiding && (
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
              onClick={mode === "propose" ? handlePropose : handleIssue}
              disabled={submitting}
              className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Submitting…"
                : mode === "propose"
                ? "Submit Assessment"
                : amending
                ? "Issue with Changes"
                : "Issue as Proposed"}
            </button>
          </div>
        )}

        {mode === "readonly" && !voiding && (
          <div className="p-5 pt-0 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
