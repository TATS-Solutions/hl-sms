import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, FileText, CheckSquare, Square, Truck } from "lucide-react";
import { useServiceDetail } from "../hooks/useServiceDetail";
import StepIndicator from "../components/StepIndicator";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: service, isLoading, isError } = useServiceDetail(slug);
  const [checkedReqs, setCheckedReqs] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground text-sm">
        Loading service…
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Service not found.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-accent hover:underline text-sm">
          Back to services
        </button>
      </div>
    );
  }

  const toggleReq = (req) => {
    setCheckedReqs((prev) => ({ ...prev, [req.id]: !prev[req.id] }));
  };

  const handleFileChange = (req, e) => {
    const selected = e.target.files?.[0] ?? null;
    setFileErrors((prev) => ({ ...prev, [req.id]: "" }));
    if (!selected) {
      setUploadedFiles((prev) => {
        const next = { ...prev };
        delete next[req.id];
        return next;
      });
      return;
    }
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFileErrors((prev) => ({ ...prev, [req.id]: "Please upload a JPG, PNG, WEBP, or PDF file." }));
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFileErrors((prev) => ({ ...prev, [req.id]: "File is too large. Max size is 5MB." }));
      return;
    }
    setUploadedFiles((prev) => ({ ...prev, [req.id]: selected }));
  };

  const isRequirementSatisfied = (req) =>
    req.requires_upload ? Boolean(uploadedFiles[req.id]) : Boolean(checkedReqs[req.id]);

  const feeLabel = service.fixed_fee > 0
    ? `₱${service.fixed_fee}`
    : service.has_variable_fee
    ? "Variable — assessed by staff"
    : "No fee";

  const mandatoryRequirements = service.requirements.filter((req) => req.is_mandatory);
  const allMandatorySatisfied = mandatoryRequirements.every(isRequirementSatisfied);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-accent hover:underline mb-6"
      >
        <ArrowLeft size={14} /> Back to services
      </button>

      <StepIndicator currentStep={1} />

      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6 shadow-sm">
        <div className="bg-primary px-6 py-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5">
            {service.department_name}
          </div>
          <h1
            className="text-2xl text-white font-semibold leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {service.name}
          </h1>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
              About this service
            </div>
            <p className="text-foreground text-sm leading-relaxed">{service.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Fee
              </div>
              <p className="text-sm text-foreground font-semibold">{feeLabel}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Type
              </div>
              <p className="text-sm text-foreground">
                {service.service_type === "appointment_booking" ? "Appointment booking" : "Digital form application"}
              </p>
            </div>
          </div>

          {service.is_deliver && (
            <div className="flex items-center gap-2 text-accent bg-accent/10 rounded-lg px-3 py-2 text-sm">
              <Truck size={15} className="flex-shrink-0" />
              <span>This service supports delivery in addition to in-person processing.</span>
            </div>
          )}

          {service.requirements.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Requirements — upload or check off what you already have
              </div>
              <div className="space-y-2">
                {service.requirements.map((req) => (
                  <div key={req.id} className="rounded-lg p-2.5 hover:bg-secondary transition-colors">
                    {req.requires_upload ? (
                      <div className="flex items-start gap-2.5">
                        {uploadedFiles[req.id] ? (
                          <CheckSquare size={17} className="text-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square size={17} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground leading-relaxed">
                            {req.requirement_text}
                            {req.is_mandatory && <span className="text-destructive ml-1">*</span>}
                          </span>
                          <div className="mt-1.5 border border-dashed border-border rounded-lg px-3 py-2 bg-input-background">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              onChange={(e) => handleFileChange(req, e)}
                              className="w-full text-xs text-muted-foreground cursor-pointer file:mr-3 file:py-1.5 file:px-3.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90"
                            />
                          </div>
                          {uploadedFiles[req.id] && (
                            <p className="text-xs text-accent mt-1">Selected: {uploadedFiles[req.id].name}</p>
                          )}
                          {fileErrors[req.id] && <p className="text-xs text-destructive mt-1">{fileErrors[req.id]}</p>}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleReq(req)}
                        className="w-full flex items-start gap-2.5 text-left"
                      >
                        {checkedReqs[req.id] ? (
                          <CheckSquare size={17} className="text-accent flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square size={17} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm text-foreground leading-relaxed">
                          {req.requirement_text}
                          {req.is_mandatory && <span className="text-destructive ml-1">*</span>}
                        </span>
                      </button>
                    )}
                    {req.prerequisite_service && (
                      <a
                        href={`/services/${req.prerequisite_service.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-[26px] mt-1 text-xs text-accent hover:underline flex items-center gap-1 w-fit"
                      >
                        Don't have it? Apply for {req.prerequisite_service.name} <ArrowRight size={11} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground border-t border-border pt-4">
            <Building2 size={13} />
            <span className="text-sm">{service.department_name}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/book/${service.slug}`, { state: { requirementFiles: uploadedFiles } })}
        disabled={!allMandatorySatisfied}
        title={!allMandatorySatisfied ? "Upload or check off all required items marked with * before continuing" : undefined}
        className="w-full bg-primary text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
      >
        Continue to Application <ArrowRight size={16} />
      </button>
      {!allMandatorySatisfied && (
        <p className="text-xs text-destructive text-center mt-2">
          Upload or check off all required items above before continuing.
        </p>
      )}
    </div>
  );
}