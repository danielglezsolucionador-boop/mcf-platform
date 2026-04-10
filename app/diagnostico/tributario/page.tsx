'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LEVEL } from '@/components/dashboard/types';

/* ---- Tipos ---- */
interface MesTributario {
  mes: string;
  mesCorto: string;
  ingresos: number;
  igv: number;
  renta: number;
  aTiempo: boolean;
}

/* ---- Mock data 12 meses (2024) ---- */
const MESES_MOCK: MesTributario[] = [
  { mes: 'Enero 2024',      mesCorto: 'Ene', ingresos: 45000, igv: 8100,  renta: 2250, aTiempo: true },
  { mes: 'Febrero 2024',    mesCorto: 'Feb', ingresos: 38000, igv: 6840,  renta: 1900, aTiempo: true },
  { mes: 'Marzo 2024',      mesCorto: 'Mar', ingresos: 52000, igv: 9360,  renta: 2600, aTiempo: false },
  { mes: 'Abril 2024',      mesCorto: 'Abr', ingresos: 41000, igv: 7380,  renta: 2050, aTiempo: true },
  { mes: 'Mayo 2024',       mesCorto: 'May', ingresos: 47000, igv: 8460,  renta: 2350, aTiempo: true },
  { mes: 'Junio 2024',      mesCorto: 'Jun', ingresos: 55000, igv: 9900,  renta: 2750, aTiempo: true },
  { mes: 'Julio 2024',      mesCorto: 'Jul', ingresos: 89000, igv: 11200, renta: 4450, aTiempo: false },
  { mes: 'Agosto 2024',     mesCorto: 'Ago', ingresos: 62000, igv: 11160, renta: 3100, aTiempo: true },
  { mes: 'Septiembre 2024', mesCorto: 'Sep', ingresos: 58000, igv: 10440, renta: 2900, aTiempo: true },
  { mes: 'Octubre 2024',    mesCorto: 'Oct', ingresos: 48000, igv: 8640,  renta: 2400, aTiempo: true },
  { mes: 'Noviembre 2024',  mesCorto: 'Nov', ingresos: 71000, igv: 12780, renta: 3550, aTiempo: true },
  { mes: 'Diciembre 2024',  mesCorto: 'Dic', ingresos: 93000, igv: 16740, renta: 4650, aTiempo: true },
];

function fmt(n: number) {
  return 'S/. ' + Math.round(n).toLocaleString('es-PE');
}

/* ---- Motor de auditoría forense ---- */
interface Irregularidad {
  mes?: string;
  tipo: string;
  descripcion: string;
  severidad: 'crítico' | 'importante' | 'moderado';
  impacto: string;
}

interface AuditoriaResult {
  riesgoScore: number;
  riesgoNivel: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
  riesgoColor: string;
  irregularidades: Irregularidad[];
  ratioIGVPromedio: number;
  tardanzas: number;
  mesesAnomalia: string[];
  recomendaciones: string[];
  totalIngresos: number;
  totalIGV: number;
  totalRenta: number;
}

