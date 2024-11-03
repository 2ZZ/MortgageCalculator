import React, { useState } from "react";
import { calculateMortgagePeriod } from "./mortgageCalculations";
import { MortgageOptionForm, SharedDetailsForm } from "./MortgageOptionForm";
import { ResultsDisplay } from "./ResultsDisplay";
import OptimizationResults from "./OptimizationResults";
import { MortgageCalculationResult } from "./types";
import { Plus, Minus } from "lucide-react";

interface SharedMortgageDetails {
  principal: number;
  maxMonthlyPayment: number;
  fixPeriod: number;
}

interface MortgageOption {
  termYears: number;
  interestRate: number;
  annualOverpaymentPercentage: number;
}

interface OptimizationState {
  results: Array<{
    termYears: number;
    debugInfo: string;
  }>;
  oldOptions: MortgageOption[];
  newOptions: (MortgageOption & SharedMortgageDetails)[];
}

const initialSharedDetails: SharedMortgageDetails = {
  principal: 200000,
  maxMonthlyPayment: 1700,
  fixPeriod: 5,
};

const initialOption: MortgageOption = {
  termYears: 20,
  interestRate: 4.08,
  annualOverpaymentPercentage: 10,
};

const findOptimalTermLength = (
  sharedDetails: SharedMortgageDetails,
  optionIndex: number,
  options: MortgageOption[]
): { termYears: number; debugInfo: string } => {
  let debugMessages: string[] = [];
  let viableTerms: Array<{
    term: number;
    baseMonthly: number;
    overpaymentLimited: number;
  }> = [];

  // Try all terms from 1 to 40 years
  for (let term = 1; term <= 40; term++) {
    const option = {
      ...options[optionIndex],
      termYears: term,
      ...sharedDetails,
    };

    const result = calculateMortgagePeriod(option, sharedDetails.fixPeriod);

    const baseMonthly = result.baseMonthlyPayment;
    const isViable =
      baseMonthly <= sharedDetails.maxMonthlyPayment &&
      result.totalLimitedByAnnual === 0;

    if (isViable) {
      viableTerms.push({
        term,
        baseMonthly,
        overpaymentLimited: result.totalLimitedByAnnual,
      });
    }
  }

  viableTerms.sort((a, b) => a.term - b.term);
  const optimalTerm = viableTerms[viableTerms.length - 1];

  const termRange = 3;
  const startTerm = optimalTerm ? optimalTerm.term - termRange : 0;
  const endTerm = optimalTerm ? optimalTerm.term + termRange : 0;

  for (let term = startTerm; term <= endTerm; term++) {
    if (term <= 0) continue;

    const option = {
      ...options[optionIndex],
      termYears: term,
      ...sharedDetails,
    };

    const result = calculateMortgagePeriod(option, sharedDetails.fixPeriod);
    const baseMonthly = result.baseMonthlyPayment;
    const maxPayment = Math.max(
      ...result.monthlyPayments.map((p) => p.payment)
    );
    const isViable =
      baseMonthly <= sharedDetails.maxMonthlyPayment &&
      result.totalLimitedByAnnual === 0;

    debugMessages.push(
      `Term ${term}yr: ` +
        `Base Monthly: £${baseMonthly.toFixed(2)}, ` +
        `Desired Monthly: £${sharedDetails.maxMonthlyPayment.toFixed(2)}, ` +
        `Max Payment Hit: £${maxPayment.toFixed(2)}, ` +
        `Overpayment Limited: £${result.totalLimitedByAnnual.toFixed(2)}, ` +
        `Viable: ${isViable ? "Yes" : "No"}` +
        (optimalTerm && term === optimalTerm.term ? " <- OPTIMAL" : "")
    );
  }

  const summaryMessage = optimalTerm
    ? `Found optimal term of ${optimalTerm.term} years for Option ${
        optionIndex + 1
      } - this gives the shortest viable term with base payment under the monthly limit and no overpayment restrictions`
    : `No viable term found for Option ${
        optionIndex + 1
      }. Consider:\n1. Increasing the maximum monthly payment\n2. Increasing the annual overpayment allowance\n3. Checking if the fix period is too long`;

  return {
    termYears: optimalTerm ? optimalTerm.term : 0,
    debugInfo:
      `${summaryMessage}\n\nDetailed Analysis of Terms Around Optimal:\n` +
      debugMessages.join("\n"),
  };
};

