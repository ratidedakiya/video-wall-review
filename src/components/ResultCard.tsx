import { ScreenConfig, CabinetType, fromMM, Unit, ResolvedDimensions, InputField } from "@/lib/ledCalculator";

interface ResultCardProps {
  config: ScreenConfig;
  cabinet: CabinetType;
  isSelected: boolean;
  onSelect: () => void;
  unit: Unit;
  target: ResolvedDimensions;
  enteredFields: InputField[];
}

export default function ResultCard({ config, cabinet, isSelected, onSelect, unit, target, enteredFields = [] }: ResultCardProps) {
  const fmt = (mm: number) => `${fromMM(mm, unit).toFixed(2)} ${unit}`;
  
  const diffDisplay = (targetMM: number, actualMM: number) => {
    const diff = actualMM - targetMM;
    const diffInUnit = fromMM(Math.abs(diff), unit).toFixed(2);
    if (Math.abs(diff) < 0.01) return <span className="text-primary text-[10px]">exact match</span>;
    return (
      <span className={`text-[10px] ${diff > 0 ? "text-[hsl(var(--warning))]" : "text-[hsl(var(--accent))]"}`}>
        {diff > 0 ? "+" : "-"}{diffInUnit} {unit}
      </span>
    );
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        isSelected
          ? "border-primary glow-primary bg-primary/5"
          : "border-border hover:border-muted-foreground bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
          config.type === "lower"
            ? "bg-accent/10 text-accent"
            : "bg-warning/10 text-warning"
        }`}>
          {config.type === "lower" ? "↓ Lower" : "↑ Upper"}
        </span>
        {isSelected && (
          <span className="text-xs font-mono text-primary">● Selected</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Columns</span>
          <p className="font-mono font-bold text-foreground">{config.columns}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Rows</span>
          <p className="font-mono font-bold text-foreground">{config.rows}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Total Width</span>
          <p className="font-mono text-foreground text-xs">{fmt(config.totalWidth)}</p>
          {enteredFields.includes("width") && (
            <>
              <p className="text-muted-foreground text-[10px]">Target: {fmt(target.width)}</p>
              {diffDisplay(target.width, config.totalWidth)}
            </>
          )}
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Total Height</span>
          <p className="font-mono text-foreground text-xs">{fmt(config.totalHeight)}</p>
          {enteredFields.includes("height") && (
            <>
              <p className="text-muted-foreground text-[10px]">Target: {fmt(target.height)}</p>
              {diffDisplay(target.height, config.totalHeight)}
            </>
          )}
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Diagonal</span>
          <p className="font-mono text-foreground text-xs">{fmt(config.diagonal)}</p>
          {enteredFields.includes("diagonal") && (
            <>
              <p className="text-muted-foreground text-[10px]">Target: {fmt(target.diagonal)}</p>
              {diffDisplay(target.diagonal, config.diagonal)}
            </>
          )}
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Ratio</span>
          <p className="font-mono text-foreground text-xs">{config.ratio.toFixed(3)}</p>
          {enteredFields.includes("ratio") && (
            <p className="text-muted-foreground text-[10px]">Target: {target.ratio.toFixed(3)}</p>
          )}
          {config.ratioError > 5 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-mono">
              {config.ratioError.toFixed(1)}% off
            </span>
          )}
          {config.ratioError > 0.1 && config.ratioError <= 5 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] font-mono">
              ~{config.ratioError.toFixed(1)}% off
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
