'use client';

import LockedBlock from '../LockedBlock';
import { Plan, PLAN_LEVEL } from '../types';

interface Block5Props {
  plan: Plan;
  onUpgrade: () => void;
}

interface SimuladorBtn {
  id: string;
  emoji: string;
  titulo: string;
  descripcion: string;
  requiredPlan: 'empresario' | 'pro';
  color: string;
  colorLight: string;
}

const SIMULADORES: SimuladorBtn[] = [
  {
    id: 'inversion',
    emoji: '📈',
    titulo: 'Simular inversión',
    descripcion: 'Proyecta el retorno de una inversión a corto y largo plazo',
    requiredPlan: 'empresario',
    color: '#22C55E',
    colorLight: '#F0FDF4',
  },
  {
    id: 'prestamo',
    emoji: '🏦',
    titulo: 'Simular préstamo',
    descripcion: 'Calcula cuotas, intereses totales y flujo mensual',
    requiredPlan: 'empresario',
    color: '#4A90D9',
    colorLight: '#EFF6FF',
  },
  {
    id: 'contratacion',
    emoji: '👤',
    titulo: 'Simular contratación',
    descripcion: 'Costo real de contratar un empleado incluyendo beneficios',
    requiredPlan: 'pro',
    color: '#7C3AED',
    colorLight: '#F5F3FF',
  },
  {
    id: 'precios',
    emoji: '🏷️',
    titulo: 'Simular cambio de precios',
    descripcion: 'Impacto en ventas e ingresos al modificar tu lista de precios',
    requiredPlan: 'pro',
    color: '#F59E0B',
    colorLight: '#FFFBEB',
  },
];

function SimuladorContent({ plan }: { plan: Plan }) {
  const planLevel = PLAN_LEVEL[plan];

  return (
    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {SIMULADORES.map((sim) => {
        const requiredLevel = PLAN_LEVEL[sim.requiredPlan];
        const isAvailable = planLevel >= requiredLevel;

        return (
          <button
            key={sim.id}
            disabled={!isAvailable}
            className="rounded-xl p-4 flex items-start gap-3 text-left border-2 transition-all duration-150 group"
            style={{
              background: isAvailable ? sim.colorLight : '#F8FAFC',
              borderColor: isAvailable ? sim.color + '40' : '#E5E7EB',
              opacity: isAvailable ? 1 : 0.5,
              cursor: isAvailable ? 'pointer' : 'not-allowed',
            }}
          >
            {/* Ícono */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl transition-transform group-hover:scale-110"
              style={{ background: isAvailable ? sim.color + '20' : '#F3F4F6' }}
            >
              {sim.emoji}
            </div>

            {/* Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p
                  className="font-bold text-sm"
                  style={{ color: isAvailable ? '#1B3A6B' : '#9CA3AF' }}
                >
                  {sim.titulo}
                </p>
                {!isAvailable && <span className="text-xs">🔒</span>}
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{sim.descripcion}</p>
              {!isAvailable && (
                <p className="text-xs font-semibold mt-1" style={{ color: '#E63946' }}>
                  Requiere Plan {sim.requiredPlan === 'pro' ? 'Pro' : 'Empresario'}
                </p>
              )}
            </div>

            {/* Flecha */}
            {isAvailable && (
              <svg
                className="w-4 h-4 flex-shrink-0 mt-1 ml-auto opacity-40 transition-opacity group-hover:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke={sim.color}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function Block5Simulador({ plan, onUpgrade }: Block5Props) {
  const available = plan === 'pro' ? 4 : plan === 'empresario' ? 2 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            🎮 Acceso rápido al Simulador
          </h2>
          <p className="text-xs text-gray-400">
            {plan === 'estudiante'
              ? 'No disponible en tu plan'
              : `${available} de 4 simuladores disponibles`}
          </p>
        </div>
      </div>

      <LockedBlock requiredPlan="empresario" currentPlan={plan} onUpgrade={onUpgrade}>
        <SimuladorContent plan={plan} />
      </LockedBlock>
    </div>
  );
}
