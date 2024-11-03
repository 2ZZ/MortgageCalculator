// mortgageCalculations.ts
import {
  MortgageOption,
  MortgageCalculationResult,
  MonthlyPayment,
  PaymentCalculation,
} from "./types";

const calculateBaseMonthly = (
  principal: number,
  termYears: number,
  monthlyRate: number
): number => {
  const numPayments = termYears * 12;

  // Handle zero interest rate specially
  if (monthlyRate === 0) {
    return principal / numPayments;
  }

  // Standard mortgage payment formula
  return (
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
};

// Calculate interest paid during fix period with no overpayments
const calculateBaselineInterest = (
  principal: number,
  baseMonthly: number,
  monthlyRate: number,
  fixPeriodMonths: number
): number => {
  // Handle zero interest rate
  if (monthlyRate === 0) {
    return 0;
  }

  let totalInterest = 0;
  let balance = principal;

  for (let month = 1; month <= fixPeriodMonths; month++) {
    const monthlyInterest = balance * monthlyRate;
    totalInterest += monthlyInterest;
    balance = balance + monthlyInterest - baseMonthly;
  }

  return totalInterest;
};

const calculateMonthlyPayment = (
  remainingBalance: number,
  monthlyRate: number,
  baseMonthly: number,
  maxMonthlyPayment: number,
  annualOverpaymentLimit: number,
  currentYearOverpayment: number
): PaymentCalculation => {
  // Handle zero interest rate
  const monthlyInterest =
    monthlyRate === 0 ? 0 : remainingBalance * monthlyRate;

  const idealPayment = remainingBalance + monthlyInterest;

  // First, limit by monthly maximum
  const paymentAfterMonthlyLimit = Math.min(maxMonthlyPayment, idealPayment);
  const limitedByMonthly = Math.max(0, idealPayment - paymentAfterMonthlyLimit);

  // Calculate potential overpayment
  const potentialOverpayment = Math.max(
    0,
    paymentAfterMonthlyLimit - baseMonthly
  );

  // Then, limit by annual overpayment cap
  let actualPayment: number;
  let limitedByAnnual = 0;

  if (currentYearOverpayment + potentialOverpayment > annualOverpaymentLimit) {
    const allowedOverpayment = Math.max(
      0,
      annualOverpaymentLimit - currentYearOverpayment
    );
    actualPayment = baseMonthly + allowedOverpayment;
    limitedByAnnual = paymentAfterMonthlyLimit - actualPayment;
  } else {
    actualPayment = paymentAfterMonthlyLimit;
  }

  const actualOverpayment = actualPayment - baseMonthly;

  // Ensure all calculated values are finite and rounded to avoid floating point errors
  return {
    basePayment: Number(baseMonthly.toFixed(2)),
    idealPayment: Number(idealPayment.toFixed(2)),
    monthlyInterest: Number(monthlyInterest.toFixed(2)),
    limitedByMonthly: Number(limitedByMonthly.toFixed(2)),
    limitedByAnnual: Number(limitedByAnnual.toFixed(2)),
    actualPayment: Number(actualPayment.toFixed(2)),
    actualOverpayment: Number(actualOverpayment.toFixed(2)),
  };
};

export const calculateMortgagePeriod = (
  option: MortgageOption,
  analysisYears: number
): MortgageCalculationResult => {
  const monthlyRate = option.interestRate / 100 / 12;
  const baseMonthly = calculateBaseMonthly(
    option.principal,
    option.termYears,
    monthlyRate
  );

  // Calculate baseline interest (without overpayments) for fix period
  const fixPeriodMonths = analysisYears * 12;
  const baselineInterest = calculateBaselineInterest(
    option.principal,
    baseMonthly,
    monthlyRate,
    fixPeriodMonths
  );

  let remainingBalance = option.principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let monthlyPayments: MonthlyPayment[] = [];
  let currentYearOverpayment = 0;
  let totalOverpayments = 0;
  let totalLimitedByMonthly = 0;
  let totalLimitedByAnnual = 0;
  const totalMonths = analysisYears * 12;

  let annualOverpaymentLimit = 0;

  for (let month = 1; month <= totalMonths; month++) {
    // Reset annual overpayment tracking at start of each year
    if (month % 12 === 1) {
      annualOverpaymentLimit =
        remainingBalance * (option.annualOverpaymentPercentage / 100);
      currentYearOverpayment = 0;
    }

    const payment = calculateMonthlyPayment(
      remainingBalance,
      monthlyRate,
      baseMonthly,
      option.maxMonthlyPayment,
      annualOverpaymentLimit,
      currentYearOverpayment
    );

    // Update running totals
    if (payment.actualOverpayment > 0) {
      currentYearOverpayment += payment.actualOverpayment;
    }

    totalLimitedByMonthly += payment.limitedByMonthly;
    totalLimitedByAnnual += payment.limitedByAnnual;

    if (month % 12 === 0) {
      totalOverpayments += currentYearOverpayment;
    }

    remainingBalance =
      remainingBalance + payment.monthlyInterest - payment.actualPayment;
    totalInterest += payment.monthlyInterest;
    totalPaid += payment.actualPayment;

    // Ensure remainingBalance never goes below 0
    remainingBalance = Math.max(0, Number(remainingBalance.toFixed(2)));

    monthlyPayments.push({
      month,
      payment: payment.actualPayment,
      interest: payment.monthlyInterest,
      principal: Number(
        (payment.actualPayment - payment.monthlyInterest).toFixed(2)
      ),
      remaining: remainingBalance,
      overpayment: payment.actualOverpayment,
      limitedByMonthly: payment.limitedByMonthly,
      limitedByAnnual: payment.limitedByAnnual,
    });
  }

  return {
    baseMonthlyPayment: Number(baseMonthly.toFixed(2)),
    totalInterestPaid: Number(totalInterest.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    remainingBalance: Number(remainingBalance.toFixed(2)),
    equityBuilt: Number((option.principal - remainingBalance).toFixed(2)),
    monthlyPayments,
    totalOverpayments: Number(totalOverpayments.toFixed(2)),
    totalLimitedByAnnual: Number(totalLimitedByAnnual.toFixed(2)),
    analysisPeriodYears: analysisYears,
    paymentLimitations: {
      totalLimitedByMonthly: Number(totalLimitedByMonthly.toFixed(2)),
      totalLimitedByAnnual: Number(totalLimitedByAnnual.toFixed(2)),
    },
    baselineInterest: Number(baselineInterest.toFixed(2)),
    interestSaved: Number((baselineInterest - totalInterest).toFixed(2)),
  };
};
