export interface MortgageOption {
  principal: number;
  termYears: number;
  interestRate: number;
  maxMonthlyPayment: number;
  annualOverpaymentPercentage: number;
}

export interface MonthlyPayment {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remaining: number;
  overpayment: number;
  limitedByAnnual: number;
  limitedByMonthly: number;
}

export interface MortgageCalculationResult {
  baseMonthlyPayment: number;
  totalInterestPaid: number;
  totalPaid: number;
  remainingBalance: number;
  equityBuilt: number;
  monthlyPayments: MonthlyPayment[];
  totalOverpayments: number;
  totalLimitedByAnnual: number;
  analysisPeriodYears: number;
  paymentLimitations: PaymentLimitations;
  baselineInterest: number;
  interestSaved: number;
}

export interface PaymentLimitations {
  totalLimitedByMonthly: number;
  totalLimitedByAnnual: number;
}

export interface PaymentCalculation {
  basePayment: number;
  idealPayment: number;
  monthlyInterest: number;
  limitedByMonthly: number;
  limitedByAnnual: number;
  actualPayment: number;
  actualOverpayment: number;
}

export interface MortgageSummaryProps {
  results: MortgageCalculationResult[];
  options: {
    termYears: number;
    interestRate: number;
    annualOverpaymentPercentage: number;
  }[];
}
