import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { SERVICES, getDept } from "../data/services";
import { saveBooking } from "../data/bookings";
import StepIndicator from "../components/StepIndicator";
import DateSlotPicker from "../components/DateSlotPicker";

const MOBILE_REGEX = /^(09\d{9}|\+639\d{9})$/;

export default function BookingFlow() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = SERVICES.find((s) => s.id === serviceId);

  const [step, setStep] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">Service not found.</p>
        <button onClick={() => navigate("/")} className="mt-4 text-accent hover:underline text-sm">
          Back to services
        </button>
      </div>
    );
  }

  const department = getDept(service.deptId);

  const goBack = () => {
    if (step === 2) navigate(`/services/${service.id}`);
    else setStep(step - 1);
  };

  const handleDetailsSubmit = () => {
    if (!MOBILE_REGEX.test(mobile.trim())) {
      setMobileError("Enter a valid PH mobile number (e.g. 09171234567)");
      return;
    }
    setMobileError("");
    setStep(4);
  };

  const handleConfirm = () => {
    const booking = saveBooking({
      serviceId: service.id,
      deptId: service.deptId,
      serviceName: service.name,
      departmentName: department.name,
      date: selectedDate.toISOString(),
      slot: selectedSlot,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
    });
    navigate(`/ticket/${booking.reference}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={goBack} className="flex items-center gap-1 text-sm text-accent hover:underline mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <StepIndicator currentStep={step} />

      <div className="bg-card rounded border border-border p-6">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          {department.shortName}
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
              className="w-full mt-6 bg-primary text-white rounded py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="09171234567"
                  className="w-full bg-input-background border border-border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {mobileError && <p className="text-destructive text-xs mt-1.5">{mobileError}</p>}
              </div>
            </div>
            <button
              disabled={!fullName.trim() || !mobile.trim()}
              onClick={handleDetailsSubmit}
              className="w-full mt-6 bg-primary text-white rounded py-3 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                information above for the purpose of scheduling and managing this appointment,
                in accordance with the Data Privacy Act of 2012.
              </span>
            </label>

            <button
              onClick={handleConfirm}
              disabled={!consentChecked}
              className="w-full mt-4 bg-accent text-white rounded py-3 font-semibold hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm Booking
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