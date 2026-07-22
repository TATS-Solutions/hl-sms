export default function DynamicField({ field, value, onChange, error }) {
  const base = "w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
        {field.label}
        {field.validation?.required && <span className="text-destructive ml-1">*</span>}
      </label>

      {field.type === "select" && (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="" disabled>Select an option</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === "textarea" && (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={base}
        />
      )}

      {field.type === "number" && (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          min={field.validation?.min}
          className={base}
        />
      )}

      {field.type === "text" && (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}

      {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
    </div>
  );
}