function calcularAuditoria(meses: MesTributario[]): AuditoriaResult {
  let score = 0;
  const irregularidades: Irregularidad[] = [];
  const mesesAnomalia: string[] = [];

  const totalIngresos = meses.reduce((s, m) => s + m.ingresos, 0);
  const totalIGV = meses.reduce((s, m) => s + m.igv, 0);
  const totalRenta = meses.reduce((s, m) => s + m.renta, 0);
  const promIngreso = totalIngresos / 12;

  // ---- Factor 1: Tardanzas en declaraciones ----
  const tardanzas = meses.filter((m) => !m.aTiempo);
  tardanzas.forEach((m) => {
    score += 12;
    irregularidades.push({
      mes: m.mes,
      tipo: 'Declaración tardía',
      descripcion: `${m.mes}: Declaración presentada fuera de plazo.`,
      severidad: 'importante',
      impacto: `Multa estimada: ${fmt(m.ingresos * 0.005)} (0.5% de ingresos)`,
    });
  });

  // ---- Factor 2: Inconsistencias en ratio IGV/Ingresos ----
  // IGV en Perú = 18% del valor de venta. Ratio esperado ≈ 15.25% sobre precio final
  const IGV_ESPERADO_PCT = 0.1525;
  meses.forEach((m) => {
    const igvEsperado = m.ingresos * IGV_ESPERADO_PCT;
    const diferencia = Math.abs(m.igv - igvEsperado) / igvEsperado;
    if (diferencia > 0.2) { // > 20% de diferencia
      score += 8;
      mesesAnomalia.push(m.mesCorto);
      irregularidades.push({
        mes: m.mes,
        tipo: 'Inconsistencia IGV',
        descripcion: `${m.mes}: IGV declarado (${fmt(m.igv)}) difiere significativamente del esperado (${fmt(igvEsperado)}).`,
        severidad: diferencia > 0.4 ? 'crítico' : 'importante',
        impacto: `Diferencia: ${fmt(Math.abs(m.igv - igvEsperado))} · SUNAT puede requerir sustento`,
      });
    }
  });

  // ---- Factor 3: Variabilidad extrema de ingresos ----
  meses.forEach((m) => {
    const variacion = Math.abs(m.ingresos - promIngreso) / promIngreso;
    if (variacion > 0.6) { // > 60% del promedio
      score += 5;
      irregularidades.push({
        mes: m.mes,
        tipo: 'Pico de ingresos inusual',
        descripcion: `${m.mes}: Ingresos (${fmt(m.ingresos)}) son ${Math.round(variacion * 100)}% ${m.ingresos > promIngreso ? 'mayores' : 'menores'} al promedio mensual.`,
        severidad: 'moderado',
        impacto: 'SUNAT podría solicitar documentación sustentatoria',
      });
    }
  });

  // ---- Factor 4: Ratio renta/ingresos ----
  const ratioRenta = totalRenta / totalIngresos;
  if (ratioRenta < 0.03) {
    score += 10;
    irregularidades.push({
      tipo: 'Tasa efectiva de renta baja',
      descripcion: `Tu tasa efectiva de IR es ${(ratioRenta * 100).toFixed(1)}%, inferior al mínimo esperado.`,
      severidad: 'importante',
      impacto: 'Posible omisión de renta o uso indebido de deducciones',
    });
  }

  score = Math.min(100, score);
  const riesgoNivel: AuditoriaResult['riesgoNivel'] =
    score < 20 ? 'Bajo' : score < 40 ? 'Moderado' : score < 65 ? 'Alto' : 'Crítico';
  const riesgoColor =
    score < 20 ? '#22C55E' : score < 40 ? '#FBBF24' : score < 65 ? '#F97316' : '#E63946';

  const ratioIGVPromedio = (totalIGV / totalIngresos) * 100;

  const recomendaciones: string[] = [];
  if (tardanzas.length > 0) {
    recomendaciones.push(
      `Regulariza las ${tardanzas.length} declaración(es) tardía(s) presentando rectificatoria(s). Paga las multas con rebaja del 95% si aún no fueron detectadas por SUNAT.`
    );
  }
  if (mesesAnomalia.length > 0) {
    recomendaciones.push(
      `Prepara el sustento documentario para los meses con inconsistencias de IGV (${mesesAnomalia.join(', ')}). Ten facturas y contratos listos ante una eventual fiscalización.`
    );
  }
  recomendaciones.push(
    'Implementa un registro de ventas y compras mensual. Cruza tu IGV declarado con el 15.25% de tus ingresos para detectar diferencias antes de declarar.',
    'Guarda todos los comprobantes de ventas y compras por al menos 5 años. SUNAT puede fiscalizar hasta 4 años hacia atrás.',
    'Considera contratar un auditor externo que revise tu declaración anual antes de presentarla. El costo es menor al riesgo de una multa.'
  );

  return {
    riesgoScore: score,
    riesgoNivel,
    riesgoColor,
    irregularidades: irregularidades.sort((a, b) => {
      const orden = { crítico: 0, importante: 1, moderado: 2 };
      return orden[a.severidad] - orden[b.severidad];
    }),
    ratioIGVPromedio,
    tardanzas: tardanzas.length,
    mesesAnomalia,
    recomendaciones,
    totalIngresos,
    totalIGV,
    totalRenta,
  };
}

