'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { usePlan } from '@/hooks/usePlan';

/* ─────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────── */
interface DatosFinancieros {
  // Activos
  activoCorriente: number;
  pasivoCorriente: number;
  // Resultados
  utilidadNeta: number;
  ventasNetas: number;
  activoTotal: number;
  patrimonioNeto: number;
  // Deuda
  pasivoTotal: number;
  // Caja
  ingresosMes: number[];
  egresosMes: number[];
}

interface IndicadorResult {
  nombre: string;
  valor: number;
  unidad: string;
  referencia: string;
  estado: 'saludable' | 'advertencia' | 'critico';
  color: string;
  colorFondo: string;
  explicacion: string;
  recomendacion: string;
}

interface DiagnosticoResult {
  iie: number; // Índice Integral Empresarial 0-100
  nivelGeneral: 'Saludable' | 'Moderado' | 'En riesgo' | 'Crítico';
  colorGeneral: string;
  indicadores: IndicadorResult[];
  alertas: { tipo: 'critico' | 'importante' | 'moderado'; texto: string }[];
  recomendacionesPrincipales: string[];
  resumenEjecutivo: string;
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmt(n: number, dec = 0) {
  return 'S/. ' + n.toLocaleString('es-PE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function pct(n: number) {
  return n.toFixed(1) + '%';
}
function semaforo(ok: boolean, warn: boolean): IndicadorResult['estado'] {
  if (ok) return 'saludable';
  if (warn) return 'advertencia';
  return 'critico';
}
function estadoColor(e: IndicadorResult['estado']) {
  return e === 'saludable' ? '#22C55E' : e === 'advertencia' ? '#FBBF24' : '#E63946';
}
function estadoFondo(e: IndicadorResult['estado']) {
  return e === 'saludable' ? '#F0FDF4' : e === 'advertencia' ? '#FFFBEB' : '#FFF1F2';
}

/* ─────────────────────────────────────────────
   MOTOR DE DIAGNÓSTICO FINANCIERO
───────────────────────────────────────────── */
function calcularDiagnostico(d: DatosFinancieros): DiagnosticoResult {
  const indicadores: IndicadorResult[] = [];
  const alertas: DiagnosticoResult['alertas'] = [];
  let puntaje = 0;

  // ── 1. LIQUIDEZ CORRIENTE ──────────────────
  const liquidez = d.pasivoCorriente > 0 ? d.activoCorriente / d.pasivoCorriente : 0;
  const liqEstado = semaforo(liquidez >= 1.5, liquidez >= 1.0);
  indicadores.push({
    nombre: 'Liquidez Corriente',
    valor: liquidez,
    unidad: 'x',
    referencia: 'Óptimo: ≥ 1.5',
    estado: liqEstado,
    color: estadoColor(liqEstado),
    colorFondo: estadoFondo(liqEstado),
    explicacion: `Por cada S/. 1 de deuda a corto plazo, tu empresa tiene S/. ${liquidez.toFixed(2)} de activos disponibles.`,
    recomendacion:
      liquidez < 1.0
        ? 'URGENTE: Tu empresa no puede cubrir deudas a corto plazo. Negocia con proveedores, reduce inventario y genera caja inmediatamente.'
        : liquidez < 1.5
        ? 'Tu liquidez es ajustada. Evita nuevas deudas a corto plazo y busca aumentar el flujo de caja operativo.'
        : 'Excelente liquidez. Mantén este nivel y evalúa si puedes invertir el exceso de caja eficientemente.',
  });
  puntaje += liqEstado === 'saludable' ? 25 : liqEstado === 'advertencia' ? 12 : 0;

  // ── 2. RENTABILIDAD SOBRE VENTAS ───────────
  const rentVentas = d.ventasNetas > 0 ? (d.utilidadNeta / d.ventasNetas) * 100 : 0;
  const rvEstado = semaforo(rentVentas >= 10, rentVentas >= 5);
  indicadores.push({
    nombre: 'Rentabilidad s/ Ventas',
    valor: rentVentas,
    unidad: '%',
    referencia: 'Óptimo: ≥ 10%',
    estado: rvEstado,
    color: estadoColor(rvEstado),
    colorFondo: estadoFondo(rvEstado),
    explicacion: `De cada S/. 100 en ventas, tu empresa gana S/. ${rentVentas.toFixed(1)} de utilidad neta.`,
    recomendacion:
      rentVentas < 5
        ? 'Tu margen es muy bajo. Revisa si tienes costos inflados, precios bajos o gastos que puedes reducir. Considera una consultoría de costos.'
        : rentVentas < 10
        ? 'Margen moderado. Identifica tus productos/servicios más rentables y enfoca tus esfuerzos en ellos.'
        : 'Margen saludable. Documenta qué está funcionando bien para replicarlo y escalar.',
  });
  puntaje += rvEstado === 'saludable' ? 25 : rvEstado === 'advertencia' ? 12 : 0;

  // ── 3. ENDEUDAMIENTO ──────────────────────
  const endeud = d.activoTotal > 0 ? (d.pasivoTotal / d.activoTotal) * 100 : 0;
  const endEstado = semaforo(endeud <= 50, endeud <= 70);
  indicadores.push({
    nombre: 'Nivel de Endeudamiento',
    valor: endeud,
    unidad: '%',
    referencia: 'Óptimo: ≤ 50%',
    estado: endEstado,
    color: estadoColor(endEstado),
    colorFondo: estadoFondo(endEstado),
    explicacion: `El ${pct(endeud)} de tus activos está financiado con deuda. El resto (${pct(100 - endeud)}) es capital propio.`,
    recomendacion:
      endeud > 70
        ? 'Nivel de deuda peligroso. Prioriza el pago de deudas más costosas. No tomes nuevos créditos hasta reducir este ratio.'
        : endeud > 50
        ? 'Endeudamiento moderado-alto. Sé selectivo con nuevos créditos y asegúrate de que cada deuda genere más valor de lo que cuesta.'
        : 'Estructura financiera sólida. Puedes acceder a financiamiento adicional si lo necesitas con buenas condiciones.',
  });
  puntaje += endEstado === 'saludable' ? 25 : endEstado === 'advertencia' ? 12 : 0;

  // ── 4. FLUJO DE CAJA NETO ─────────────────
  const totalIngresos = d.ingresosMes.reduce((s, v) => s + v, 0);
  const totalEgresos = d.egresosMes.reduce((s, v) => s + v, 0);
  const flujoPct = totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0;
  const flEstado = semaforo(flujoPct >= 15, flujoPct >= 5);
  indicadores.push({
    nombre: 'Flujo de Caja Neto',
    valor: flujoPct,
    unidad: '%',
    referencia: 'Óptimo: ≥ 15%',
    estado: flEstado,
    color: estadoColor(flEstado),
    colorFondo: estadoFondo(flEstado),
    explicacion: `Tu flujo neto es ${fmt(totalIngresos - totalEgresos)} sobre ingresos de ${fmt(totalIngresos)} en el período analizado.`,
    recomendacion:
      flujoPct < 5
        ? 'Flujo de caja crítico. Revisa qué egresos puedes diferir o eliminar. Considera cobrar más rápido a clientes.'
        : flujoPct < 15
        ? 'Flujo ajustado. Negocia mejores plazos de pago con proveedores y acelera el cobro de cuentas por cobrar.'
        : 'Buen flujo de caja. Destina parte del excedente a un fondo de emergencia equivalente a 3 meses de gastos fijos.',
  });
  puntaje += flEstado === 'saludable' ? 25 : flEstado === 'advertencia' ? 12 : 0;

  // ── ALERTAS ───────────────────────────────
  if (liquidez < 1.0) alertas.push({ tipo: 'critico', texto: 'Liquidez crítica: riesgo de incumplimiento de pagos a corto plazo.' });
  if (endeud > 70) alertas.push({ tipo: 'critico', texto: 'Endeudamiento peligroso: más del 70% de tus activos son financiados con deuda.' });
  if (rentVentas < 5) alertas.push({ tipo: 'importante', texto: 'Rentabilidad baja: revisa estructura de costos y política de precios.' });
  if (flujoPct < 5) alertas.push({ tipo: 'importante', texto: 'Flujo de caja insuficiente para cubrir imprevistos operativos.' });
  if (d.patrimonioNeto < 0) alertas.push({ tipo: 'critico', texto: 'Patrimonio negativo: la empresa está en situación de quiebra técnica.' });

  // ── IIE y nivel general ───────────────────
  const iie = Math.round(puntaje);
  const nivelGeneral: DiagnosticoResult['nivelGeneral'] =
    iie >= 75 ? 'Saludable' : iie >= 50 ? 'Moderado' : iie >= 25 ? 'En riesgo' : 'Crítico';
  const colorGeneral =
    iie >= 75 ? '#22C55E' : iie >= 50 ? '#FBBF24' : iie >= 25 ? '#F97316' : '#E63946';

  // ── RECOMENDACIONES ───────────────────────
  const recomendacionesPrincipales: string[] = [];
  const criticos = indicadores.filter((i) => i.estado === 'critico');
  const advertencias = indicadores.filter((i) => i.estado === 'advertencia');
  if (criticos.length > 0) {
    recomendacionesPrincipales.push(
      `Atención inmediata en: ${criticos.map((i) => i.nombre).join(' y ')}. Son los factores que más daño hacen a tu empresa ahora mismo.`
    );
  }
  if (advertencias.length > 0) {
    recomendacionesPrincipales.push(
      `Mejora en el corto plazo: ${advertencias.map((i) => i.nombre).join(' y ')}. Actuar ahora evita que se conviertan en problemas críticos.`
    );
  }
  recomendacionesPrincipales.push(
    'Repite este diagnóstico cada 3 meses para detectar tendencias antes de que se conviertan en crisis.'
  );
  recomendacionesPrincipales.push(
    'Comparte este reporte con tu contador para que alineen estrategia financiera y tributaria.'
  );

  // ── RESUMEN EJECUTIVO ─────────────────────
  const resumenEjecutivo =
    iie >= 75
      ? `Tu empresa muestra una salud financiera sólida con un IIE de ${iie}/100. Los fundamentos son buenos y estás en posición de crecer.`
      : iie >= 50
      ? `Tu empresa está en zona moderada con IIE ${iie}/100. Hay áreas de mejora importantes que, si se atienden, pueden impulsar tu crecimiento.`
      : iie >= 25
      ? `Tu empresa presenta riesgos financieros con IIE ${iie}/100. Se requieren acciones correctivas en los próximos 30-60 días para estabilizar la situación.`
      : `Situación financiera crítica con IIE ${iie}/100. Se necesita intervención urgente. Considera buscar asesoría financiera especializada de inmediato.`;

  return { iie, nivelGeneral, colorGeneral, indicadores, alertas, recomendacionesPrincipales, resumenEjecutivo };
}

/* ─────────────────────────────────────────────
   DATOS INICIALES (DEMO)
───────────────────────────────────────────── */
const DATOS_DEMO: DatosFinancieros = {
  activoCorriente: 85000,
  pasivoCorriente: 62000,
  utilidadNeta: 28000,
  ventasNetas: 380000,
  activoTotal: 210000,
  patrimonioNeto: 95000,
  pasivoTotal: 115000,
  ingresosMes: [32000, 28000, 35000, 41000, 38000, 44000],
  egresosMes: [29000, 25000, 30000, 36000, 33000, 38000],
};

/* ─────────────────────────────────────────────
   COMPONENTES UI
───────────────────────────────────────────── */
function WizardSteps({ step }: { step: 1 | 2 }) {
  const steps = ['Ingresa tus datos', 'Diagnóstico IA'];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all"
              style={{
                background: step > i + 1 ? '#22C55E' : step === i + 1 ? '#1B3A6B' : '#E5E7EB',
                color: step >= i + 1 ? 'white' : '#9CA3AF',
              }}
            >
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: step === i + 1 ? '#1B3A6B' : step > i + 1 ? '#22C55E' : '#9CA3AF' }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-12 h-0.5 mx-2 transition-all"
              style={{ background: step > i + 1 ? '#22C55E' : '#E5E7EB' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function InputMoney({
  label, value, onChange, hint,
}: {
  label: string; value: number; onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold" style={{ color: '#374151' }}>{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: '#6B7280' }}>S/.</span>
        <input
          type="number"
          min="0"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all"
          style={{ borderColor: '#E0E5EF', color: '#1B3A6B', background: 'white' }}
          onFocus={(e) => (e.target.style.borderColor = '#1B3A6B')}
          onBlur={(e) => (e.target.style.borderColor = '#E0E5EF')}
        />
      </div>
      {hint && <p className="text-xs" style={{ color: '#9CA3AF' }}>{hint}</p>}
    </div>
  );
}

function GaugeIIE({ iie, color }: { iie: number; color: string }) {
  const angle = (iie / 100) * 180 - 90;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 160, height: 90 }}>
        <svg viewBox="0 0 160 90" style={{ width: 160, height: 90 }}>
          {/* Track */}
          <path d="M 15 85 A 65 65 0 0 1 145 85" fill="none" stroke="#F1F5F9" strokeWidth="14" strokeLinecap="round" />
          {/* Fill */}
          <path
            d="M 15 85 A 65 65 0 0 1 145 85"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(iie / 100) * 204} 204`}
          />
          {/* Needle */}
          <line
            x1="80" y1="85"
            x2={80 + 50 * Math.cos((angle * Math.PI) / 180)}
            y2={85 + 50 * Math.sin((angle * Math.PI) / 180)}
            stroke="#1B3A6B" strokeWidth="2.5" strokeLinecap="round"
          />
          <circle cx="80" cy="85" r="5" fill="#1B3A6B" />
          {/* Labels */}
          <text x="10" y="90" fontSize="9" fill="#9CA3AF">0</text>
          <text x="74" y="16" fontSize="9" fill="#9CA3AF">50</text>
          <text x="145" y="90" fontSize="9" fill="#9CA3AF">100</text>
        </svg>
      </div>
      <div className="text-4xl font-black" style={{ color, lineHeight: 1 }}>{iie}</div>
      <div className="text-xs font-semibold text-gray-400">IIE / 100</div>
    </div>
  );
}

function IndicadorCard({ ind }: { ind: IndicadorResult }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border-2 overflow-hidden transition-all cursor-pointer"
      style={{ borderColor: ind.color + '40', background: ind.colorFondo }}
      onClick={() => setOpen(!open)}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: ind.color, boxShadow: `0 0 6px ${ind.color}80` }}
          />
          <span className="text-sm font-semibold truncate" style={{ color: '#1B3A6B' }}>{ind.nombre}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="text-lg font-black"
            style={{ color: ind.color }}
          >
            {ind.valor.toFixed(ind.unidad === '%' ? 1 : 2)}{ind.unidad}
          </div>
          <div
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: ind.color + '20', color: ind.color }}
          >
            {ind.estado === 'saludable' ? '✓ OK' : ind.estado === 'advertencia' ? '⚠ Atención' : '✗ Crítico'}
          </div>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t" style={{ borderColor: ind.color + '30' }}>
          <p className="text-xs text-gray-500 pt-2">{ind.explicacion}</p>
          <p className="text-xs font-medium" style={{ color: '#1B3A6B' }}>Referencia: {ind.referencia}</p>
          <div
            className="rounded-xl px-3 py-2 text-xs"
            style={{ background: ind.color + '15', color: '#1B3A6B' }}
          >
            <span className="font-semibold">💡 Qué hacer: </span>{ind.recomendacion}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASO 1 — FORMULARIO
───────────────────────────────────────────── */
function Step1Form({
  datos,
  onChange,
  onNext,
}: {
  datos: DatosFinancieros;
  onChange: (d: DatosFinancieros) => void;
  onNext: () => void;
}) {
  const set = (key: keyof DatosFinancieros) => (v: number) => onChange({ ...datos, [key]: v });

  // flujo: 6 meses
  const updateFlujo = (tipo: 'ingresosMes' | 'egresosMes', i: number, v: number) => {
    const arr = [...datos[tipo]];
    arr[i] = v;
    onChange({ ...datos, [tipo]: arr });
  };

  const mesesNombres = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'];

  return (
    <div className="flex flex-col gap-5">
      {/* Liquidez */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4" style={{ borderColor: '#EFF6FF' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>💧 Datos de Liquidez</h2>
          <p className="text-xs text-gray-400 mt-0.5">Estado del balance a corto plazo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputMoney label="Activo Corriente" value={datos.activoCorriente} onChange={set('activoCorriente')}
            hint="Caja + cuentas por cobrar + inventario" />
          <InputMoney label="Pasivo Corriente" value={datos.pasivoCorriente} onChange={set('pasivoCorriente')}
            hint="Deudas a pagar en menos de 12 meses" />
        </div>
      </div>

      {/* Rentabilidad */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4" style={{ borderColor: '#F0FDF4' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>📈 Rentabilidad</h2>
          <p className="text-xs text-gray-400 mt-0.5">Qué tan rentable es tu operación</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputMoney label="Ventas Netas (anuales)" value={datos.ventasNetas} onChange={set('ventasNetas')}
            hint="Total de ventas del año sin IGV" />
          <InputMoney label="Utilidad Neta (anual)" value={datos.utilidadNeta} onChange={set('utilidadNeta')}
            hint="Ganancia después de impuestos" />
        </div>
      </div>

      {/* Endeudamiento */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4" style={{ borderColor: '#FFF1F2' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>🏦 Estructura de Deuda</h2>
          <p className="text-xs text-gray-400 mt-0.5">Nivel de financiamiento externo</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputMoney label="Activo Total" value={datos.activoTotal} onChange={set('activoTotal')}
            hint="Todo lo que tiene la empresa" />
          <InputMoney label="Pasivo Total" value={datos.pasivoTotal} onChange={set('pasivoTotal')}
            hint="Todas las deudas" />
          <InputMoney label="Patrimonio Neto" value={datos.patrimonioNeto} onChange={set('patrimonioNeto')}
            hint="Activo - Pasivo" />
        </div>
      </div>

      {/* Flujo de Caja */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4" style={{ borderColor: '#FFFBEB' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>💵 Flujo de Caja (últimos 6 meses)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ingresos y egresos reales de caja</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 text-xs font-semibold text-gray-400 w-20">Mes</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400">Ingresos</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-gray-400">Egresos</th>
                <th className="text-right py-2 pl-3 text-xs font-semibold text-gray-400">Neto</th>
              </tr>
            </thead>
            <tbody>
              {mesesNombres.map((mes, i) => {
                const neto = (datos.ingresosMes[i] || 0) - (datos.egresosMes[i] || 0);
                return (
                  <tr key={i} className="border-t" style={{ borderColor: '#F9FAFB' }}>
                    <td className="py-2 pr-3 text-xs font-medium" style={{ color: '#6B7280' }}>{mes}</td>
                    <td className="py-1.5 px-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">S/.</span>
                        <input
                          type="number" min="0"
                          value={datos.ingresosMes[i] || ''}
                          onChange={(e) => updateFlujo('ingresosMes', i, parseFloat(e.target.value) || 0)}
                          className="w-full text-right rounded-lg border py-1.5 pr-2 pl-8 text-xs outline-none"
                          style={{ borderColor: '#E0E5EF', color: '#1B3A6B' }}
                        />
                      </div>
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">S/.</span>
                        <input
                          type="number" min="0"
                          value={datos.egresosMes[i] || ''}
                          onChange={(e) => updateFlujo('egresosMes', i, parseFloat(e.target.value) || 0)}
                          className="w-full text-right rounded-lg border py-1.5 pr-2 pl-8 text-xs outline-none"
                          style={{ borderColor: '#E0E5EF', color: '#1B3A6B' }}
                        />
                      </div>
                    </td>
                    <td className="py-2 pl-3 text-right text-xs font-bold" style={{ color: neto >= 0 ? '#22C55E' : '#E63946' }}>
                      {neto >= 0 ? '+' : ''}{fmt(neto)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%)', boxShadow: '0 4px 20px #1B3A6B40' }}
      >
        🔍 Analizar con IA →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASO 2 — RESULTADO
───────────────────────────────────────────── */
function Step2Resultado({
  resultado,
  onBack,
  onFinish,
}: {
  resultado: DiagnosticoResult;
  onBack: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header IIE */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border-2"
        style={{ background: '#F8FAFF', borderColor: resultado.colorGeneral + '40' }}
      >
        <GaugeIIE iie={resultado.iie} color={resultado.colorGeneral} />
        <div className="flex-1 text-center sm:text-left">
          <div
            className="inline-block text-xs font-black px-3 py-1 rounded-full mb-2"
            style={{ background: resultado.colorGeneral + '20', color: resultado.colorGeneral }}
          >
            {resultado.nivelGeneral === 'Saludable' ? '🟢' : resultado.nivelGeneral === 'Moderado' ? '🟡' : resultado.nivelGeneral === 'En riesgo' ? '🟠' : '🔴'} {resultado.nivelGeneral}
          </div>
          <h2 className="font-black text-xl" style={{ color: '#1B3A6B' }}>
            Índice Integral Empresarial
          </h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{resultado.resumenEjecutivo}</p>
        </div>
      </div>

      {/* Alertas */}
      {resultado.alertas.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-black text-sm" style={{ color: '#1B3A6B' }}>⚠️ Alertas activas</h3>
          {resultado.alertas.map((a, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-2.5 text-xs font-medium flex items-start gap-2"
              style={{
                background: a.tipo === 'critico' ? '#FFF1F2' : a.tipo === 'importante' ? '#FFFBEB' : '#F0FDF4',
                color: a.tipo === 'critico' ? '#9F1239' : a.tipo === 'importante' ? '#92400E' : '#166534',
                borderLeft: `3px solid ${a.tipo === 'critico' ? '#E63946' : a.tipo === 'importante' ? '#FBBF24' : '#22C55E'}`,
              }}
            >
              <span>{a.tipo === 'critico' ? '🔴' : a.tipo === 'importante' ? '🟡' : '🟢'}</span>
              {a.texto}
            </div>
          ))}
        </div>
      )}

      {/* Indicadores detalle */}
      <div className="flex flex-col gap-3">
        <h3 className="font-black text-sm" style={{ color: '#1B3A6B' }}>📊 Indicadores (toca cada uno para ver recomendación)</h3>
        {resultado.indicadores.map((ind) => (
          <IndicadorCard key={ind.nombre} ind={ind} />
        ))}
      </div>

      {/* Recomendaciones principales */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#BFDBFE' }}>
        <h3 className="font-black text-sm" style={{ color: '#1B3A6B' }}>🎯 Plan de acción recomendado</h3>
        {resultado.recomendacionesPrincipales.map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white mt-0.5"
              style={{ background: '#1B3A6B' }}
            >
              {i + 1}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{r}</p>
          </div>
        ))}
      </div>

      {/* Fecha y acciones */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>📅 Diagnóstico: {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        <span>MCF · Confidencial</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all"
          style={{ borderColor: '#E0E5EF', color: '#6B7280' }}
        >
          ← Editar datos
        </button>
        <button
          onClick={onFinish}
          className="flex-1 py-3 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%)' }}
        >
          Guardar y salir ✓
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────────── */
export default function FinancieroDiagnostico() {
  const [plan, setPlan] = usePlan();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [animating, setAnimating] = useState(false);
  const [datos, setDatos] = useState<DatosFinancieros>(DATOS_DEMO);

  const resultado = useMemo(() => calcularDiagnostico(datos), [datos]);

  const goTo = (s: 1 | 2) => {
    setAnimating(true);
    setTimeout(() => { setStep(s); setAnimating(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 180);
  };

  return (
    <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
      <div className="max-w-3xl mx-auto flex flex-col gap-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/diagnostico')} className="text-blue-500 hover:underline font-medium">
            ← Diagnósticos
          </button>
          <span className="text-gray-300">/</span>
          <span className="font-semibold" style={{ color: '#1B3A6B' }}>Diagnóstico Financiero</span>
          <span
            className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#DCFCE7', color: '#166534' }}
          >
            🟢 Plan Empresario
          </span>
        </div>

        {/* Wizard */}
        <WizardSteps step={step} />

        {/* Contenido */}
        <div
          className="transition-all duration-200"
          style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
        >
          {step === 1 && (
            <Step1Form datos={datos} onChange={setDatos} onNext={() => goTo(2)} />
          )}
          {step === 2 && (
            <Step2Resultado
              resultado={resultado}
              onBack={() => goTo(1)}
              onFinish={() => router.push('/diagnostico')}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
