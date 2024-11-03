import React from "react";

interface OptimizationOption {
  termYears: number;
  interestRate: number;
  annualOverpaymentPercentage: number;
}

interface OptimizationResult {
  termYears: number;
  debugInfo: string;
}

interface OptimizationResultsProps {
  results: OptimizationResult[];
  oldOptions: OptimizationOption[];
  newOptions: (OptimizationOption & {
    principal: number;
    maxMonthlyPayment: number;
    fixPeriod: number;
  })[];
}

const OptimizationResults: React.FC<OptimizationResultsProps> = ({
  results,
  oldOptions,
  newOptions,
}) => {
  if (!results) return null;

  return (
    <div className="space-y-4 bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Term Optimization Results</h3>

      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              {result.termYears > 0 ? (
                <span className="text-green-500 text-xl">✓</span>
              ) : (
                <span className="text-red-500 text-xl">✗</span>
              )}
              <h4 className="text-lg font-semibold">Option {index + 1}</h4>
            </div>

            {result.termYears > 0 ? (
              <div className="ml-7 space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <span>Term Length:</span>
                  <span className="font-mono">
                    {oldOptions[index].termYears}yr
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className="font-mono text-green-400">
                    {result.termYears}yr
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  This is the longest viable term that:
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>
                      Keeps monthly payments under £
                      {newOptions[index].maxMonthlyPayment.toFixed(2)}
                    </li>
                    <li>
                      Stays within the{" "}
                      {newOptions[index].annualOverpaymentPercentage}% annual
                      overpayment limit
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="ml-7 bg-red-900/20 border border-red-900 rounded p-3 text-red-300">
                <div className="font-semibold mb-1">
                  Unable to find viable term
                </div>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>Try increasing the maximum monthly payment</li>
                  <li>Consider a higher annual overpayment allowance</li>
                  <li>Check if the fix period is too restrictive</li>
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptimizationResults;
