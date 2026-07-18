import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Clock } from "lucide-react";
import { SERVICES, CATEGORIES, getDept } from "../data/services";
import StepIndicator from "../components/StepIndicator";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = SERVICES.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Service not found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-accent hover:underline text-sm"
        >
          Back to services
        </button>
      </div>
    );
  }

  const department = getDept(service.deptId);
  const category = CATEGORIES.find((c) => c.id === service.catId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-accent hover:underline mb-6"
      >
        <ArrowLeft size={14} /> Back to services
      </button>

      <StepIndicator currentStep={1} />

      <div className="bg-card rounded border border-border overflow-hidden mb-6">
        <div className="bg-primary px-6 py-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1.5">
            {department.shortName} · {category?.label}
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
            <p className="text-foreground text-sm leading-relaxed">{service.desc}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                What to bring
              </div>
              <p className="text-sm text-foreground leading-relaxed">{service.bring}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Processing time
              </div>
              <p className="text-sm text-foreground flex items-center gap-1.5">
                <Clock size={12} className="text-accent flex-shrink-0" />
                {service.time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground border-t border-border pt-4">
            <Building2 size={13} />
            <span className="text-sm">{department.name}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/book/${service.id}`)}
        className="w-full bg-primary text-white rounded py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
      >
        Book an Appointment <ArrowRight size={16} />
      </button>
    </div>
  );
}