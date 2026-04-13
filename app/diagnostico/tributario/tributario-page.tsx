'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LEVEL } from '@/components/dashboard/types';

/* ─────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────── */
interface MesTributario {
  mes: string;
  mesCorto: string;
  ingresos: number;
  igv: number;
  renta: number;
  aTiempo: boolean;
}

interface DatosTributariosExtra {
  regimen: 'rus' | 'mype' | 'general';
  tieneDeudaSunat: boolean;
  montoDeuda: number;
  haRecibidoEsquelas: boolean;
  tieneAgentesRetencion: boolean;
  exporta: boolean;
}

interface Irregularidad {
  mes?: string;
  tipo: string;
  descripcion: string;
  severidad: 'crítico' | 'importante' | 'moderado';
  impacto: string;
  accion: string;
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
  alertaFiscalizacion: string;
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmt(n: number) {
  return 'S/. ' + Math.round(n).toLocaleString('es-PE');
}

/* ─────────────────────────────────────────────
   MOCK DATA 12 MESES
───────────────────────────────────────────── */
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

const EXTRA_DEMO: DatosTributariosExtra = {
  regimen: 'mype',
  tieneDeudaSunat: false,
  montoDeuda: 0,
  haRecibidoEsquelas: false,
  tieneAgentesRetencion: false,
  exporta: false,
};

/* ─────────────────────────────────────────────
   MOTOR DE AUDITORÍA TRIBUTARIA
───────────────────────────────────────────── */
function calcularAuditoria(meses: MesTributario[], extra: DatosTributariosExtra): AuditoriaResult {
  let score = 0;
  const irregularidades: Irregularidad[] = [];
  const mesesAnomalia: string[] = [];

  const totalIngresos = meses.reduce((s, m) => s + m.ingresos, 0);
  const totalIGV = meses.reduce((s, m) => s + m.igv, 0);
  const totalRenta = meses.reduce((s, m) => s + m.renta, 0);
  const promIngreso = totalIngresos / 12;

  // ── Factor 1: Tardanzas ──────────────────
  const tardanzas = meses.filter((m) => !m.aTiempo);
  tardanzas.forEach((m) => {
    score += 12;
    irregularidades.push({
      mes: m.mes,
      tipo: 'Declaración tardía',
      descripcion: `${m.mes}: declaración presentada fuera de plazo.`,
      severidad: 'importante',
      impacto: `Multa estimada: ${fmt(m.ingresos * 0.005)} (0.5% de ingresos del mes)`,
      accion: 'Presenta rectificatoria ahora. Puedes reducir la multa hasta 95% si SUNAT no te ha notificado aún.',
    });
  });

  // ── Factor 2: Inconsistencias IGV ────────
  const IGV_ESPERADO_PCT = 0.1525;
  meses.forEach((m) => {
    const igvEsperado = m.ingresos * IGV_ESPERADO_PCT;
    const diferencia = Math.abs(m.igv - igvEsperado) / igvEsperado;
    if (diferencia > 0.2) {
      score += 8;
      mesesAnomalia.push(m.mesCorto);
      irregularidades.push({
        mes: m.mes,
        tipo: 'Inconsistencia IGV',
        descripcion: `IGV declarado (${fmt(m.igv)}) difiere del esperado (${fmt(igvEsperado)}) en un ${(diferencia * 100).toFixed(0)}%.`,
        severidad: diferencia > 0.4 ? 'crítico' : 'importante',
        impacto: `Diferencia: ${fmt(Math.abs(m.igv - igvEsperado))}. SUNAT cruza este dato automáticamente con tus clientes.`,
        accion: 'Prepara el sustento: facturas de compra, contratos, notas de crédito. Ten todo listo antes de cualquier notificación.',
      });
    }
  });

  // ── Factor 3: Picos de ingresos ──────────
  meses.forEach((m) => {
    const variacion = Math.abs(m.ingresos - promIngreso) / promIngreso;
    if (variacion > 0.6) {
      score += 5;
      irregularidades.push({
        mes: m.mes,
        tipo: 'Pico de ingresos inusual',
        descripcion: `${m.mes}: ingresos (${fmt(m.ingresos)}) son ${Math.round(variacion * 100)}% ${m.ingresos > promIngreso ? 'mayores' : 'menores'} al promedio.`,
        severidad: 'moderado',
        impacto: 'Los algoritmos de SUNAT detectan variaciones extremas y pueden activar una revisión.',
        accion: 'Guarda contratos, órdenes de compra y cualquier documento que explique la variación del mes.',
      });
    }
  });

  // ── Factor 4: Ratio renta/ingresos ───────
  const ratioRenta = totalRenta / totalIngresos;
  if (ratioRenta < 0.03) {
    score += 10;
    irregularidades.push({
      tipo: 'Tasa efectiva de Renta baja',
      descripcion: `Tu tasa efectiva de IR es ${(ratioRenta * 100).toFixed(1)}%, inferior al mínimo esperado según tu régimen.`,
      severidad: 'importante',
      impacto: 'Posible omisión de renta o uso indebido de deducciones. Alto riesgo de fiscalización.',
      accion: 'Verifica con tu contador que todas las deducciones estén debidamente sustentadas con comprobantes.',
    });
  }

  // ── Factor 5: Deuda SUNAT ────────────────
  if (extra.tieneDeudaSunat) {
    score += 20;
    irregularidades.push({
      tipo: 'Deuda tributaria pendiente',
      descripcion: `Tienes deuda con SUNAT por ${fmt(extra.montoDeuda)}.`,
      severidad: 'crítico',
      impacto: 'SUNAT puede embargar cuentas bancarias, bienes y bloquear tus operaciones.',
      accion: 'Negocia un fraccionamiento. Tienes derecho a pagar en hasta 72 cuotas. Hazlo antes de que pasen a cobranza coactiva.',
    });
  }

  // ── Factor 6: Esquelas recibidas ─────────
  if (extra.haRecibidoEsquelas) {
    score += 15;
    irregularidades.push({
      tipo: 'Esquelas de SUNAT recibidas',
      descripcion: 'Has recibido notificaciones o esquelas de SUNAT recientemente.',
      severidad: 'crítico',
      impacto: 'Es una señal clara de que estás en el radar de fiscalización de SUNAT.',
      accion: 'NO ignores las esquelas. Responde dentro del plazo indicado con toda la documentación solicitada. Considera un abogado tributario.',
    });
  }

  score = Math.min(100, score);
  const riesgoNivel: AuditoriaResult['riesgoNivel'] =
    score < 20 ? 'Bajo' : score < 40 ? 'Moderado' : score < 65 ? 'Alto' : 'Crítico';
  const riesgoColor =
    score < 20 ? '#22C55E' : score < 40 ? '#FBBF24' : score < 65 ? '#F97316' : '#E63946';

  const ratioIGVPromedio = (totalIGV / totalIngresos) * 100;

  // ── Alerta de fiscalización ──────────────
  const alertaFiscalizacion =
    score >= 65
      ? '🔴 RIESGO CRÍTICO: Probabilidad alta de fiscalización SUNAT. Actúa inmediatamente.'
      : score >= 40
      ? '🟠 RIESGO ALTO: Inconsistencias detectables por los sistemas de SUNAT. Regulariza antes de que llegue la notificación.'
      : score >= 20
      ? '🟡 RIESGO MODERADO: Algunos puntos que SUNAT podría observar. Mantén tu documentación en orden.'
      : '🟢 RIESGO BAJO: Tu perfil tributario es consistente. Sigue así y mantén el orden documentario.';

  // ── Recomendaciones ──────────────────────
  const recomendaciones: string[] = [];
  if (tardanzas.length > 0) {
    recomendaciones.push(
      `Regulariza las ${tardanzas.length} declaración(es) tardía(s) con rectificatoria. Paga las multas con rebaja del 95% si aún no fueron detectadas.`
    );
  }
  if (mesesAnomalia.length > 0) {
    recomendaciones.push(
      `Prepara sustento documentario para los meses con inconsistencias de IGV: ${mesesAnomalia.join(', ')}. Ten facturas y contratos listos.`
    );
  }
  if (extra.tieneDeudaSunat) {
    recomendaciones.push('Solicita fraccionamiento de deuda a SUNAT. Puedes pagar en hasta 72 cuotas con una cuota mínima razonable.');
  }
  recomendaciones.push(
    'Implementa un control mensual: cruza tu IGV declarado con el 15.25% de tus ingresos para detectar diferencias antes de declarar.',
    'Guarda TODOS los comprobantes por al menos 5 años. SUNAT puede fiscalizar hasta 4 ejercicios hacia atrás.',
    'Revisa tu declaración anual con tu contador antes de presentarla. Una rectificatoria voluntaria tiene multa mínima.'
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
    alertaFiscalizacion,
  };
}

/* ─────────────────────────────────────────────
   UI HELPERS
───────────────────────────────────────────── */
function WizardSteps({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = ['Régimen y estado', 'Datos 12 meses', 'Auditoría forense'];
  return (
    <div className="flex items-center gap-0 flex-wrap gap-y-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: currentStep > i + 1 ? '#22C55E' : currentStep === i + 1 ? '#E63946' : '#E5E7EB',
                color: currentStep >= i + 1 ? 'white' : '#9CA3AF',
              }}
            >
              {currentStep > i + 1 ? '✓' : i + 1}
            </div>
            <span className="text-xs font-semibold" style={{ color: currentStep === i + 1 ? '#E63946' : currentStep > i + 1 ? '#22C55E' : '#9CA3AF' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-8 h-0.5 mx-2" style={{ background: currentStep > i + 1 ? '#22C55E' : '#E5E7EB' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function RiesgoMeter({ score, color, nivel }: { score: number; color: string; nivel: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 160, height: 90 }}>
        <svg viewBox="0 0 160 90" width="160" height="90">
          <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="#F1F5F9" strokeWidth="14" strokeLinecap="round" />
          <path
            d="M 15 85 A 65 65 0 0 1 145 85"
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 204} 204`}
          />
          {/* Needle */}
          {(() => {
            const angle = (score / 100) * 180 - 90;
            return (
              <>
                <line x1="80" y1="85"
                  x2={80 + 50 * Math.cos((angle * Math.PI) / 180)}
                  y2={85 + 50 * Math.sin((angle * Math.PI) / 180)}
                  stroke="#1B3A6B" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="80" cy="85" r="5" fill="#1B3A6B" />
              </>
            );
          })()}
          <text x="10" y="90" fontSize="8" fill="#9CA3AF">Bajo</text>
          <text x="62" y="16" fontSize="8" fill="#9CA3AF">Medio</text>
          <text x="130" y="90" fontSize="8" fill="#9CA3AF">Alto</text>
        </svg>
      </div>
      <div className="text-4xl font-black" style={{ color, lineHeight: 1 }}>{score}</div>
      <div className="text-xs font-bold" style={{ color }}>Índice de Riesgo · {nivel}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASO 1 — RÉGIMEN Y ESTADO
───────────────────────────────────────────── */
function Step1Regimen({ extra, onChange, onNext }: {
  extra: DatosTributariosExtra;
  onChange: (e: DatosTributariosExtra) => void;
  onNext: () => void;
}) {
  const set = <K extends keyof DatosTributariosExtra>(k: K) => (v: DatosTributariosExtra[K]) =>
    onChange({ ...extra, [k]: v });

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4" style={{ borderColor: '#FFF1F2' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>🏛️ Régimen Tributario</h2>
          <p className="text-xs text-gray-400 mt-0.5">¿En qué régimen estás actualmente?</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['rus', 'mype', 'general'] as const).map((r) => (
            <button
              key={r}
              onClick={() => set('regimen')(r)}
              className="py-3 px-2 rounded-xl text-xs font-bold border-2 flex flex-col items-center gap-1 transition-all"
              style={{
                borderColor: extra.regimen === r ? '#E63946' : '#E5E7EB',
                background: extra.regimen === r ? '#FFF1F2' : 'white',
                color: extra.regimen === r ? '#E63946' : '#6B7280',
              }}
            >
              <span className="text-lg">{r === 'rus' ? '🟤' : r === 'mype' ? '🔵' : '🔴'}</span>
              <span>{r === 'rus' ? 'RUS' : r === 'mype' ? 'MYPE Tributario' : 'Régimen General'}</span>
            </button>
          ))}
        </div>
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FFF8F0', color: '#92400E' }}>
          {extra.regimen === 'rus'
            ? '📌 RUS: Pago fijo mensual. No declaras IGV ni Renta por separado. Límite: S/. 96,000 ventas/año.'
            : extra.regimen === 'mype'
            ? '📌 MYPE Tributario: Tasa del 10% IR hasta 15 UIT de renta neta. Declaras IGV mensual.'
            : '📌 Régimen General: Tasa del 29.5% IR. Mayor control documentario exigido por SUNAT.'}
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#FFF1F2' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>⚡ Estado actual con SUNAT</h2>
          <p className="text-xs text-gray-400 mt-0.5">Situaciones que aumentan el riesgo de fiscalización</p>
        </div>
        {[
          { key: 'tieneDeudaSunat' as const, label: '¿Tienes deuda pendiente con SUNAT?', sub: 'Deuda tributaria sin fraccionar o vencida' },
          { key: 'haRecibidoEsquelas' as const, label: '¿Has recibido esquelas o notificaciones?', sub: 'Cartas, notificaciones o visitas de SUNAT' },
          { key: 'tieneAgentesRetencion' as const, label: '¿Eres agente de retención?', sub: 'SUNAT te designó para retener impuestos a proveedores' },
          { key: 'exporta' as const, label: '¿Exportas productos o servicios?', sub: 'Tienes operaciones en el exterior' },
        ].map(({ key, label, sub }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 p-3 rounded-xl cursor-pointer transition-all"
            style={{
              background: extra[key] ? '#FFF1F2' : '#F9FAFB',
              border: `1.5px solid ${extra[key] ? '#FECDD3' : '#E5E7EB'}`,
            }}
            onClick={() => (set(key) as (v: boolean) => void)(!extra[key])}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <div
              className="w-11 h-6 rounded-full transition-all flex items-center px-0.5 flex-shrink-0"
              style={{ background: extra[key] ? '#E63946' : '#D1D5DB' }}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow transition-all"
                style={{ transform: extra[key] ? 'translateX(20px)' : 'translateX(0)' }} />
            </div>
          </div>
        ))}

        {extra.tieneDeudaSunat && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold" style={{ color: '#374151' }}>Monto aproximado de deuda</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">S/.</span>
              <input
                type="number" min="0"
                value={extra.montoDeuda || ''}
                onChange={(e) => set('montoDeuda')(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm font-medium outline-none"
                style={{ borderColor: '#E63946', color: '#1B3A6B' }}
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #E63946 100%)', boxShadow: '0 4px 20px #E6394640' }}
      >
        Siguiente: Datos 12 meses →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASO 2 — TABLA 12 MESES
───────────────────────────────────────────── */
function Step2Tabla({ meses, onUpdate, onNext, onBack }: {
  meses: MesTributario[];
  onUpdate: (i: number, campo: keyof MesTributario, valor: string | boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const totales = {
    ingresos: meses.reduce((s, m) => s + m.ingresos, 0),
    igv: meses.reduce((s, m) => s + m.igv, 0),
    renta: meses.reduce((s, m) => s + m.renta, 0),
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col gap-0" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: '#F1F5F9' }}>
        <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>🏛️ Declaraciones de los últimos 12 meses</h2>
        <p className="text-xs text-gray-400 mt-0.5">Datos prellenados. Edítalos con tu información real.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #F1F5F9' }}>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 w-36">Mes</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-400">Ingresos</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-400">IGV</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-gray-400">Renta</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-400">¿A tiempo?</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m, i) => {
              const igvEsperado = m.ingresos * 0.1525;
              const igvAnomalo = Math.abs(m.igv - igvEsperado) / (igvEsperado || 1) > 0.2;
              return (
                <tr key={i} className="border-b transition-colors"
                  style={{
                    borderColor: '#F9FAFB',
                    background: !m.aTiempo ? '#FFF8F8' : igvAnomalo ? '#FFFBEB' : 'transparent',
                  }}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{!m.aTiempo ? '🔴' : igvAnomalo ? '🟡' : '🟢'}</span>
                      <span className="font-medium text-xs" style={{ color: '#1B3A6B' }}>{m.mes}</span>
                    </div>
                  </td>
                  {(['ingresos', 'igv', 'renta'] as const).map((campo) => (
                    <td key={campo} className="px-3 py-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">S/.</span>
                        <input
                          type="number" min="0"
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
                      className="px-2 py-1 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: m.aTiempo ? '#DCFCE7' : '#FEE2E2',
                        color: m.aTiempo ? '#166534' : '#991B1B',
                      }}
                    >
                      {m.aTiempo ? 'Sí ✓' : 'No ✗'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: '#F8FAFC', borderTop: '2px solid #E5E7EB' }}>
              <td className="px-4 py-3 text-xs font-black" style={{ color: '#1B3A6B' }}>TOTAL ANUAL</td>
              {(['ingresos', 'igv', 'renta'] as const).map((campo) => (
                <td key={campo} className="px-3 py-3 text-right text-xs font-black" style={{ color: '#1B3A6B' }}>
                  {fmt(totales[campo])}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="p-4 flex gap-3 border-t" style={{ borderColor: '#F1F5F9' }}>
        <button onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-bold text-sm border-2"
          style={{ borderColor: '#E0E5EF', color: '#6B7280' }}>
          ← Atrás
        </button>
        <button onClick={onNext}
          className="flex-1 py-4 rounded-2xl font-black text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #E63946 100%)' }}>
          🔍 Auditar con IA →
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASO 3 — RESULTADO AUDITORÍA
───────────────────────────────────────────── */
function IrregularidadCard({ irr }: { irr: Irregularidad }) {
  const [open, setOpen] = useState(false);
  const color = irr.severidad === 'crítico' ? '#E63946' : irr.severidad === 'importante' ? '#FBBF24' : '#4A90D9';
  const fondo = irr.severidad === 'crítico' ? '#FFF1F2' : irr.severidad === 'importante' ? '#FFFBEB' : '#EFF6FF';
  return (
    <div
      className="rounded-2xl border-2 overflow-hidden cursor-pointer"
      style={{ borderColor: color + '40', background: fondo }}
      onClick={() => setOpen(!open)}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{irr.tipo}</p>
          {irr.mes && <p className="text-xs text-gray-400">{irr.mes}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>
            {irr.severidad === 'crítico' ? '🔴 Crítico' : irr.severidad === 'importante' ? '🟡 Importante' : '🔵 Moderado'}
          </span>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t" style={{ borderColor: color + '30' }}>
          <p className="text-xs text-gray-500 pt-2">{irr.descripcion}</p>
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#991B1B' }}>
            <span className="font-semibold">⚡ Impacto: </span>{irr.impacto}
          </div>
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: color + '15', color: '#1B3A6B' }}>
            <span className="font-semibold">💡 Qué hacer: </span>{irr.accion}
          </div>
        </div>
      )}
    </div>
  );
}

function Step3Auditoria({ auditoria, onBack, onFinish }: {
  auditoria: AuditoriaResult;
  onBack: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header riesgo */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border-2"
        style={{ background: '#FFF8F8', borderColor: auditoria.riesgoColor + '40' }}>
        <RiesgoMeter score={auditoria.riesgoScore} color={auditoria.riesgoColor} nivel={auditoria.riesgoNivel} />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-black text-xl" style={{ color: '#1B3A6B' }}>Auditoría Forense Tributaria</h2>
          <p className="text-sm mt-2 font-medium leading-relaxed" style={{ color: auditoria.riesgoColor }}>
            {auditoria.alertaFiscalizacion}
          </p>
        </div>
      </div>

      {/* Resumen numérico */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ingresos anuales', value: fmt(auditoria.totalIngresos), color: '#22C55E' },
          { label: 'IGV declarado', value: fmt(auditoria.totalIGV), color: '#4A90D9' },
          { label: 'Renta declarada', value: fmt(auditoria.totalRenta), color: '#E63946' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-3 border-2 text-center" style={{ borderColor: '#F1F5F9' }}>
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="text-sm font-black mt-1" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tardanzas', value: auditoria.tardanzas, icon: '🔴', alert: auditoria.tardanzas > 0 },
          { label: 'Meses con IGV irregular', value: auditoria.mesesAnomalia.length, icon: '🟡', alert: auditoria.mesesAnomalia.length > 0 },
          { label: 'Ratio IGV prom.', value: auditoria.ratioIGVPromedio.toFixed(1) + '%', icon: '📊', alert: false },
        ].map((item) => (
          <div key={item.label}
            className="rounded-2xl p-3 text-center border-2"
            style={{ background: item.alert ? '#FFF8F8' : '#F8FAFF', borderColor: item.alert ? '#FECDD3' : '#F1F5F9' }}>
            <p className="text-lg">{item.icon}</p>
            <p className="text-xl font-black" style={{ color: item.alert ? '#E63946' : '#1B3A6B' }}>{item.value}</p>
            <p className="text-xs text-gray-400 leading-tight mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Irregularidades */}
      {auditoria.irregularidades.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-black text-sm" style={{ color: '#1B3A6B' }}>
            🔍 Irregularidades detectadas ({auditoria.irregularidades.length}) — toca para ver qué hacer
          </h3>
          {auditoria.irregularidades.map((irr, i) => <IrregularidadCard key={i} irr={irr} />)}
        </div>
      )}

      {/* Recomendaciones */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#FECDD3' }}>
        <h3 className="font-black text-sm" style={{ color: '#1B3A6B' }}>🎯 Plan tributario de acción</h3>
        {auditoria.recomendaciones.map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white mt-0.5"
              style={{ background: '#E63946' }}>
              {i + 1}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{r}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>📅 {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        <span>MCF · Auditoría Confidencial</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-bold text-sm border-2"
          style={{ borderColor: '#E0E5EF', color: '#6B7280' }}>
          ← Editar datos
        </button>
        <button onClick={onFinish}
          className="flex-1 py-3 rounded-2xl font-black text-sm text-white active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #E63946 100%)' }}>
          Guardar y salir ✓
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────────── */
function FullPageLockedPro({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-16 text-center">
      <div className="text-6xl">🏛️</div>
      <div>
        <h2 className="font-black text-2xl" style={{ color: '#1B3A6B' }}>Diagnóstico Tributario</h2>
        <p className="text-sm text-gray-500 mt-2">Esta función requiere el Plan Pro. Incluye auditoría forense de 12 meses y análisis de riesgo SUNAT.</p>
      </div>
      <div className="rounded-2xl p-5 border-2 w-full text-left flex flex-col gap-2" style={{ borderColor: '#FECDD3', background: '#FFF1F2' }}>
        <p className="font-black text-sm" style={{ color: '#1B3A6B' }}>Plan Pro incluye:</p>
        {['Auditoría forense 12 meses', 'Índice de riesgo de fiscalización SUNAT', 'Detección de inconsistencias IGV', 'Alertas de deuda tributaria', 'Plan tributario personalizado'].map((f) => (
          <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
            <span className="text-red-500">🔴</span>{f}
          </div>
        ))}
      </div>
      <button onClick={onBack}
        className="w-full py-3 rounded-2xl font-bold text-sm border-2"
        style={{ borderColor: '#E0E5EF', color: '#6B7280' }}>
        ← Volver
      </button>
    </div>
  );
}

export default function TributarioDiagnostico() {
  const [plan, setPlan] = usePlan();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [animating, setAnimating] = useState(false);
  const [meses, setMeses] = useState<MesTributario[]>(MESES_MOCK.map((m) => ({ ...m })));
  const [extra, setExtra] = useState<DatosTributariosExtra>(EXTRA_DEMO);

  const bloqueado = PLAN_LEVEL[plan] < PLAN_LEVEL['pro'];
  const auditoria = useMemo(() => calcularAuditoria(meses, extra), [meses, extra]);

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

  const goTo = (s: 1 | 2 | 3) => {
    setAnimating(true);
    setTimeout(() => { setStep(s); setAnimating(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 180);
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
          <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#92400E' }}>
            ⭐ Plan Pro
          </span>
        </div>

        <WizardSteps currentStep={step} />

        <div
          className="transition-all duration-200"
          style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
        >
          {step === 1 && <Step1Regimen extra={extra} onChange={setExtra} onNext={() => goTo(2)} />}
          {step === 2 && <Step2Tabla meses={meses} onUpdate={updateMes} onNext={() => goTo(3)} onBack={() => goTo(1)} />}
          {step === 3 && <Step3Auditoria auditoria={auditoria} onBack={() => goTo(2)} onFinish={() => router.push('/diagnostico')} />}
        </div>
      </div>
    </AppLayout>
  );
}
