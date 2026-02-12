import { useState } from "react";
import { CalculationResult, formatDimension, Unit, fromMM, ResolvedDimensions, InputField } from "@/lib/ledCalculator";
import ResultCard from "./ResultCard";
import VisualGrid from "./VisualGrid";

interface ResultsPanelProps {
  results: CalculationResult[];
  resolvedDims: ResolvedDimensions;
  unit: Unit;
  enteredFields: InputField[];
}

export default function ResultsPanel({ results, resolvedDims, unit, enteredFields }: ResultsPanelProps) {
  const [selected, setSelected] = useState<{ cabinetIdx: number; type: "lower" | "upper" } | null>(null);

  const selectedConfig = selected
    ? (selected.type === "lower" ? results[selected.cabinetIdx].lower : results[selected.cabinetIdx].upper)
    : null;

  const selectedCabinet = selected ? results[selected.cabinetIdx].cabinet : null;

  const formatInUnit = (mm: number) => `${fromMM(mm, unit).toFixed(2)} ${unit}`;
  const diffLabel = (target: number, actual: number) => {
    const diff = actual - target;
    const diffUnit = fromMM(Math.abs(diff), unit).toFixed(2);
    if (Math.abs(diff) < 0.01) return <span className="text-primary font-semibold">exact match</span>;
    return (
      <span className={diff > 0 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--accent))]"}>
        {diff > 0 ? "+" : "-"}{diffUnit} {unit} ({diff > 0 ? "+" : "-"}{Math.abs(diff).toFixed(1)} mm)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Entered / Resolved dimensions */}
      <div className="surface-glass rounded-lg p-4">
        <h3 className="text-sm font-mono font-semibold text-primary mb-3">Your Target Dimensions</h3>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-xs text-muted-foreground block">Width</span>
            <span className="font-mono text-sm text-foreground">{formatInUnit(resolvedDims.width)}</span>
            <span className="text-[10px] text-muted-foreground block">{formatDimension(resolvedDims.width)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Height</span>
            <span className="font-mono text-sm text-foreground">{formatInUnit(resolvedDims.height)}</span>
            <span className="text-[10px] text-muted-foreground block">{formatDimension(resolvedDims.height)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Diagonal</span>
            <span className="font-mono text-sm text-foreground">{formatInUnit(resolvedDims.diagonal)}</span>
            <span className="text-[10px] text-muted-foreground block">{formatDimension(resolvedDims.diagonal)}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Ratio</span>
            <span className="font-mono text-sm text-foreground">{resolvedDims.ratio.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Cabinet results */}
      {results.map((result, cabIdx) => (
        <div key={result.cabinet.name} className="surface-glass rounded-lg p-4 space-y-3">
          <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">▣</span>
            Cabinet {result.cabinet.name}
            <span className="text-xs text-muted-foreground font-normal">
              ({result.cabinet.width}×{result.cabinet.height} mm)
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {result.lower && (
              <div className="space-y-2">
              <ResultCard
                  config={result.lower}
                  cabinet={result.cabinet}
                  isSelected={selected?.cabinetIdx === cabIdx && selected?.type === "lower"}
                  onSelect={() => setSelected({ cabinetIdx: cabIdx, type: "lower" })}
                  unit={unit}
                  target={resolvedDims}
                  enteredFields={enteredFields}
                />
                <div className="px-2 text-[11px] font-mono space-y-0.5">
                  <div className="text-muted-foreground">
                    Width diff: {diffLabel(resolvedDims.width, result.lower.totalWidth)}
                  </div>
                  <div className="text-muted-foreground">
                    Height diff: {diffLabel(resolvedDims.height, result.lower.totalHeight)}
                  </div>
                </div>
              </div>
            )}
            {result.upper && (
              <div className="space-y-2">
              <ResultCard
                  config={result.upper}
                  cabinet={result.cabinet}
                  isSelected={selected?.cabinetIdx === cabIdx && selected?.type === "upper"}
                  onSelect={() => setSelected({ cabinetIdx: cabIdx, type: "upper" })}
                  unit={unit}
                  target={resolvedDims}
                  enteredFields={enteredFields}
                />
                <div className="px-2 text-[11px] font-mono space-y-0.5">
                  <div className="text-muted-foreground">
                    Width diff: {diffLabel(resolvedDims.width, result.upper.totalWidth)}
                  </div>
                  <div className="text-muted-foreground">
                    Height diff: {diffLabel(resolvedDims.height, result.upper.totalHeight)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Visual grid */}
      {selectedConfig && selectedCabinet && (
        <VisualGrid config={selectedConfig} cabinet={selectedCabinet} unit={unit} />
      )}
    </div>
  );
}