const MortgageCalculator: React.FC = () => {
  const [sharedDetails, setSharedDetails] = useState(initialSharedDetails);
  const [options, setOptions] = useState<MortgageOption[]>([initialOption]);
  const [results, setResults] = useState<MortgageCalculationResult[]>([]);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationState | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleCalculate = () => {
    const fullOptions = options.map((option) => ({
      ...option,
      ...sharedDetails,
    }));

    const calculatedResults = fullOptions.map((option) =>
      calculateMortgagePeriod(option, sharedDetails.fixPeriod)
    );
    setResults(calculatedResults);
  };

  const handleOptimizeTerms = () => {
    setIsOptimizing(true);

    setTimeout(() => {
      const optimizations = options.map((_, index) =>
        findOptimalTermLength(sharedDetails, index, options)
      );

      const foundValid = optimizations.some((opt) => opt.termYears > 0);

      if (foundValid) {
        const oldOptions = [...options];
        const newOptions = [...options];
        optimizations.forEach((opt, index) => {
          if (opt.termYears > 0) {
            newOptions[index] = {
              ...newOptions[index],
              termYears: opt.termYears,
            };
          }
        });

        setOptions(newOptions);
        setOptimizationResult({
          results: optimizations,
          oldOptions: oldOptions,
          newOptions: newOptions.map((opt) => ({
            ...opt,
            ...sharedDetails,
          })),
        });
      } else {
        setOptimizationResult({
          results: optimizations,
          oldOptions: options,
          newOptions: options.map((opt) => ({
            ...opt,
            ...sharedDetails,
          })),
        });
      }

      setIsOptimizing(false);
    }, 100);
  };

  const addOption = () => {
    // Get the term of the last option and subtract 1
    const lastOptionTerm = options[options.length - 1].termYears;
    const newTermYears = Math.max(1, lastOptionTerm - 5); // Ensure term doesn't go below 1 year

    setOptions([
      ...options,
      {
        ...initialOption,
        termYears: newTermYears,
      },
    ]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setResults(results.filter((_, i) => i !== index));
  };

  const updateOption = (
    index: number,
    field: keyof MortgageOption,
    value: number
  ) => {
    const newOptions = [...options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setOptions(newOptions);
  };

  const updateSharedDetails = (
    field: keyof SharedMortgageDetails,
    value: number
  ) => {
    setSharedDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Fixed Term Mortgage Analysis
          </h2>
          <div className="space-y-4 text-gray-300 text-sm">
            <p>
              Compare different mortgage scenarios to see how your repayments
              and savings change over a fixed interest period. Set your desired
              monthly payment to see how much you could save through regular
              overpayments.
            </p>
            <div className="bg-gray-700 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-white">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Set your loan amount and desired monthly payment target</li>
                <li>
                  Compare different term lengths and interest rates side by side
                </li>
                <li>
                  See how annual overpayment limits affect your potential
                  savings
                </li>
                <li>
                  Automatically find the optimal term length that maximizes
                  savings while staying within your monthly budget
                </li>
                <li>
                  Visualize the impact of overpayments on your remaining balance
                  and interest saved
                </li>
              </ul>
              <div className="mt-4 text-sm bg-gray-600/50 p-3 rounded">
                <p className="font-medium text-blue-300">💡 Pro Tip:</p>
                <p>
                  Enter your maximum comfortable monthly payment, and use "Find
                  Optimal Terms" to automatically calculate the shortest viable
                  mortgage term. This helps you pay off your mortgage faster
                  while staying within your budget and lender's overpayment
                  limits.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SharedDetailsForm
            details={sharedDetails}
            onChange={updateSharedDetails}
          />

          {options.map((option, index) => (
            <div key={index} className="relative">
              <MortgageOptionForm
                option={option}
                index={index}
                onChange={updateOption}
              />
              {index > 0 && (
                <button
                  onClick={() => removeOption(index)}
                  className="absolute -right-2 -top-2 bg-red-500 hover:bg-red-600 rounded-full p-1"
                  title="Remove option"
                >
                  <Minus size={16} />
                </button>
              )}
            </div>
          ))}

          {options.length < 2 && (
            <button
              onClick={addOption}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Comparison Option
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleOptimizeTerms}
              disabled={isOptimizing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              {isOptimizing ? "Optimizing..." : "Find Optimal Terms"}
            </button>

            <button
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Calculate
            </button>
          </div>

          {optimizationResult && (
            <OptimizationResults
              results={optimizationResult.results}
              oldOptions={optimizationResult.oldOptions}
              newOptions={optimizationResult.newOptions}
            />
          )}

          {results.length > 0 && (
            <ResultsDisplay results={results} options={options} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
