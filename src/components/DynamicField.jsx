import { ChevronDown } from "lucide-react";
import { HILONGOS_BARANGAYS } from "../data/barangays";

const isBarangayField = (field) => field.name.toLowerCase().includes("barangay");

function SelectField({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 appearance-none bg-input-background border border-border rounded-xl pl-3.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default function DynamicField({ field, value, onChange, error }) {
  const base = "w-full h-11 bg-input-background border border-border rounded-xl px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent";
  const textareaBase = "w-full bg-input-background border border-border rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
        {field.label}
        {field.validation?.required && <span className="text-destructive ml-1">*</span>}
      </label>

      {isBarangayField(field) ? (
        <SelectField value={value} onChange={onChange} placeholder="Select a barangay" options={HILONGOS_BARANGAYS} />
      ) : (
        <>
          {field.type === "select" && (
            <SelectField value={value} onChange={onChange} placeholder="Select an option" options={field.options} />
          )}

          {field.type === "textarea" && (
            <textarea
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              className={textareaBase}
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
        </>
      )}

      {error && <p className="text-destructive text-xs mt-1.5">{error}</p>}
    </div>
  );
}