import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MortgageCalculationResult } from "./types";

interface ComparisonChartsProps {
  results: MortgageCalculationResult[];
  options: {
    termYears: number;
    interestRate: number;
    annualOverpaymentPercentage: number;
  }[];
}

const ComparisonCharts: React.FC<ComparisonChartsProps> = ({
  results,
  options,
}) => {
  if (results.length < 2) return null;

  const getOptionLabel = (index: number) => {
    const option = options[index];
    return `Option ${index + 1} (${option.termYears}yr/${
      option.interestRate
    }%/${option.annualOverpaymentPercentage}%)`;
  };

  // Calculate baseline interest to date...
  const calculateBaselineInterestToDate = (
    principal: number,
    monthlyRate: number,
    baseMonthlyPayment: number,
    monthIndex: number
  ): number => {
    let balance = principal;
    let totalInterest = 0;

    for (let i = 0; i <= monthIndex; i++) {
      const monthlyInterest = balance * monthlyRate;
      totalInterest += monthlyInterest;
      balance = balance - (baseMonthlyPayment - monthlyInterest);
    }
    return totalInterest;
  };

  const combinedData = results[0].monthlyPayments.map((payment, index) => {
    const payment2 = results[1].monthlyPayments[index];

    const monthlyRate1 = options[0].interestRate / 100 / 12;
    const monthlyRate2 = options[1].interestRate / 100 / 12;

    const baselineInterest1 = calculateBaselineInterestToDate(
      results[0].monthlyPayments[0].remaining,
      monthlyRate1,
      results[0].baseMonthlyPayment,
      index
    );

    const baselineInterest2 = calculateBaselineInterestToDate(
      results[1].monthlyPayments[0].remaining,
      monthlyRate2,
      results[1].baseMonthlyPayment,
      index
    );

    const actualInterest1 = results[0].monthlyPayments
      .slice(0, index + 1)
      .reduce((sum, p) => sum + p.interest, 0);
    const actualInterest2 = results[1].monthlyPayments
      .slice(0, index + 1)
      .reduce((sum, p) => sum + p.interest, 0);

    const interestSaved1 = baselineInterest1 - actualInterest1;
    const interestSaved2 = baselineInterest2 - actualInterest2;

    return {
      month: payment.month,
      balance1: payment.remaining,
      balance2: payment2.remaining,
      payment1: payment.payment,
      payment2: payment2.payment,
      interestSaved1,
      interestSaved2,
    };
  });

  const formatCurrency = (value: number) => `£${value.toFixed(2)}`;

  const commonChartProps = {
    width: 600,
    height: 300,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Remaining Balance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData} {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" tickFormatter={formatCurrency} />
            <Tooltip
              formatter={formatCurrency}
              contentStyle={{ backgroundColor: "#333", border: "none" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="balance1"
              stroke="#8884d8"
              name={getOptionLabel(0)}
            />
            <Line
              type="monotone"
              dataKey="balance2"
              stroke="#82ca9d"
              name={getOptionLabel(1)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Monthly Payments</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData} {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" tickFormatter={formatCurrency} />
            <Tooltip
              formatter={formatCurrency}
              contentStyle={{ backgroundColor: "#333", border: "none" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="payment1"
              stroke="#8884d8"
              name={getOptionLabel(0)}
            />
            <Line
              type="monotone"
              dataKey="payment2"
              stroke="#82ca9d"
              name={getOptionLabel(1)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">
          Cumulative Interest Saved Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData} {...commonChartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" tickFormatter={formatCurrency} />
            <Tooltip
              formatter={formatCurrency}
              contentStyle={{ backgroundColor: "#333", border: "none" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="interestSaved1"
              stroke="#8884d8"
              name={getOptionLabel(0)}
            />
            <Line
              type="monotone"
              dataKey="interestSaved2"
              stroke="#82ca9d"
              name={getOptionLabel(1)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonCharts;
