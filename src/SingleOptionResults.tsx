import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

interface SingleOptionResultsProps {
  result: MortgageCalculationResult;
  option: {
    termYears: number;
    interestRate: number;
    annualOverpaymentPercentage: number;
  };
}

const SingleOptionResults: React.FC<SingleOptionResultsProps> = ({
  result,
  option,
}) => {
  const formatCurrency = (value: number): string => `£${value.toFixed(2)}`;

  // Calculate baseline interest to date
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

  // Transform monthly payments data for charts
  const monthlyRate = option.interestRate / 100 / 12;

  const chartData = result.monthlyPayments.map((payment, index) => {
    const baselineInterest = calculateBaselineInterestToDate(
      result.monthlyPayments[0].remaining,
      monthlyRate,
      result.baseMonthlyPayment,
      index
    );

    const actualInterest = result.monthlyPayments
      .slice(0, index + 1)
      .reduce((sum, p) => sum + p.interest, 0);

    const interestSaved = baselineInterest - actualInterest;

    return {
      month: payment.month,
      balance: payment.remaining,
      payment: payment.payment,
      interestSaved: interestSaved,
    };
  });

  const commonChartProps = {
    width: 600,
    height: 300,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  };

  const getOptionLabel = () =>
    `${option.termYears}yr/${option.interestRate}%/${option.annualOverpaymentPercentage}%`;

  return (
    <div className="space-y-8">
      {/* Summary Card */}
      <Card className="bg-gray-800">
        <CardHeader>
          <CardTitle>Mortgage Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Base Monthly Payment</div>
              <div className="text-lg font-semibold">
                {formatCurrency(result.baseMonthlyPayment)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Total Interest Saved</div>
              <div className="text-lg font-semibold text-green-400">
                {formatCurrency(result.interestSaved)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Remaining Balance</div>
              <div className="text-lg font-semibold">
                {formatCurrency(result.remainingBalance)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Equity Built</div>
              <div className="text-lg font-semibold text-blue-400">
                {formatCurrency(result.equityBuilt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remaining Balance Chart */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Remaining Balance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} {...commonChartProps}>
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
              dataKey="balance"
              stroke="#8884d8"
              name={getOptionLabel()}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Payments Chart */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Monthly Payments</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} {...commonChartProps}>
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
              dataKey="payment"
              stroke="#8884d8"
              name={getOptionLabel()}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interest Saved Chart */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">
          Cumulative Interest Saved Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} {...commonChartProps}>
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
              dataKey="interestSaved"
              stroke="#8884d8"
              name={getOptionLabel()}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SingleOptionResults;
