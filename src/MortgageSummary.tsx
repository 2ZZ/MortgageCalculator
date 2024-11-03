import React from "react";
import { MortgageCalculationResult } from "./types";

interface MortgageSummaryProps {
  results: MortgageCalculationResult[];
  options: {
    termYears: number;
    interestRate: number;
    annualOverpaymentPercentage: number;
  }[];
}

const MortgageSummary: React.FC<MortgageSummaryProps> = ({
  results,
  options,
}) => {
  if (results.length < 2) return null;

  const formatCurrency = (value: number): string => `£${value.toFixed(2)}`;

  const getOptionLabel = (index: number) => {
    const option = options[index];
    return `${option.termYears}yr/${option.interestRate}%/${option.annualOverpaymentPercentage}%`;
  };

  const getDifference = (value1: number, value2: number) => {
    const diff = value1 - value2;
    return {
      amount: diff,
      isPositive: diff > 0,
    };
  };

  interface ComparisonRowProps {
    label: string;
    value1: number;
    value2: number;
    format?: (value: number) => string;
    preferHigher?: boolean;
    showMinus?: boolean;
    reverseGreenMinus?: boolean;
  }

  const ComparisonRow: React.FC<ComparisonRowProps> = ({
    label,
    value1,
    value2,
    format = formatCurrency,
    preferHigher = false,
    showMinus = false,
    reverseGreenMinus = false,
  }) => {
    const diff = getDifference(value1, value2);
    const colorValue1 = preferHigher
      ? value1 > value2
        ? "text-green-400"
        : "text-red-400"
      : value1 < value2
      ? "text-green-400"
      : "text-red-400";
    const colorValue2 = preferHigher
      ? value2 > value1
        ? "text-green-400"
        : "text-red-400"
      : value2 < value1
      ? "text-green-400"
      : "text-red-400";

    const diffText = format(Math.abs(diff.amount));
    const betterValue = preferHigher
      ? Math.max(value1, value2)
      : Math.min(value1, value2);
    const isBetterValue1 = betterValue === value1;

    const getPrefix = (isComparisonForValue1: boolean) => {
      if (showMinus) return "-";
      if (!showMinus) return "+";
    };

    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-700">
        <div className="text-gray-300">{label}</div>
        <div
          className={`text-right ${colorValue1} flex justify-end items-center space-x-2`}
        >
          <span>{format(value1)}</span>
          {isBetterValue1 && diff.amount !== 0 && (
            <span className="text-sm text-green-400 ml-2">
              {`(${getPrefix(true)}${diffText})`}
            </span>
          )}
        </div>
        <div
          className={`text-right ${colorValue2} flex justify-end items-center space-x-2`}
        >
          <span>{format(value2)}</span>
          {!isBetterValue1 && diff.amount !== 0 && (
            <span className="text-sm text-green-400 ml-2">
              {`(${getPrefix(false)}${diffText})`}
            </span>
          )}
        </div>
      </div>
    );
  };

  const calculateTotalInterestSaved = (result: MortgageCalculationResult) => {
    return result.baselineInterest - result.totalInterestPaid;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Mortgage Comparison Summary</h3>

      <div className="grid grid-cols-3 gap-4 mb-4 pb-2 border-b border-gray-600">
        <div className="font-medium"></div>
        <div className="text-right font-medium">
          Option 1 ({getOptionLabel(0)})
        </div>
        <div className="text-right font-medium">
          Option 2 ({getOptionLabel(1)})
        </div>
      </div>

      <div className="space-y-1">
        <ComparisonRow
          label="Mandatory Monthly Payment"
          value1={results[0].baseMonthlyPayment}
          value2={results[1].baseMonthlyPayment}
          preferHigher={false}
          showMinus={true}
        />

        <ComparisonRow
          label="Interest Saved in Fix Period"
          value1={calculateTotalInterestSaved(results[0])}
          value2={calculateTotalInterestSaved(results[1])}
          preferHigher={true}
        />

        <ComparisonRow
          label="Total Amount Paid"
          value1={results[0].totalPaid}
          value2={results[1].totalPaid}
          preferHigher={false}
          showMinus={true}
        />

        <ComparisonRow
          label="Remaining Balance"
          value1={results[0].remainingBalance}
          value2={results[1].remainingBalance}
          preferHigher={false}
          showMinus={true}
          reverseGreenMinus={true}
        />

        <ComparisonRow
          label="Equity Built"
          value1={results[0].equityBuilt}
          value2={results[1].equityBuilt}
          preferHigher={true}
        />
      </div>
    </div>
  );
};

export default MortgageSummary;
