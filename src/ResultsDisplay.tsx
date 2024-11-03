import React from "react";
import { MortgageCalculationResult } from "./types";
import ComparisonCharts from "./ComparisonCharts";
import MortgageSummary from "./MortgageSummary";
import SingleOptionResults from "./SingleOptionResults";

interface ResultsDisplayProps {
  results: MortgageCalculationResult[];
  options: {
    termYears: number;
    interestRate: number;
    annualOverpaymentPercentage: number;
  }[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  options,
}) => {
  if (results.length === 1) {
    return <SingleOptionResults result={results[0]} option={options[0]} />;
  }

  return (
    <div className="space-y-6">
      <ComparisonCharts results={results} options={options} />
      <MortgageSummary results={results} options={options} />
    </div>
  );
};
