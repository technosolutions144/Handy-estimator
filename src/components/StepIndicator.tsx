import { Check } from 'lucide-react';

interface Step {
  label: string;
  shortLabel: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
              <div
                className={`
                  w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-teal-700 text-white' : ''}
                  ${isCurrent ? 'bg-teal-700 text-white ring-4 ring-teal-100' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  isCurrent ? 'text-teal-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-px flex-1 mx-1 sm:mx-3 transition-colors duration-300 ${
                  isCompleted ? 'bg-teal-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
