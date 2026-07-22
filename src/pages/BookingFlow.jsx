import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { useServiceDetail } from "../hooks/useServiceDetail";
import { submitServiceRequest } from "../api/serviceRequests";
import StepIndicator from "../components/StepIndicator";
import DateSlotPicker from "../components/DateSlotPicker";
import DynamicField from "../components/DynamicField";

const MOBILE_REGEX = /^(09\d{9}|\+639\d{9})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function to24Hour(slot) {
  const [time, period] = slot.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function BookingFlow() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: service, isLoading, isError } = useServiceDetail(slug);

  const [step, setStep] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground text-sm">Loading…</div>;
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

  const goBack = () => {
    if (step === 2) navigate(`/services/${service.slug}`);
    else setStep(step - 1);
  };

  const handleDetailsSubmit = () => {
    const errors = {};
    if (!MOBILE_REGEX.test(mobile.trim())) {
      errors.mobile = "Enter a valid PH mobile number (e.g. 09171234567)";
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }
    service.form_schema.fields.forEach((field) => {
      if (field.validation?.required && !formData[field.name]) {
        errors[field.name] = "This field is required";
      }
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setStep(4);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await submitServiceRequest({
        service_id: service.id,
        resident_name: fullName.trim(),
        resident_phone: mobile.trim(),
        resident_email: email.trim(),
        booked_for_name: null,
        scheduled_date: selectedDate.toISOString().slice(0, 10),
        scheduled_time: to24Hour(selectedSlot),
        form_data: formData,
      });
      navigate(`/ticket/${response.data.meta.reference_code}`, {
        state: {
          referenceCode: response.data.meta.reference_code,
          trackingUrl: response.data.meta.signed_tracking_url,
          serviceName: service.name,
          departmentName: service.department_name,
          residentName: fullName.trim(),
          residentPhone: mobile.trim(),
          date: selectedDate.toISOString(),
          slot: selectedSlot,
        },
      });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Something went wrong submitting your application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={goBack} className="flex items-center gap-1 text-sm text-accent hover:underline mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <StepIndicator currentStep={step} />

      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          {service.department_name}
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-6" style={{ fontFamily: "var(--font-heading)" }}>
          {service.name}
        </h1>

        {step === 2 && (
          <>
            <DateSlotPicker
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              onSelectSlot={setSelectedSlot}
            />
            <button
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(3)}
              className="w-full mt-6 bg-primary text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight size={16} />
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Mobile Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="09171234567"
                  className="w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {fieldErrors.mobile && <p className="text-destructive text-xs mt-1.5">{fieldErrors.mobile}</p>}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@example.com"
                  className="w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {fieldErrors.email && <p className="text-destructive text-xs mt-1.5">{fieldErrors.email}</p>}
              </div>

              {service.form_schema.fields.map((field) => (
                <DynamicField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={(val) => setFormData((prev) => ({ ...prev, [field.name]: val }))}
                  error={fieldErrors[field.name]}
                />
              ))}
            </div>
            <button
              onClick={handleDetailsSubmit}
              className="w-full mt-6 bg-primary text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Continue <ArrowRight size={16} />
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-4">
              <SummaryRow label="Service" value={service.name} onEdit={() => setStep(2)} />
              <SummaryRow
                label="Date & Time"
                value={`${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · ${selectedSlot}`}
                onEdit={() => setStep(2)}
              />
              <SummaryRow label="Name" value={fullName} onEdit={() => setStep(3)} />
              <SummaryRow label="Mobile Number" value={mobile} onEdit={() => setStep(3)} />
              <SummaryRow label="Email" value={email} onEdit={() => setStep(3)} />
              {service.form_schema.fields.map((field) => (
                <SummaryRow
                  key={field.name}
                  label={field.label}
                  value={formData[field.name] || "—"}
                  onEdit={() => setStep(3)}
                />
              ))}
            </div>

            <label className="flex items-start gap-2.5 mt-6 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent flex-shrink-0"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I consent to the Municipality of Hilongos collecting and processing my personal
                information above for the purpose of processing this application, in accordance
                with the Data Privacy Act of 2012.
              </span>
            </label>

            {submitError && <p className="text-destructive text-sm mt-3">{submitError}</p>}

            <button
              onClick={handleConfirm}
              disabled={!consentChecked || submitting}
              className="w-full mt-4 bg-accent text-white rounded-xl py-3 font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Confirm & Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
        <div className="text-sm text-foreground">{value}</div>
      </div>
      <button onClick={onEdit} className="text-accent hover:opacity-70 flex-shrink-0 mt-0.5">
        <Pencil size={13} />
      </button>
    </div>
  );
}