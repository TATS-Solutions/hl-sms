const STEPS = ["Service", "Date & Time", "Your Details", "Review", "Done"];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isDone = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                  isDone
                    ? "bg-accent border-accent text-white"
                    : isActive
                    ? "bg-primary border-primary text-white"
                    : "bg-transparent border-border text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : stepNumber}
              </div>
              <span
                className={`text-[10px] hidden sm:block leading-none whitespace-nowrap ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${isDone ? "bg-accent" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}