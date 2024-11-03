import { calculateMortgagePeriod } from "./mortgageCalculations";

describe("Mortgage Calculations", () => {
  describe("Basic Monthly Payment Calculation", () => {
    it("should calculate correct base monthly payment", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 3,
        maxMonthlyPayment: 1000,
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 5);
      expect(result.baseMonthlyPayment).toBeCloseTo(474.21, 2);
    });

    it("should handle edge case of very short term", () => {
      const option = {
        principal: 100000,
        termYears: 1,
        interestRate: 3,
        maxMonthlyPayment: 10000,
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 1);

      // For 1 year term at 3%:
      // Monthly rate = 3% / 12 = 0.25%
      // Using formula: P * (r(1+r)^n)/((1+r)^n-1)
      // where P = 100000, r = 0.0025, n = 12
      expect(result.baseMonthlyPayment).toBeCloseTo(8469.37, 2);
    });
  });

  describe("Overpayment Limitations", () => {
    it("should respect annual overpayment percentage limit", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 3,
        maxMonthlyPayment: 1000, // High enough to allow overpayments
        annualOverpaymentPercentage: 10, // 10% annual overpayment limit
      };

      const result = calculateMortgagePeriod(option, 5);

      // Maximum overpayment in first year should be 10% of initial balance
      const totalOverpaymentsFirstYear = result.monthlyPayments
        .slice(0, 12)
        .reduce((sum, payment) => sum + payment.overpayment, 0);

      expect(totalOverpaymentsFirstYear).toBeLessThanOrEqual(10000); // 10% of 100000
    });

    it("should respect monthly payment limit", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 3,
        maxMonthlyPayment: 500, // Lower than required base payment
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 5);

      // No monthly payment should exceed the max
      const exceedsLimit = result.monthlyPayments.some(
        (payment) => payment.payment > 500
      );

      expect(exceedsLimit).toBe(false);
    });
  });

  describe("Interest Calculations", () => {
    it("should calculate total interest correctly for fix period", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 3,
        maxMonthlyPayment: 474.21, // Exact base payment - no overpayments
        annualOverpaymentPercentage: 0,
      };

      const result = calculateMortgagePeriod(option, 5);

      // In first 5 years with no overpayments:
      // Total paid should be 474.21 * 60 = 28,452.60
      // Total interest can be calculated by subtracting principal reduction
      const expectedTotalPayments = 474.21 * 60;
      expect(result.totalPaid).toBeCloseTo(expectedTotalPayments, 2);

      // Remaining balance after 5 years should be less than initial principal
      expect(result.remainingBalance).toBeLessThan(100000);
      expect(result.remainingBalance).toBeGreaterThan(85000); // Rough estimate
    });

    it("should show interest savings with overpayments", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 3,
        maxMonthlyPayment: 574.21, // £100 more than base payment
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 5);

      // With overpayments:
      // - Total interest paid should be less than baseline
      // - Remaining balance should be lower than without overpayments
      expect(result.interestSaved).toBeGreaterThan(0);
      expect(result.remainingBalance).toBeLessThan(85000); // Compared to previous test
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero interest rate", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 0,
        maxMonthlyPayment: 1000,
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 5);

      // Base monthly should be simply principal divided by total months
      expect(result.baseMonthlyPayment).toBeCloseTo(333.33, 2); // 100000 / (25 * 12)
      expect(result.totalInterestPaid).toBe(0);
    });

    it("should handle very high interest rates", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 50, // 50% interest
        maxMonthlyPayment: 5000,
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 5);

      // Base payment should be very high but still calculable
      expect(result.baseMonthlyPayment).toBeGreaterThan(4000);
      expect(Number.isFinite(result.baseMonthlyPayment)).toBe(true);
    });
  });

  describe("Analysis Period Calculations", () => {
    it("should only calculate for specified analysis period", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 3,
        maxMonthlyPayment: 1000,
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 2); // 2 year analysis

      // Should only have 24 monthly payments
      expect(result.monthlyPayments.length).toBe(24);
      expect(result.analysisPeriodYears).toBe(2);
    });

    it("should handle analysis period longer than term", () => {
      const option = {
        principal: 100000,
        termYears: 5,
        interestRate: 3,
        maxMonthlyPayment: 2000,
        annualOverpaymentPercentage: 10,
      };

      const result = calculateMortgagePeriod(option, 10); // Analysis longer than term

      // Should still calculate for full analysis period
      expect(result.monthlyPayments.length).toBe(120);
      // Balance should be very low or zero by end
      expect(result.remainingBalance).toBeLessThan(100);
    });
  });

  describe("Payment Breakdown", () => {
    it("should break down payments into principal and interest correctly", () => {
      const option = {
        principal: 100000,
        termYears: 25,
        interestRate: 3,
        maxMonthlyPayment: 474.21,
        annualOverpaymentPercentage: 0,
      };

      const result = calculateMortgagePeriod(option, 5);

      // Test first payment breakdown
      const firstPayment = result.monthlyPayments[0];
      const expectedFirstInterest = 100000 * (3 / 100 / 12); // First month's interest

      expect(firstPayment.interest).toBeCloseTo(expectedFirstInterest, 2);
      expect(firstPayment.principal).toBeCloseTo(
        firstPayment.payment - expectedFirstInterest,
        2
      );

      // Sum of principal and interest should equal payment
      result.monthlyPayments.forEach((payment) => {
        expect(payment.principal + payment.interest).toBeCloseTo(
          payment.payment,
          2
        );
      });
    });
  });
});
