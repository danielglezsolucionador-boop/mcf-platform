'use client';

import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PlanBadge from '@/components/dashboard/PlanBadge';
import { usePlan } from '@/hooks/usePlan';
import { Plan, PLAN_LEVEL } from '@/components/dashboard/types';

interface DiagnosticoTipo {
  id: string;
  emoji: string;
  color: string;
  colorLight: string;
  colorBorder: string;
  titulo: string;
  descripcion: string;
  detalle: string[];
  planRequerido: 'empresario' | 'pro';
  tiempoEstimado: string;
  href: string;
}

const DIAGNOSTICOS: DiagnosticoTipo[] = [
  {
    id: 'financiero',
    emoji: '🟢',
    color: '#22C55E',
    colorLight: '#F0FDF4',
    colorBorder: '#BBF7D0',
    titulo: 'Diagnóstico Financiero',
    descripcion: 'Analiza tu liquidez, rentabilidad y endeudamiento',
    detalle: [
      'Ratio de liquidez',
      'Rentabilidad operativa',
      'Nivel de endeudamiento',
      'Análisis de flujo de caja',
    ],
    planRequerido: 'empresario',
    tiempoEstimado: '3 min',
    href: '/diagnostico/financiero',
  },
  {
    id: 'contable',
    emoji: '📚',
    color: '#4A90D9',
    colorLight: '#EFF6FF',
    colorBorder: '#BFDBFE',
    titulo: 'Diagnóstico Contable',
    descripcion: 'Detecta errores, clasificaciones y problemas en tus registros',
    detalle: [
      'Calidad del registro contable',
      'Control de documentos',
      'Conciliación bancaria',
      'Separación de gastos',
    ],
    planRequerido: 'empresario',
    tiempoEstimado: '5 min',
    href: '/diagnostico/contable',
  },
  {
    id: 'tributario',
    emoji: '🏛️',
    color: '#E63946',
    colorLight: '#FFF1F2',
    colorBorder: '#FECDD3',
    titulo: 'Diagnóstico Tributario',
    descripcion: 'Auditoría forense de 12 meses + riesgo de fiscalización SUNAT',
    detalle: [
      'Análisis de 12 meses de declaraciones',
      'Detección de inconsistencias IGV',
      'Índice de riesgo de fiscalización',
      'Alertas de deuda tributaria',
    ],
    planRequerido: 'pro',
    tiempoEstimado: '8 min',
    href: '/diagnostico/tributario',
  },
];

export default function DiagnosticoPage() {
  const [plan, setPlan] = usePlan();
  const router = useRouter();

  const handleIniciar = (diag: DiagnosticoTipo) => {
    if (PLAN_LEVEL[plan] < PLAN_LEVEL[diag.planRequerido]) return;
    router.push(diag.href);
  };

  return (
    <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#1B3A6B' }}>
            ¿Qué diagnóstico quieres hacer hoy?
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona el área que deseas analizar. Los resultados son confidenciales y solo los ves tú.
          </p>
        </div>

        {/* Resumen de último diagnóstico */}
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3 border"
          style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}
        >
          <span className="text-xl">📅</span>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Último diagnóstico:</span> Hace 30 días · Índice IIE: 72/100 · 3 alertas activas
          </p>
          <button className="ml-auto text-xs font-semibold underline text-amber-700 whitespace-nowrap">
            Ver historial
          </button>
        </div>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DIAGNOSTICOS.map((diag) => {
            const bloqueado = PLAN_LEVEL[plan] < PLAN_LEVEL[diag.planRequerido];
            return (
              <DiagnosticoCard
                key={diag.id}
                diag={diag}
                bloqueado={bloqueado}
                onIniciar={() => handleIniciar(diag)}
              />
            );
          })}
        </div>

        {/* Tip */}
        <div
          className="rounded-2xl p-4 flex items-start gap-3 border"
          style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}
        >
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-green-800">
              Recomendación: empieza por el diagnóstico financiero
            </p>
            <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
              El diagnóstico financiero tarda solo 3 minutos y te da una visión inmediata del estado de tu empresa.
              Es el punto de partida ideal para nuevos usuarios de MCF.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* ---- Tarjeta de diagnóstico ---- */
function DiagnosticoCard({
  diag,
  bloqueado,
  onIniciar,
}: {
  diag: DiagnosticoTipo;
  bloqueado: boolean;
  onIniciar: () => void;
}) {
  return (
    <div
      className="rounded-2xl border-2 overflow-hidden flex flex-col transition-all duration-200"
      style={{
        borderColor: bloqueado ? '#E5E7EB' : diag.colorBorder,
        background: bloqueado ? '#FAFAFA' : diag.colorLight,
        opacity: bloqueado ? 0.8 : 1,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{
          background: bloqueado
            ? 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)'
            : `linear-gradient(135deg, ${diag.color}15 0%, ${diag.color}25 100%)`,
          borderBottom: `2px solid ${bloqueado ? '#E5E7EB' : diag.colorBorder}`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-3xl">{diag.emoji}</span>
          <PlanBadge plan={diag.planRequerido} size="sm" />
        </div>
        <h3
          className="font-black text-base mt-2 leading-tight"
          style={{ color: bloqueado ? '#9CA3AF' : '#1B3A6B' }}
        >
          {diag.titulo}
        </h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: bloqueado ? '#D1D5DB' : '#6B7280' }}>
          {diag.descripcion}
        </p>
      </div>

      {/* Detalle */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        <ul className="flex flex-col gap-1.5">
          {diag.detalle.map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs" style={{ color: bloqueado ? '#D1D5DB' : '#4B5563' }}>
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: bloqueado ? '#D1D5DB' : diag.color }}
              />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-gray-400">⏱ {diag.tiempoEstimado}</span>
          {bloqueado && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
              style={{ background: '#FEE2E2', color: '#E63946' }}
            >
              🔒 Bloqueado
            </span>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={onIniciar}
          disabled={bloqueado}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={
            bloqueado
              ? { background: '#F3F4F6', color: '#D1D5DB' }
              : {
                  background: `linear-gradient(135deg, ${diag.color} 0%, ${diag.color}CC 100%)`,
                  color: 'white',
                  boxShadow: `0 4px 14px ${diag.color}40`,
                }
          }
        >
          {bloqueado ? (
            <>
              <span>🔒</span>
              Requiere {diag.planRequerido === 'pro' ? 'Plan Pro' : 'Plan Empresario'}
            </>
          ) : (
            `Iniciar diagnóstico`
          )}
        </button>
      </div>
    </div>
  );
}
