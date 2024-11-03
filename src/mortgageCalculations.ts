// mortgageCalculations.ts
import {
  MortgageOption,
  MortgageCalculationResult,
  MonthlyPayment,
  PaymentLimitations,
  PaymentCalculation,
} from "./types";

const calculateBaseMonthly = (
  principal: number,
  termYears: number,
  monthlyRate: number
): number => {
  const numPayments = termYears * 12;
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
  const monthlyInterest = remainingBalance * monthlyRate;
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

  return {
    basePayment: baseMonthly,
    idealPayment,
    monthlyInterest,
    limitedByMonthly,
    limitedByAnnual,
    actualPayment,
    actualOverpayment,
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

    monthlyPayments.push({
      month,
      payment: payment.actualPayment,
      interest: payment.monthlyInterest,
      principal: payment.actualPayment - payment.monthlyInterest,
      remaining: remainingBalance,
      overpayment: payment.actualOverpayment,
      limitedByMonthly: payment.limitedByMonthly,
      limitedByAnnual: payment.limitedByAnnual,
    });
  }

  const paymentLimitations: PaymentLimitations = {
    totalLimitedByMonthly,
    totalLimitedByAnnual,
  };

  // Calculate actual interest savings during fix period
  const interestSaved = baselineInterest - totalInterest;

  return {
    baseMonthlyPayment: baseMonthly,
    totalInterestPaid: totalInterest,
    totalPaid,
    remainingBalance,
    equityBuilt: option.principal - remainingBalance,
    monthlyPayments,
    totalOverpayments,
    paymentLimitations,
    analysisPeriodYears: analysisYears,
    totalLimitedByAnnual: totalLimitedByAnnual,
    baselineInterest,
    interestSaved,
  };
};
