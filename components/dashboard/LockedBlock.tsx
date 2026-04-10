'use client';

import { Plan } from './types';

interface LockedBlockProps {
  children: React.ReactNode;
  requiredPlan: 'empresario' | 'pro';
  currentPlan: Plan;
  onUpgrade?: () => void;
}

const PLAN_NAMES = {
  empresario: 'Plan Empresario',
  pro: 'Plan Pro',
};

export default function LockedBlock({
  children,
  requiredPlan,
  currentPlan,
  onUpgrade,
}: LockedBlockProps) {
  const isLocked =
    (requiredPlan === 'empresario' && currentPlan === 'estudiante') ||
    (requiredPlan === 'pro' && currentPlan !== 'pro');

  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Contenido desenfocado */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(3px)', opacity: 0.35 }}>
        {children}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl"
        style={{ background: 'rgba(248, 250, 252, 0.88)', backdropFilter: 'blur(2px)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', border: '2px solid #CBD5E1' }}
        >
          <span className="text-2xl">🔒</span>
        </div>
        <div className="text-center px-4">
          <p className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            Disponible en {PLAN_NAMES[requiredPlan]}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Actualiza tu plan para desbloquear esta función
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="py-2.5 px-5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
          style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}
        >
          Actualizar plan
        </button>
      </div>
    </div>
  );
}
