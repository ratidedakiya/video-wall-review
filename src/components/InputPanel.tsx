import { useState } from "react";
import { InputField, Unit, PREDEFINED_RATIOS } from "@/lib/ledCalculator";
import { toMM, fromMM } from "@/lib/ledCalculator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InputPanelProps {
  onCalculate: (fields: Partial<Record<InputField, number>>, unit: Unit) => void;
  onUnitChange?: (unit: Unit) => void;
}

const FIELDS: { key: InputField; label: string; icon: string }[] = [
  { key: "width", label: "Width", icon: "↔" },
  { key: "height", label: "Height", icon: "↕" },
  { key: "diagonal", label: "Diagonal", icon: "⤡" },
  { key: "ratio", label: "Ratio", icon: "◧" },
];

const UNITS: { value: Unit; label: string }[] = [
  { value: "inches", label: "Inches" },
  { value: "feet", label: "Feet" },
  { value: "meter", label: "Meter" },
];

export default function InputPanel({ onCalculate, onUnitChange }: InputPanelProps) {
  const [unit, setUnit] = useState<Unit>("inches");
  const [values, setValues] = useState<Partial<Record<InputField, string>>>({});
  const [enabledFields, setEnabledFields] = useState<Set<InputField>>(new Set());

  const filledCount = [...enabledFields].filter(f => {
    const v = values[f];
    return v != null && v !== "" && Number(v) > 0;
  }).length;

  const toggleField = (field: InputField) => {
    const next = new Set(enabledFields);
    if (next.has(field)) {
      next.delete(field);
      setValues(prev => ({ ...prev, [field]: "" }));
    } else {
      if (next.size >= 2) return;
      next.add(field);
    }
    setEnabledFields(next);
  };

  const handleCalculate = () => {
    const numericValues: Partial<Record<InputField, number>> = {};
    for (const f of enabledFields) {
      const v = parseFloat(values[f] || "");
      if (v > 0) numericValues[f] = v;
    }
    if (Object.keys(numericValues).length === 2) {
      onCalculate(numericValues, unit);
    }
  };

  const canCalculate = filledCount === 2;

  return (
    <div className="surface-glass rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1 font-mono">
          Input Parameters
        </h2>
        <p className="text-sm text-muted-foreground">
          Select any <span className="text-primary font-semibold">2 fields</span> and enter values
        </p>
      </div>

      {/* Unit selector */}
      <div className="flex gap-1 p-1 rounded-md bg-muted">
        {UNITS.map(u => (
          <button
            key={u.value}
            onClick={() => {
  const newUnit = u.value;

  setValues(prev => {
    const converted: Partial<Record<InputField, string>> = {};

    for (const key in prev) {
      const field = key as InputField;
      if (!prev[field] || field === "ratio") {
        converted[field] = prev[field];
        continue;
      }

      const numeric = parseFloat(prev[field]!);
      if (isNaN(numeric)) continue;

      const mm = toMM(numeric, unit);          // old → mm
      const newVal = fromMM(mm, newUnit);      // mm → new
      converted[field] = newVal.toFixed(4);    // keep precision
    }

    return converted;
  });

  setUnit(newUnit);
  onUnitChange?.(newUnit);
}}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
              unit === u.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {FIELDS.map(field => {
          const isEnabled = enabledFields.has(field.key);
          const isDisabled = !isEnabled && enabledFields.size >= 2;
          const isRatio = field.key === "ratio";

          return (
            <div key={field.key} className="space-y-1">
              <button
                onClick={() => toggleField(field.key)}
                disabled={isDisabled && !isEnabled}
                className={`w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left ${
                  isEnabled
                    ? "border-primary bg-primary/5 text-foreground"
                    : isDisabled
                    ? "border-border bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                    : "border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground cursor-pointer"
                }`}
              >
                <span className="text-xl w-6 text-center">{field.icon}</span>
                <span className="font-medium text-sm flex-1">
                  {field.label}{!isRatio ? ` (${unit.charAt(0).toUpperCase() + unit.slice(1)})` : ""}
                </span>
                {isEnabled && (
                  <span className="text-xs text-primary font-mono">
                    {isRatio ? "select" : unit}
                  </span>
                )}
                <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all ${
                  isEnabled ? "border-primary bg-primary" : "border-muted-foreground"
                }`}>
                  {isEnabled && <span className="text-primary-foreground text-xs">✓</span>}
                </div>
              </button>
              {isEnabled && !isRatio && (
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder={`Enter ${field.label.toLowerCase()} in ${unit}`}
                  value={values[field.key] || ""}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-md bg-muted border border-border text-foreground font-mono text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  autoFocus
                />
              )}
              {isEnabled && isRatio && (
                <Select
                  value={values.ratio || ""}
                  onValueChange={(val) => setValues(prev => ({ ...prev, ratio: val }))}
                >
                  <SelectTrigger className="w-full bg-muted border-border text-foreground font-mono text-sm">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_RATIOS.map(r => (
                      <SelectItem key={r.label} value={String(r.value)}>
                        {r.label} ({r.value.toFixed(3)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={!canCalculate}
        className={`w-full py-3 px-4 rounded-md font-mono font-semibold text-sm transition-all ${
          canCalculate
            ? "bg-primary text-primary-foreground hover:opacity-90 glow-primary cursor-pointer"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        Calculate
      </button>
    </div>
  );
}
