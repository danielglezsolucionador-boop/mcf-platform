'use client';

import LockedBlock from '../LockedBlock';
import { Plan } from '../types';

interface Block2Props {
  plan: Plan;
  onUpgrade: () => void;
}

const AREAS = [
  {
    area: 'Finanzas',
    emoji: '💰',
    estado: 'Saludable',
    mensaje: 'Tu flujo de caja es positivo y tienes reservas para 3 meses.',
    color: '#22C55E',
    colorLight: '#F0FDF4',
    colorBorder: '#BBF7D0',
    indicator: '🟢',
    pct: 82,
  },
  {
    area: 'Contabilidad',
    emoji: '📒',
    estado: 'Atención',
    mensaje: 'Tienes 3 facturas sin registrar de los últimos 30 días.',
    color: '#FBBF24',
    colorLight: '#FFFBEB',
    colorBorder: '#FDE68A',
    indicator: '🟡',
    pct: 61,
  },
  {
    area: 'Impuestos',
    emoji: '🧾',
    estado: 'Riesgo',
    mensaje: 'Tu PDT vence en 5 días. Aún no has presentado el periodo anterior.',
    color: '#E63946',
    colorLight: '#FFF1F2',
    colorBorder: '#FECDD3',
    indicator: '🔴',
    pct: 34,
  },
];

function SemaforoContent() {
  return (
    <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {AREAS.map((item) => (
        <div
          key={item.area}
          className="rounded-xl p-4 flex flex-col gap-2.5 border-2"
          style={{ background: item.colorLight, borderColor: item.colorBorder }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.emoji}</span>
              <span className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
                {item.area}
              </span>
            </div>
            <span className="text-xl">{item.indicator}</span>
          </div>

          {/* Estado */}
          <div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: item.color + '22', color: item.color }}
            >
              {item.estado}
            </span>
          </div>

          {/* Barra */}
          <div className="h-1.5 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${item.pct}%`, background: item.color }}
            />
          </div>

          {/* Mensaje */}
          <p className="text-xs text-gray-600 leading-relaxed">{item.mensaje}</p>

          {/* Acción */}
          <button
            className="text-xs font-semibold self-start underline transition-opacity hover:opacity-70"
            style={{ color: item.color }}
          >
            Ver detalle →
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Block2Semaforo({ plan, onUpgrade }: Block2Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-2" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            🚦 Semáforo de Salud Empresarial
          </h2>
          <p className="text-xs text-gray-400">3 áreas monitoreadas</p>
        </div>
        <div className="flex gap-1">
          <span className="text-base">🟢</span>
          <span className="text-base">🟡</span>
          <span className="text-base">🔴</span>
        </div>
      </div>

      <LockedBlock requiredPlan="empresario" currentPlan={plan} onUpgrade={onUpgrade}>
        <SemaforoContent />
      </LockedBlock>
    </div>
  );
}
