#!/usr/bin/env python3

class MortgageCalculator:
    def __init__(self, principal, term_years, interest_rate, max_monthly_payment,
                 annual_overpayment_percentage=10):
        """
        Initialize mortgage calculator with loan parameters.

        Args:
            principal (float): Initial loan amount
            term_years (int): Total loan term in years
            interest_rate (float): Annual interest rate as percentage
            max_monthly_payment (float): Maximum monthly payment allowed
            annual_overpayment_percentage (float): Maximum annual overpayment as percentage of remaining balance
        """
        self.principal = principal
        self.term_years = term_years
        self.interest_rate = interest_rate
        self.max_monthly_payment = max_monthly_payment
        self.annual_overpayment_percentage = annual_overpayment_percentage
        self.monthly_rate = interest_rate / 100 / 12
        self.base_monthly = self._calculate_base_monthly()

    def _calculate_base_monthly(self):
        """Calculate the base monthly payment for the full term."""
        num_payments = self.term_years * 12
        return self.principal * (self.monthly_rate * (1 + self.monthly_rate)
                                 ** num_payments) / ((1 + self.monthly_rate)**num_payments - 1)

    def calculate_period(self, analysis_years):
        """
        Calculate mortgage payments and statistics for a specified period.

        Args:
            analysis_years (int): Number of years to analyze

        Returns:
            dict: Mortgage statistics and payment details
        """
        remaining_balance = self.principal
        total_interest = 0
        total_paid = 0
        monthly_payments = []

        # Track payment limitations
        current_year_overpayment = 0
        total_overpayments = 0
        total_limited_by_annual = 0

        total_months = analysis_years * 12

        for month in range(1, total_months + 1):
            # Calculate annual overpayment limit at start of each year
            if month % 12 == 1:  # First month of year
                annual_overpayment_limit = remaining_balance * \
                    (self.annual_overpayment_percentage / 100)
                current_year_overpayment = 0

            # Calculate interest for this month
            monthly_interest = remaining_balance * self.monthly_rate

            # Calculate ideal payment (if no limits)
            ideal_payment = remaining_balance + monthly_interest

            # Apply monthly payment limit
            payment_after_monthly_limit = min(
                self.max_monthly_payment, ideal_payment)

            # Apply annual overpayment limit
            overpayment = max(
                0, payment_after_monthly_limit - self.base_monthly)
            if current_year_overpayment + overpayment > annual_overpayment_limit:
                allowed_overpayment = max(
                    0, annual_overpayment_limit - current_year_overpayment)
                actual_payment = self.base_monthly + allowed_overpayment
                total_limited_by_annual += payment_after_monthly_limit - actual_payment
            else:
                actual_payment = payment_after_monthly_limit

            # Track overpayments
            actual_overpayment = actual_payment - self.base_monthly
            if actual_overpayment > 0:
                current_year_overpayment += actual_overpayment

            # Track year-end totals
            if month % 12 == 0:
                total_overpayments += current_year_overpayment

            # Update balances
            remaining_balance = remaining_balance + monthly_interest - actual_payment
            total_interest += monthly_interest
            total_paid += actual_payment

            monthly_payments.append({
                'month': month,
                'payment': actual_payment,
                'interest': monthly_interest,
                'principal': actual_payment - monthly_interest,
                'remaining': remaining_balance,
                'overpayment': actual_overpayment,
                'limited_by_annual': payment_after_monthly_limit - actual_payment if payment_after_monthly_limit > actual_payment else 0
            })

        return {
            'base_monthly_payment': self.base_monthly,
            'total_interest_paid': total_interest,
            'total_paid': total_paid,
            'remaining_balance': remaining_balance,
            'equity_built': self.principal - remaining_balance,
            'monthly_payments': monthly_payments,
            'total_overpayments': total_overpayments,
            'total_limited_by_annual': total_limited_by_annual,
            'analysis_period_years': analysis_years
        }


def compare_mortgage_options(analysis_years, options):
    """
    Compare multiple mortgage options over a specified period.

    Args:
        analysis_years (int): Number of years to analyze
        options (list): List of dictionaries containing mortgage parameters

    Returns:
        None: Prints comparison results
    """
    results = []

    for idx, option in enumerate(options, 1):
        calculator = MortgageCalculator(
            principal=option['principal'],
            term_years=option['term_years'],
            interest_rate=option['interest_rate'],
            max_monthly_payment=option['max_monthly_payment'],
            annual_overpayment_percentage=option.get(
                'annual_overpayment_percentage', 10)
        )
        results.append(calculator.calculate_period(analysis_years))

        print(f"\nOption {idx} ({option['term_years']}-year term):")
        print(
            f"Base monthly payment: £{results[-1]['base_monthly_payment']:.2f}")
        print(
            f"Total interest paid: £{results[-1]['total_interest_paid']:.2f}")
        print(f"Total amount paid: £{results[-1]['total_paid']:.2f}")
        print(f"Remaining balance: £{results[-1]['remaining_balance']:.2f}")
        print(f"Equity built: £{results[-1]['equity_built']:.2f}")
        print(
            f"Total overpayments made: £{results[-1]['total_overpayments']:.2f}")
        print("\nPayment Limitations:")
        print(
            f"Total payments limited by annual cap: £{results[-1]['total_limited_by_annual']:.2f}")

    if len(results) > 1:
        print(f"\nDifference in position after {analysis_years} years:")
        print("Difference in total interest paid: £{:.2f}".format(
            results[0]['total_interest_paid'] - results[1]['total_interest_paid']))
        print("Difference in remaining balance: £{:.2f}".format(
            results[0]['remaining_balance'] - results[1]['remaining_balance']))
        print("Difference in equity built: £{:.2f}".format(
            results[1]['equity_built'] - results[0]['equity_built']))


def main():
    # Example usage
    options = [
        {
            'principal': 200000,
            'term_years': 20,
            'interest_rate': 4.08,
            'max_monthly_payment': 1700,
            'annual_overpayment_percentage': 10
        },
        {
            'principal': 200000,
            'term_years': 10,
            'interest_rate': 4.08,
            'max_monthly_payment': 1700,
            'annual_overpayment_percentage': 10
        }
    ]

    analysis_years = 5
    compare_mortgage_options(analysis_years, options)


if __name__ == "__main__":
    main()
