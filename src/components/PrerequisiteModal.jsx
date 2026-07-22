import { useNavigate } from "react-router-dom";
import { X, AlertTriangle } from "lucide-react";

export default function PrerequisiteModal({ requirement, onClose }) {
  const navigate = useNavigate();
  if (!requirement) return null;

  const prereq = requirement.prerequisite_service;

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        <h3 className="font-bold text-foreground mb-1.5" style={{ fontFamily: "var(--font-heading)" }}>
          You'll need this document first
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          This service requires <strong className="text-foreground">{prereq.name}</strong> from{" "}
          {prereq.department_name}. You can apply for it separately before continuing here.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-border rounded-xl py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
          >
            I'll get it later
          </button>
          <button
            onClick={() => navigate(`/services/${prereq.slug}`)}
            className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}