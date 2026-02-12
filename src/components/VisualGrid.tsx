import { useState} from "react";
import { ScreenConfig, CabinetType, fromMM, Unit } from "@/lib/ledCalculator";



interface VisualGridProps {
  config: ScreenConfig;
  cabinet: CabinetType;
  unit: Unit;
}

export default function VisualGrid({ config, cabinet, unit }: VisualGridProps) {
  const [cols, setCols] = useState(config.columns);
  const [rows, setRows] = useState(config.rows);
  
  const MAX_GRID_CELLS = 10000; // Cap at 100×100
  const isTooLarge = cols * rows > MAX_GRID_CELLS;

  const totalWidth = cols * cabinet.width;
  const totalHeight = rows * cabinet.height;
  const diagonal = Math.sqrt(totalWidth * totalWidth + totalHeight * totalHeight);

  const fmt = (mm: number) => `${fromMM(mm, unit).toFixed(2)} ${unit}`;

  const maxGridWidth = 600;
  const cellAspect = cabinet.width / cabinet.height;
  const gridAspect = (cols * cellAspect) / rows;

  let gridWidth: number, gridHeight: number;
  if (gridAspect > 1) {
    gridWidth = Math.min(maxGridWidth, 600);
    gridHeight = gridWidth / gridAspect;
  } else {
    gridHeight = Math.min(400, 400);
    gridWidth = gridHeight * gridAspect;
  }

  const cellW = gridWidth / cols;
  const cellH = gridHeight / rows;
  
  if (config.columns !== cols || config.rows !== rows) {
  setCols(config.columns);
  setRows(config.rows);
}

  return (
    <div className="surface-glass rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono font-semibold text-foreground">Screen Preview</h3>
        <span className="text-xs font-mono text-muted-foreground">
          {cols}×{rows} = {cols * rows} cabinets
        </span>
      </div>

      {/* Dimensions in user unit */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
        <span>Width: <span className="text-foreground">{fmt(totalWidth)}</span></span>
        <span>|</span>
        <span>Height: <span className="text-foreground">{fmt(totalHeight)}</span></span>
        <span>|</span>
        <span>Diagonal: <span className="text-foreground">{fmt(diagonal)}</span></span>
        <span>|</span>
        <span>Ratio: <span className="text-foreground">{(totalWidth / totalHeight).toFixed(3)}</span></span>
      </div>
     {/* Row / Column controls */}
      {/* <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">Columns:</span>
          <button
            onClick={() => setCols(c => Math.max(1, c - 1))}
            className="w-7 h-7 rounded border border-border bg-muted text-foreground font-mono text-sm hover:border-primary transition-colors"
          >−</button>
          <span className="font-mono font-bold text-foreground w-6 text-center">{cols}</span>
          <button
            onClick={() => setCols(c => c + 1)}
            className="w-7 h-7 rounded border border-border bg-muted text-foreground font-mono text-sm hover:border-primary transition-colors"
          >+</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">Rows:</span>
          <button
            onClick={() => setRows(r => Math.max(1, r - 1))}
            className="w-7 h-7 rounded border border-border bg-muted text-foreground font-mono text-sm hover:border-primary transition-colors"
          >−</button>
          <span className="font-mono font-bold text-foreground w-6 text-center">{rows}</span>
          <button
            onClick={() => setRows(r => r + 1)}
            className="w-7 h-7 rounded border border-border bg-muted text-foreground font-mono text-sm hover:border-primary transition-colors"
          >+</button>
        </div>
      </div>  */}

      {/* Grid visual */}
      <div className="flex justify-center py-4">
        <div className="relative">
          {/* Top: column count */}
          <div className="text-center mb-1 text-xs font-mono text-primary">
            ← {fmt(totalWidth)} ({cols} columns) →
          </div>

          <div className="flex">
            {/* Left: row count */}
            <div className="flex items-center mr-2">
              <span className="text-xs font-mono text-primary [writing-mode:vertical-lr] rotate-180">
                ← {fmt(totalHeight)} ({rows} rows) →
              </span>
            </div>

            {/* Grid */}
            {isTooLarge ? (
              <div
                className="border border-primary/40 rounded-sm flex items-center justify-center bg-[hsl(var(--grid-cell)/0.1)]"
                style={{ width: gridWidth, height: gridHeight }}
              >
                <div className="text-center p-4">
                  <p className="text-sm font-mono text-primary">{cols} × {rows}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cols * rows} cabinets (too many to render grid)
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="border border-primary/40 rounded-sm overflow-hidden"
                style={{ width: gridWidth, height: gridHeight }}
              >
                <div
                  className="grid h-full"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                  }}
                >
                  {Array.from({ length: rows * cols }).map((_, i) => {
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    return (
                      <div
                        key={i}
                        className="grid-cell-selected flex items-center justify-center transition-colors"
                        style={{ width: cellW, height: cellH }}
                      >
                        {cellW > 30 && cellH > 20 && (
                          <span className="text-[8px] font-mono text-primary/50">
                            {row + 1},{col + 1}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
