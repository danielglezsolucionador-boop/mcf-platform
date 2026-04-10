'use client';

import LockedBlock from '../LockedBlock';
import { Plan } from '../types';

interface Block4Props {
  plan: Plan;
  onUpgrade: () => void;
}

const TODAS_LAS_RECOMENDACIONES = [
  {
    id: 1,
    titulo: 'Acogerte al Régimen MYPE Tributario',
    descripcion: 'Con tu nivel de ingresos actuales podrías reducir tu tasa de IR del 29.5% al 10%.',
    impacto: 'Ahorro estimado: S/. 4,200/año',
    impactoColor: '#22C55E',
    icono: '💰',
    esBasica: true,
  },
  {
    id: 2,
    titulo: 'Regularizar planilla de trabajadores',
    descripcion: 'Tienes 3 colaboradores sin contrato formal. Formalizarlos evita multas de hasta S/. 8,000.',
    impacto: 'Reduce riesgo de multa',
    impactoColor: '#E63946',
    icono: '👥',
    esBasica: true,
  },
  {
    id: 3,
    titulo: 'Implementar control de inventarios',
    descripcion: 'Un sistema de inventario básico puede reducir mermas hasta un 15% y mejorar tu margen.',
    impacto: 'Mejora de margen: +8%',
    impactoColor: '#4A90D9',
    icono: '📦',
    esBasica: false,
  },
  {
    id: 4,
    titulo: 'Solicitar financiamiento COFIDE',
    descripcion: 'Calificas para créditos a 8.5% anual vs el 28% que pagas actualmente con tarjeta.',
    impacto: 'Ahorro en intereses: S/. 2,800/año',
    impactoColor: '#22C55E',
    icono: '🏦',
    esBasica: false,
  },
  {
    id: 5,
    titulo: 'Digitalizar facturación electrónica',
    descripcion: 'Aún emites facturas físicas. La SUNAT multará con 1 UIT (S/. 5,150) desde enero.',
    impacto: 'Obligatorio desde enero 2025',
    impactoColor: '#F59E0B',
    icono: '🧾',
    esBasica: false,
  },
];

function RecomendacionesContent({ plan }: { plan: Plan }) {
  const recomendaciones =
    plan === 'pro'
      ? TODAS_LAS_RECOMENDACIONES
      : TODAS_LAS_RECOMENDACIONES.filter((r) => r.esBasica);

  return (
    <div className="p-5 flex flex-col gap-3">
      {plan === 'empresario' && (
        <div
          className="rounded-xl p-3 flex items-center gap-2 border"
          style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
        >
          <span className="text-sm">⭐</span>
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Plan Pro:</span> Accede a{' '}
            {TODAS_LAS_RECOMENDACIONES.length - 2} recomendaciones adicionales de IA
          </p>
        </div>
      )}

      {recomendaciones.map((rec, i) => (
        <div
          key={rec.id}
          className="rounded-xl p-4 border-2 flex items-start gap-3 transition-all hover:shadow-sm"
          style={{ borderColor: '#F1F5F9', background: 'white' }}
        >
          {/* Número */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
            style={{
              background: 'linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)',
              color: 'white',
            }}
          >
            {i + 1}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{rec.icono}</span>
              <div>
                <p className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
                  {rec.titulo}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rec.descripcion}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: rec.impactoColor + '18', color: rec.impactoColor }}
                  >
                    {rec.impacto}
                  </span>
                  <button
                    className="text-xs font-semibold underline transition-opacity hover:opacity-70"
                    style={{ color: '#4A90D9' }}
                  >
                    Cómo hacerlo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Block4Recomendaciones({ plan, onUpgrade }: Block4Props) {
  const count = plan === 'pro' ? TODAS_LAS_RECOMENDACIONES.length : 2;

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            🤖 Recomendaciones de IA
          </h2>
          <p className="text-xs text-gray-400">
            {plan === 'estudiante'
              ? 'No disponible en tu plan'
              : `${count} recomendaciones personalizadas`}
          </p>
        </div>
        {plan !== 'estudiante' && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: '#EFF6FF', color: '#1E40AF' }}
          >
            {count} activas
          </span>
        )}
      </div>

      <LockedBlock requiredPlan="empresario" currentPlan={plan} onUpgrade={onUpgrade}>
        <RecomendacionesContent plan={plan} />
      </LockedBlock>
    </div>
  );
}
