import { useState } from "react";
import { InputField, Unit, resolveInputs, calculateResults, CalculationResult } from "@/lib/ledCalculator";
import InputPanel from "@/components/InputPanel";
import ResultsPanel from "@/components/ResultsPanel";

const Index = () => {
  const [results, setResults] = useState<CalculationResult[] | null>(null);
  const [resolvedDims, setResolvedDims] = useState<{ width: number; height: number; diagonal: number; ratio: number } | null>(null);
  const [unit, setUnit] = useState<Unit>("feet");
  const [enteredFields, setEnteredFields] = useState<InputField[]>([]);

  const handleCalculate = (fields: Partial<Record<InputField, number>>, selectedUnit: Unit) => {
    setUnit(selectedUnit);
    setEnteredFields(Object.keys(fields) as InputField[]);
    const dims = resolveInputs(fields, selectedUnit);
    if (!dims) {
      setResults(null);
      setResolvedDims(null);
      return;
    }
    setResolvedDims(dims);
    setResults(calculateResults(dims));
  };

  // Re-render results when unit changes (unit is passed to ResultsPanel already)
  // The unit state is lifted here and passed down, so switching units in InputPanel
  // won't auto-recalculate. We keep results but the display unit updates via props.

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-mono font-bold text-sm">▣</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground font-mono tracking-tight">
              LED Cabinet Calculator
            </h1>
            <p className="text-xs text-muted-foreground">
              Calculate optimal LED wall configurations
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input */}
          <div className="lg:col-span-4">
            <InputPanel onCalculate={handleCalculate} onUnitChange={setUnit} />
          </div>

          {/* Results */}
          <div className="lg:col-span-8">
            {results && resolvedDims ? (
              <ResultsPanel results={results} resolvedDims={resolvedDims} unit={unit} enteredFields={enteredFields} />
            ) : (
              <div className="surface-glass rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-2xl">▣</span>
                </div>
                <h3 className="font-mono font-semibold text-foreground mb-2">
                  No Calculation Yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Select any 2 parameters on the left, enter their values, and the calculator will show you the best LED cabinet configurations.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
