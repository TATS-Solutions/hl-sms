import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, FileText, CheckSquare, Square, Truck } from "lucide-react";
import { useServiceDetail } from "../hooks/useServiceDetail";
import StepIndicator from "../components/StepIndicator";

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: service, isLoading, isError } = useServiceDetail(slug);
  const [checkedReqs, setCheckedReqs] = useState({});

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

  const feeLabel = service.fixed_fee > 0
    ? `₱${service.fixed_fee}`
    : service.has_variable_fee
    ? "Variable — assessed by staff"
    : "No fee";

  const mandatoryRequirements = service.requirements.filter((req) => req.is_mandatory);
  const allMandatoryChecked = mandatoryRequirements.every((req) => checkedReqs[req.id]);

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
                Requirements — check off what you already have
              </div>
              <div className="space-y-2">
                {service.requirements.map((req) => (
                  <div key={req.id} className="rounded-lg p-2.5 hover:bg-secondary transition-colors">
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
        onClick={() => navigate(`/book/${service.slug}`)}
        disabled={!allMandatoryChecked}
        title={!allMandatoryChecked ? "Check off all required items marked with * before continuing" : undefined}
        className="w-full bg-primary text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
      >
        Continue to Application <ArrowRight size={16} />
      </button>
      {!allMandatoryChecked && (
        <p className="text-xs text-destructive text-center mt-2">
          Check off all required items above before continuing.
        </p>
      )}
    </div>
  );
}