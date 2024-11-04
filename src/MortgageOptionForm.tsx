import React from "react";

export interface SharedMortgageDetails {
  principal: number;
  maxMonthlyPayment: number;
  fixPeriod: number;
}

export interface MortgageOption {
  termYears: number;
  interestRate: number;
  annualOverpaymentPercentage: number;
}

interface SharedDetailsFormProps {
  details: SharedMortgageDetails;
  onChange: (field: keyof SharedMortgageDetails, value: number) => void;
}

interface MortgageOptionFormProps {
  option: MortgageOption;
  index: number;
  onChange: (index: number, field: keyof MortgageOption, value: number) => void;
}

export const SharedDetailsForm: React.FC<SharedDetailsFormProps> = ({
  details,
  onChange,
}) => {
  return (
    <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold">Loan Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm mb-1">Principal (£)</label>
          <input
            type="number"
            value={details.principal}
            onChange={(e) => onChange("principal", parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm mb-1">
            Desired Monthly Payment (£)
          </label>
          <input
            type="number"
            value={details.maxMonthlyPayment}
            onChange={(e) =>
              onChange("maxMonthlyPayment", parseFloat(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col sm:col-span-2 lg:col-span-1">
          <label className="block text-sm mb-1">Fix Period (Years)</label>
          <input
            type="number"
            value={details.fixPeriod}
            onChange={(e) => onChange("fixPeriod", parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export const MortgageOptionForm: React.FC<MortgageOptionFormProps> = ({
  option,
  index,
  onChange,
}) => {
  return (
    <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold">Option {index + 1}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm mb-1">Term (Years)</label>
          <input
            type="number"
            value={option.termYears}
            onChange={(e) =>
              onChange(index, "termYears", parseFloat(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm mb-1">Interest Rate (%)</label>
          <input
            type="number"
            value={option.interestRate}
            onChange={(e) =>
              onChange(index, "interestRate", parseFloat(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col sm:col-span-2 lg:col-span-1">
          <label className="block text-sm mb-1">
            Annual Overpayment Limit (%)
          </label>
          <input
            type="number"
            value={option.annualOverpaymentPercentage}
            onChange={(e) =>
              onChange(
                index,
                "annualOverpaymentPercentage",
                parseFloat(e.target.value)
              )
            }
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
