'use client';

import LockedBlock from '../LockedBlock';
import { Plan } from '../types';

interface Block3Props {
  plan: Plan;
  onUpgrade: () => void;
}

const ALERTAS = [
  {
    id: 1,
    icon: '🚨',
    titulo: 'Alerta de flujo de caja',
    descripcion: 'Tu flujo de caja podría tener problemas en 60 días si los ingresos siguen igual.',
    tipo: 'crítico',
    color: '#E63946',
    colorLight: '#FFF1F2',
    colorBorder: '#FECDD3',
    fecha: 'Hoy',
  },
  {
    id: 2,
    icon: '⚠️',
    titulo: 'PDT mensual por vencer',
    descripcion: 'Tienes 5 días para presentar tu declaración mensual de IGV y Renta.',
    tipo: 'urgente',
    color: '#F59E0B',
    colorLight: '#FFFBEB',
    colorBorder: '#FDE68A',
    fecha: 'Hace 1 día',
  },
  {
    id: 3,
    icon: '💡',
    titulo: 'Oportunidad de ahorro',
    descripcion: 'Podrías ahorrar hasta S/. 1,200 anuales optimizando tus gastos deducibles.',
    tipo: 'info',
    color: '#4A90D9',
    colorLight: '#EFF6FF',
    colorBorder: '#BFDBFE',
    fecha: 'Hace 2 días',
  },
];

function AlertasContent() {
  return (
    <div className="p-5 flex flex-col gap-3">
      {ALERTAS.map((alerta) => (
        <div
          key={alerta.id}
          className="rounded-xl p-4 border-2 flex items-start gap-3"
          style={{ background: alerta.colorLight, borderColor: alerta.colorBorder }}
        >
          {/* Ícono */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: 'white' }}
          >
            {alerta.icon}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
                {alerta.titulo}
              </p>
              <span className="text-xs text-gray-400 flex-shrink-0">{alerta.fecha}</span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{alerta.descripcion}</p>
            <button
              className="mt-2 text-xs font-bold py-1.5 px-3 rounded-lg transition-all hover:opacity-80 active:scale-95"
              style={{ background: alerta.color, color: 'white' }}
            >
              Ver recomendación →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Block3Alertas({ plan, onUpgrade }: Block3Props) {
  const alertasCriticas = ALERTAS.filter((a) => a.tipo === 'crítico').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            🔔 Alertas Importantes
          </h2>
          <p className="text-xs text-gray-400">{ALERTAS.length} alertas activas</p>
        </div>
        {alertasCriticas > 0 && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#E63946', color: 'white' }}
          >
            {alertasCriticas} crítica
          </span>
        )}
      </div>

      <LockedBlock requiredPlan="empresario" currentPlan={plan} onUpgrade={onUpgrade}>
        <AlertasContent />
      </LockedBlock>
    </div>
  );
}