/* ---- Página principal ---- */
export default function TributarioDiagnostico() {
  const [plan, setPlan] = usePlan();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [animating, setAnimating] = useState(false);
  const [meses, setMeses] = useState<MesTributario[]>(MESES_MOCK.map((m) => ({ ...m })));

  const bloqueado = PLAN_LEVEL[plan] < PLAN_LEVEL['pro'];
  const auditoria = useMemo(() => calcularAuditoria(meses), [meses]);

  const updateMes = (i: number, campo: keyof MesTributario, valor: string | boolean) => {
    setMeses((prev) => {
      const next = [...prev];
      if (campo === 'aTiempo') {
        next[i] = { ...next[i], aTiempo: valor as boolean };
      } else {
        next[i] = { ...next[i], [campo]: parseFloat(valor as string) || 0 };
      }
      return next;
    });
  };

  const goTo = (s: 1 | 2) => {
    setAnimating(true);
    setTimeout(() => { setStep(s); setAnimating(false); }, 180);
  };

  if (bloqueado) {
    return (
      <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
        <FullPageLockedPro onBack={() => router.push('/diagnostico')} />
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
      <div className="max-w-4xl mx-auto flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/diagnostico')} className="text-blue-500 hover:underline font-medium">
            ← Diagnósticos
          </button>
          <span className="text-gray-300">/</span>
          <span className="font-semibold" style={{ color: '#1B3A6B' }}>Diagnóstico Tributario</span>
          <span
            className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#FEF3C7', color: '#92400E' }}
          >
            ⭐ Plan Pro
          </span>
        </div>

        <WizardSteps currentStep={step} steps={['Datos 12 meses', 'Auditoría forense']} />

        <div
          className="transition-all duration-200"
          style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
        >
          {step === 1 && (
            <Step1Tabla meses={meses} onUpdate={updateMes} onNext={() => goTo(2)} />
          )}
          {step === 2 && (
            <Step2Auditoria
              auditoria={auditoria}
              meses={meses}
              onBack={() => goTo(1)}
              onFinish={() => router.push('/diagnostico')}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

/* ---- Paso 1: Tabla 12 meses ---- */
function Step1Tabla({
  meses, onUpdate, onNext,
}: {
  meses: MesTributario[];
  onUpdate: (i: number, campo: keyof MesTributario, valor: string | boolean) => void;
  onNext: () => void;
}) {
  const totales = {
    ingresos: meses.reduce((s, m) => s + m.ingresos, 0),
    igv: meses.reduce((s, m) => s + m.igv, 0),
    renta: meses.reduce((s, m) => s + m.renta, 0),
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
        <h2 className="font-black text-lg" style={{ color: '#1B3A6B' }}>
          🏛️ Declaraciones de los últimos 12 meses
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Datos prellenados. Edítalos para que reflejen tu situación real.
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #F1F5F9' }}>
              <th className="text-left px-4 py-3 font-semibold text-xs text-gray-500 w-36">Mes</th>
              <th className="text-right px-3 py-3 font-semibold text-xs text-gray-500">Ingresos</th>
              <th className="text-right px-3 py-3 font-semibold text-xs text-gray-500">IGV pagado</th>
              <th className="text-right px-3 py-3 font-semibold text-xs text-gray-500">Renta pagada</th>
              <th className="text-center px-3 py-3 font-semibold text-xs text-gray-500">¿A tiempo?</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m, i) => {
              const igvEsperado = m.ingresos * 0.1525;
              const igvAnomalo = Math.abs(m.igv - igvEsperado) / igvEsperado > 0.2;
              return (
                <tr
                  key={i}
                  className="border-b hover:bg-blue-50/30 transition-colors"
                  style={{
                    borderColor: '#F9FAFB',
                    background: !m.aTiempo ? '#FFF8F8' : igvAnomalo ? '#FFFBEB' : 'transparent',
                  }}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {!m.aTiempo && <span className="text-xs">🔴</span>}
                      {m.aTiempo && igvAnomalo && <span className="text-xs">🟡</span>}
                      {m.aTiempo && !igvAnomalo && <span className="text-xs">🟢</span>}
                      <span className="font-medium text-xs" style={{ color: '#1B3A6B' }}>{m.mes}</span>
                    </div>
                  </td>
                  {(['ingresos', 'igv', 'renta'] as const).map((campo) => (
                    <td key={campo} className="px-3 py-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">S/.</span>
                        <input
                          type="number"
                          min="0"
                          value={m[campo]}
                          onChange={(e) => onUpdate(i, campo, e.target.value)}
                          className="w-full text-right rounded-lg border py-1.5 pr-2 pl-8 text-xs outline-none transition-all"
                          style={{
                            borderColor: campo === 'igv' && igvAnomalo ? '#FDE68A' : '#E0E5EF',
                            color: '#1B3A6B',
                            background: campo === 'igv' && igvAnomalo ? '#FFFBEB' : 'white',
                          }}
                        />
                      </div>
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onUpdate(i, 'aTiempo', !m.aTiempo)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                      style={
                        m.aTiempo
                          ? { background: '#D1FAE5', color: '#065F46' }
                          : { background: '#FEE2E2', color: '#E63946' }
                      }
                    >
                      {m.aTiempo ? '✓ Sí' : '✕ No'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Totales */}
          <tfoot>
            <tr style={{ background: '#1B3A6B' }}>
              <td className="px-4 py-3 font-bold text-xs text-white">TOTAL ANUAL</td>
              <td className="px-3 py-3 text-right font-black text-xs text-white">{fmt(totales.ingresos)}</td>
              <td className="px-3 py-3 text-right font-black text-xs text-white">{fmt(totales.igv)}</td>
              <td className="px-3 py-3 text-right font-black text-xs text-white">{fmt(totales.renta)}</td>
              <td className="px-3 py-3 text-center text-xs text-blue-200">
                {meses.filter((m) => !m.aTiempo).length === 0 ? '✓ Todas a tiempo' : `${meses.filter((m) => !m.aTiempo).length} tardías`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Leyenda */}
      <div className="px-5 py-3 flex flex-wrap gap-4" style={{ background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
        <span className="text-xs text-gray-500 flex items-center gap-1"><span>🟢</span> Sin observaciones</span>
        <span className="text-xs text-gray-500 flex items-center gap-1"><span>🟡</span> Anomalía en IGV</span>
        <span className="text-xs text-gray-500 flex items-center gap-1"><span>🔴</span> Declaración tardía</span>
      </div>

      <div className="px-5 py-4 border-t" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
        <button
          onClick={onNext}
          className="w-full py-3.5 px-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}
        >
          <span>🔍</span>
          Iniciar auditoría forense
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ---- Paso 2: Auditoría ---- */
function Step2Auditoria({
  auditoria: a, meses, onBack, onFinish,
}: {
  auditoria: AuditoriaResult;
  meses: MesTributario[];
  onBack: () => void;
  onFinish: () => void;
}) {
  const SEVER: Record<string, { backgroundColor: string; color: string }> = {
    crítico:    { backgroundColor: '#FEE2E2', color: '#E63946' },
    importante: { backgroundColor: '#FEF3C7', color: '#D97706' },
    moderado:   { backgroundColor: '#DBEAFE', color: '#1E40AF' },
  };

  const maxIngreso = Math.max(...meses.map((m) => m.ingresos));

  return (
    <div className="flex flex-col gap-4">
      {/* ── Indicador de riesgo global ── */}
      <div
        className="rounded-2xl p-5 border-2"
        style={{
          background: a.riesgoScore < 20 ? '#F0FDF4' : a.riesgoScore < 40 ? '#FFFBEB' : '#FFF1F2',
          borderColor: a.riesgoColor + '60',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: a.riesgoColor }}>
          🏛️ Índice de riesgo de fiscalización SUNAT
        </p>
        <div className="flex items-center gap-5">
          {/* Termómetro de riesgo */}
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 rounded-full flex flex-col items-center justify-center border-4 bg-white"
              style={{ borderColor: a.riesgoColor }}
            >
              <span className="text-xl font-black" style={{ color: a.riesgoColor }}>{a.riesgoScore}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
            <span className="text-xs font-bold" style={{ color: a.riesgoColor }}>{a.riesgoNivel}</span>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-3">
              <MetricaMini label="Declaraciones tardías" value={`${a.tardanzas} de 12`} bad={a.tardanzas > 0} />
              <MetricaMini label="Ratio IGV promedio" value={`${a.ratioIGVPromedio.toFixed(1)}%`} bad={Math.abs(a.ratioIGVPromedio - 15.25) > 2} />
              <MetricaMini label="Meses con anomalías" value={`${a.mesesAnomalia.length}`} bad={a.mesesAnomalia.length > 0} />
              <MetricaMini label="Total impuestos" value={fmt(a.totalIGV + a.totalRenta)} bad={false} />
            </div>
          </div>
        </div>

        {/* Barra de riesgo */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Sin riesgo</span><span>Riesgo crítico</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #22C55E 0%, #FBBF24 40%, #F97316 65%, #E63946 100%)' }}>
            <div
              className="absolute top-0 bottom-0 w-3 h-3 rounded-full bg-white border-2 shadow-md transition-all duration-500"
              style={{ left: `calc(${a.riesgoScore}% - 6px)`, borderColor: a.riesgoColor }}
            />
          </div>
        </div>
      </div>

      {/* ── Gráfico de ingresos 12 meses ── */}
      <div className="bg-white rounded-2xl border-2 p-5" style={{ borderColor: '#F1F5F9' }}>
        <h4 className="font-bold text-sm mb-4" style={{ color: '#1B3A6B' }}>
          📊 Ingresos mensuales — Análisis de variabilidad
        </h4>
        <div className="flex items-end gap-1 h-28">
          {meses.map((m, i) => {
            const pct = maxIngreso > 0 ? (m.ingresos / maxIngreso) * 100 : 0;
            const promPct = (meses.reduce((s, x) => s + x.ingresos, 0) / 12 / maxIngreso) * 100;
            const igvAnomalo = Math.abs(m.igv - m.ingresos * 0.1525) / (m.ingresos * 0.1525) > 0.2;
            const barColor = !m.aTiempo ? '#E63946' : igvAnomalo ? '#FBBF24' : '#4A90D9';
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full rounded-t-sm transition-all duration-500 cursor-pointer"
                  style={{ height: `${pct}%`, background: barColor, minHeight: 4 }}
                />
                <span className="text-gray-400 text-center" style={{ fontSize: '0.55rem' }}>{m.mesCorto}</span>
                {/* Tooltip */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  <p className="font-bold">{m.mes}</p>
                  <p>{fmt(m.ingresos)}</p>
                  {!m.aTiempo && <p className="text-red-300">⚠ Tardía</p>}
                  {igvAnomalo && <p className="text-yellow-300">⚠ IGV anómalo</p>}
                </div>
              </div>
            );
          })}
        </div>
        {/* Línea promedio visual */}
        <p className="text-xs text-gray-400 mt-2 text-center">
          Promedio mensual: <span className="font-semibold" style={{ color: '#4A90D9' }}>{fmt(a.totalIngresos / 12)}</span>
          {' '}· Total anual: <span className="font-semibold" style={{ color: '#1B3A6B' }}>{fmt(a.totalIngresos)}</span>
        </p>
      </div>

      {/* ── Irregularidades detectadas ── */}
      {a.irregularidades.length > 0 ? (
        <div className="bg-white rounded-2xl border-2 overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
          <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
            <h4 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
              🔍 Irregularidades detectadas
            </h4>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: '#FEE2E2', color: '#E63946' }}
            >
              {a.irregularidades.length} hallazgos
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {a.irregularidades.map((irr, i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-3">
                <span
                  className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 mt-0.5"
                  style={SEVER[irr.severidad]}
                >
                  {irr.severidad.charAt(0).toUpperCase() + irr.severidad.slice(1)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{irr.tipo}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{irr.descripcion}</p>
                  <p
                    className="text-xs font-semibold mt-1.5 px-2 py-1 rounded-lg inline-block"
                    style={{ background: '#FFF7ED', color: '#C2410C' }}
                  >
                    💰 {irr.impacto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 border-2 flex items-center gap-3" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold" style={{ color: '#065F46' }}>Sin irregularidades detectadas</p>
            <p className="text-xs text-green-700 mt-0.5">Tus declaraciones están consistentes y presentadas a tiempo.</p>
          </div>
        </div>
      )}

      {/* ── Resumen tributario ── */}
      <div className="bg-white rounded-2xl border-2 overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
          <h4 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>📋 Resumen tributario anual</h4>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Ingresos totales', value: fmt(a.totalIngresos), color: '#22C55E' },
            { label: 'IGV total pagado', value: fmt(a.totalIGV), color: '#4A90D9' },
            { label: 'Renta total pagada', value: fmt(a.totalRenta), color: '#7C3AED' },
            { label: 'Carga tributaria', value: `${((( a.totalIGV + a.totalRenta) / a.totalIngresos) * 100).toFixed(1)}%`, color: '#F59E0B' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-base font-black mt-0.5" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recomendaciones ── */}
      <div className="bg-white rounded-2xl border-2 overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
          <h4 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
            🤖 Recomendaciones para reducir el riesgo
          </h4>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {a.recomendaciones.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg, #1B3A6B, #4A90D9)' }}
              >
                {i + 1}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Botones ── */}
      <div className="flex gap-3 mt-1">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 rounded-2xl font-semibold text-sm border-2 transition-all hover:bg-gray-50 active:scale-95"
          style={{ color: '#1B3A6B', borderColor: '#E0E5EF' }}
        >
          ← Editar datos
        </button>
        <button
          onClick={onFinish}
          className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
          style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}
        >
          Guardar auditoría ✓
        </button>
      </div>
    </div>
  );
}

/* ---- Sub-componentes ---- */
function MetricaMini({ label, value, bad }: { label: string; value: string; bad: boolean }) {
  return (
    <div
      className="rounded-xl p-2.5 border"
      style={{ background: bad ? '#FFF8F8' : '#F8FAFC', borderColor: bad ? '#FECDD3' : '#E5E7EB' }}
    >
      <p className="text-xs text-gray-400 leading-tight">{label}</p>
      <p className="font-black text-sm mt-0.5" style={{ color: bad ? '#E63946' : '#1B3A6B' }}>{value}</p>
    </div>
  );
}

function WizardSteps({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((label, i) => {
        const s = i + 1;
        const isDone = s < currentStep;
        const isActive = s === currentStep;
        return (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: isDone ? '#22C55E' : isActive ? '#E63946' : '#E5E7EB',
                color: isDone || isActive ? 'white' : '#9CA3AF',
              }}
            >
              {isDone ? '✓' : s}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: isActive ? '#1B3A6B' : '#9CA3AF' }}>
              {label}
            </span>
            {s < steps.length && <div className="flex-1 h-px" style={{ background: isDone ? '#22C55E' : '#E5E7EB' }} />}
          </div>
        );
      })}
    </div>
  );
}

function FullPageLockedPro({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-5 py-12 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: '#FEF3C7' }}>🏛️</div>
      <div>
        <h2 className="text-xl font-black" style={{ color: '#1B3A6B' }}>Auditoría forense tributaria</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Esta función exclusiva del <span className="font-semibold">Plan Pro</span> analiza 12 meses de declaraciones
          y calcula tu riesgo de fiscalización SUNAT en tiempo real.
        </p>
      </div>
      <button className="py-3 px-6 rounded-2xl font-bold text-white shadow-md hover:opacity-90 active:scale-95" style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}>
        Actualizar a Plan Pro — S/. 99/mes
      </button>
      <button onClick={onBack} className="text-sm font-medium underline" style={{ color: '#4A90D9' }}>← Volver</button>
    </div>
  );
}
