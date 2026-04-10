'use client';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Label del paso actual */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
          {labels[currentStep - 1]}
        </p>
        <p className="text-xs font-medium text-gray-400">
          Paso {currentStep} de {totalSteps}
        </p>
      </div>

      {/* Barra de pasos */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isDone = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={step} className="flex items-center gap-2 flex-1">
              {/* Círculo numerado */}
              <div className="flex-shrink-0 relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm"
                  style={{
                    background: isDone
                      ? '#22C55E'
                      : isActive
                      ? 'linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)'
                      : '#E5E7EB',
                    color: isDone || isActive ? 'white' : '#9CA3AF',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {/* Anillo activo */}
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-full border-2 scale-125 opacity-30"
                    style={{ borderColor: '#4A90D9' }}
                  />
                )}
              </div>

              {/* Línea conectora (no en el último) */}
              {step < totalSteps && (
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E5E7EB' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: isDone ? '100%' : '0%',
                      background: 'linear-gradient(90deg, #22C55E, #4ADE80)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels de cada paso */}
      <div className="flex justify-between mt-2">
        {labels.map((label, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <span
              key={i}
              className="text-xs transition-colors duration-300"
              style={{
                color: isDone ? '#22C55E' : isActive ? '#1B3A6B' : '#9CA3AF',
                fontWeight: isActive || isDone ? 600 : 400,
                flex: 1,
                textAlign: i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center',
              }}
            >
              {label.split(' — ')[0]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
