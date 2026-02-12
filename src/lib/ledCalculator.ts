export type Unit = "inches" | "feet" | "meter";
export type InputField = "diagonal" | "height" | "width" | "ratio";

export interface CabinetType {
  name: string;
  width: number; // mm
  height: number; // mm
  ratio: number;
  label: string;
}

export const CABINET_TYPES: CabinetType[] = [
  { name: "16:9", width: 600, height: 337.5, ratio: 16 / 9, label: "16:9 (600×337.5 mm)" },
  { name: "1:1", width: 500, height: 500, ratio: 1, label: "1:1 (500×500 mm)" },
];

export interface PredefinedRatio {
  label: string;
  value: number;
}

export const PREDEFINED_RATIOS: PredefinedRatio[] = [
  { label: "16:9", value: 16 / 9 },
  { label: "32:9", value: 32 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "24:9", value: 24 / 9 },
  { label: "9:16", value: 9 / 16 },
  { label: "16:10", value: 16 / 10 },
  { label: "2.40:1", value: 2.40 },
  { label: "16:18", value: 16 / 18 },
  { label: "48:9", value: 48 / 9 },
];

export interface CalculationResult {
  cabinet: CabinetType;
  lower: ScreenConfig | null;
  upper: ScreenConfig | null;
}

export interface ScreenConfig {
  columns: number;
  rows: number;
  totalWidth: number; // mm
  totalHeight: number; // mm
  diagonal: number; // mm
  ratio: number;
  ratioError: number; // percentage error from target ratio
  type: "lower" | "upper";
}

export function toMM(value: number, unit: Unit): number {
  switch (unit) {
    case "inches": return value * 25.4;
    case "feet": return value * 304.8;
    case "meter": return value * 1000;
  }
}

export function fromMM(value: number, unit: Unit): number {
  switch (unit) {
    case "inches": return value / 25.4;
    case "feet": return value / 304.8;
    case "meter": return value / 1000;
  }
}

export interface ResolvedDimensions {
  width: number; // mm
  height: number; // mm
  diagonal: number; // mm
  ratio: number;
}

// Minimum target size: at least 100mm in any dimension
const MIN_TARGET_MM = 100;
// Maximum target size: 100 meters
const MAX_TARGET_MM = 100_000;

export function resolveInputs(
  fields: Partial<Record<InputField, number>>,
  unit: Unit
): ResolvedDimensions | null {
  const filled = Object.keys(fields).filter(k => fields[k as InputField] != null && fields[k as InputField]! > 0) as InputField[];
  if (filled.length < 2) return null;

  let w: number | undefined, h: number | undefined, d: number | undefined, r: number | undefined;

  if (fields.width != null && fields.width > 0) w = toMM(fields.width, unit);
  if (fields.height != null && fields.height > 0) h = toMM(fields.height, unit);
  if (fields.diagonal != null && fields.diagonal > 0) d = toMM(fields.diagonal, unit);
  if (fields.ratio != null && fields.ratio > 0) r = fields.ratio; // ratio is unitless

  // Ratio + Width
  if (r != null && w != null && h == null && d == null) {
    h = w / r;
    d = Math.sqrt(w * w + h * h);
  }
  // Ratio + Height
  else if (r != null && h != null && w == null && d == null) {
    w = h * r;
    d = Math.sqrt(w * w + h * h);
  }
  // Ratio + Diagonal
  else if (r != null && d != null && w == null && h == null) {
    h = d / Math.sqrt(1 + r * r);
    w = h * r;
  }
  // Width + Height
  else if (w != null && h != null && r == null && d == null) {
    r = w / h;
    d = Math.sqrt(w * w + h * h);
  }
  // Width + Diagonal
  else if (w != null && d != null && h == null && r == null) {
    if (d <= w) return null;
    h = Math.sqrt(d * d - w * w);
    r = w / h;
  }
  // Height + Diagonal
  else if (h != null && d != null && w == null && r == null) {
    if (d <= h) return null;
    w = Math.sqrt(d * d - h * h);
    r = w / h;
  }
  else {
    return null;
  }

  if (!w || !h || !d || !r || isNaN(w) || isNaN(h) || isNaN(d) || isNaN(r)) return null;

  // Validate min/max size
  if (w < MIN_TARGET_MM || h < MIN_TARGET_MM || w > MAX_TARGET_MM || h > MAX_TARGET_MM) return null;

  return { width: w, height: h, diagonal: d, ratio: r };
}

export function calculateResults(dims: ResolvedDimensions): CalculationResult[] {
  const targetRatio = dims.ratio;

  return CABINET_TYPES.map(cabinet => {
    const exactRows = dims.height / cabinet.height;
    const lowerRows = Math.floor(exactRows);
    // Use epsilon tolerance for floating-point "integer" check
    const isEffectivelyInteger = Math.abs(exactRows - Math.round(exactRows)) < 0.0001;
    const upperRows = isEffectivelyInteger ? Math.round(exactRows) + 1 : Math.ceil(exactRows);

    // For a given row count, find the column count whose actual ratio is closest to targetRatio
    const bestColsForRows = (rows: number): number => {
      const estCols = Math.round((targetRatio * rows * cabinet.height) / cabinet.width);
      let bestCols = Math.max(1, estCols);
      let bestError = Infinity;
      // Search around the estimate
      for (let c = Math.max(1, estCols - 3); c <= estCols + 3; c++) {
        const actualRatio = (c * cabinet.width) / (rows * cabinet.height);
        const err = Math.abs(actualRatio - targetRatio);
        if (err < bestError) {
          bestError = err;
          bestCols = c;
        }
      }
      return bestCols;
    };

    // Compute best configs for lower and upper row counts
    const lowerCols = lowerRows > 0 ? bestColsForRows(lowerRows) : 0;
    const upperCols = upperRows > 0 ? bestColsForRows(upperRows) : 0;

    const lower: ScreenConfig | null = (lowerCols > 0 && lowerRows > 0)
      ? makeConfig(cabinet, lowerCols, lowerRows, "lower", targetRatio)
      : null;

    const upper: ScreenConfig | null = (upperCols > 0 && upperRows > 0)
      ? makeConfig(cabinet, upperCols, upperRows, "upper", targetRatio)
      : null;

    return { cabinet, lower, upper };
  });
}

function makeConfig(cabinet: CabinetType, cols: number, rows: number, type: "lower" | "upper", targetRatio: number): ScreenConfig {
  const totalWidth = cols * cabinet.width;
  const totalHeight = rows * cabinet.height;
  const diagonal = Math.sqrt(totalWidth * totalWidth + totalHeight * totalHeight);
  const ratio = totalWidth / totalHeight;
  const ratioError = targetRatio > 0 ? Math.abs(ratio - targetRatio) / targetRatio * 100 : 0;
  return { columns: cols, rows, totalWidth, totalHeight, diagonal, ratio, ratioError, type };
}

export function formatMM(mm: number, unit: Unit): string {
  const val = fromMM(mm, unit);
  return val.toFixed(2);
}

export function formatDimension(mm: number): string {
  if (mm >= 1000) return `${(mm / 1000).toFixed(2)} m`;
  return `${mm.toFixed(1)} mm`;
}
