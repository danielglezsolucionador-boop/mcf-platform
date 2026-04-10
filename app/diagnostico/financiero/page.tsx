'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LEVEL } from '@/components/dashboard/types';

/* ---- Tipos ---- */
interface DatosFinancieros {
  ingresos: string;
  gastos: string;
  activos: string;
  pasivos: string;
  cuentasCobrar: string;
  cuentasPagar: string;
}

interface Indicador {
  nombre: string;
  valor: number;
  unidad: string;
  color: 'verde' | 'amarillo' | 'rojo';
  label: string;
  interpretacion: string;
  recomendacion: string;
  formula: string;
}

const COLORS = { verde: '#22C55E', amarillo: '#FBBF24', rojo: '#E63946' };
const COLORS_LIGHT = { verde: '#F0FDF4', amarillo: '#FFFBEB', rojo: '#FFF1F2' };
const COLORS_BORDER = { verde: '#BBF7D0', amarillo: '#FDE68A', rojo: '#FECDD3' };

function toNum(v: string) { return parseFloat(v.replace(/,/g, '')) || 0; }

function formatSoles(n: number) {
  return 'S/. ' + n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function calcularIndicadores(d: DatosFinancieros): Indicador[] {
  const ing = toNum(d.ingresos);
  const gas = toNum(d.gastos);
  const act = toNum(d.activos);
  const pas = toNum(d.pasivos);
  const cobrar = toNum(d.cuentasCobrar);
  const pagar = toNum(d.cuentasPagar);

  const liquidez = pas > 0 ? (act + cobrar) / (pas + pagar) : 0;
  const rentabilidad = ing > 0 ? ((ing - gas) / ing) * 100 : 0;
  const endeudamiento = act > 0 ? (pas / act) * 100 : 0;
  const flujoCaja = ing - gas;

  return [
    {
      nombre: 'Ratio de Liquidez',
      valor: parseFloat(liquidez.toFixed(2)),
      unidad: 'x',
      color: liquidez >= 1.5 ? 'verde' : liquidez >= 1 ? 'amarillo' : 'rojo',
      label: liquidez >= 1.5 ? 'Muy buena' : liquidez >= 1 ? 'Aceptable' : 'En riesgo',
      interpretacion:
        liquidez >= 1.5
          ? `Tu empresa tiene S/. ${liquidez.toFixed(1)} para pagar cada sol que debe. Excelente posición.`
          : liquidez >= 1
          ? 'Puedes pagar tus deudas pero el margen es ajustado. Monitorea de cerca.'
          : 'Tu empresa no tiene suficiente liquidez para cubrir sus obligaciones a corto plazo.',
      recomendacion:
        liquidez >= 1.5
          ? 'Considera invertir el exceso de liquidez en activos productivos.'
          : liquidez >= 1
          ? 'Acelera el cobro a clientes y negocia plazos más largos con proveedores.'
          : 'Urgente: busca financiamiento de corto plazo o vende activos no esenciales para cubrir obligaciones.',
      formula: '(Activos + Cuentas por cobrar) / (Pasivos + Cuentas por pagar)',
    },
    {
      nombre: 'Rentabilidad',
      valor: parseFloat(rentabilidad.toFixed(1)),
      unidad: '%',
      color: rentabilidad >= 20 ? 'verde' : rentabilidad >= 10 ? 'amarillo' : 'rojo',
      label: rentabilidad >= 20 ? 'Alta' : rentabilidad >= 10 ? 'Moderada' : rentabilidad >= 0 ? 'Baja' : 'Pérdida',
      interpretacion:
        rentabilidad >= 20
          ? `De cada S/. 100 que vendes, ganas S/. ${rentabilidad.toFixed(0)}. Negocio muy rentable.`
          : rentabilidad >= 10
          ? `Ganas S/. ${rentabilidad.toFixed(0)} por cada S/. 100 vendidos. Rentabilidad mejorable.`
          : rentabilidad >= 0
          ? `Solo S/. ${rentabilidad.toFixed(0)} de ganancia por cada S/. 100. Riesgo de quiebre.`
          : `Estás perdiendo dinero. Por cada S/. 100 que vendes, pierdes S/. ${Math.abs(rentabilidad).toFixed(0)}.`,
      recomendacion:
        rentabilidad >= 20
          ? 'Mantén el control de costos. Considera expandir para aprovechar la rentabilidad.'
          : rentabilidad >= 10
          ? 'Revisa los 3 gastos más grandes y busca reducirlos al menos un 10%.'
          : 'Analiza urgentemente tu estructura de costos. Considera subir precios o eliminar productos no rentables.',
      formula: '(Ingresos − Gastos) / Ingresos × 100',
    },
    {
      nombre: 'Endeudamiento',
      valor: parseFloat(endeudamiento.toFixed(1)),
      unidad: '%',
      color: endeudamiento < 40 ? 'verde' : endeudamiento <= 60 ? 'amarillo' : 'rojo',
      label: endeudamiento < 40 ? 'Sano' : endeudamiento <= 60 ? 'Moderado' : 'Alto',
      interpretacion:
        endeudamiento < 40
          ? `Tu empresa es dueña del ${(100 - endeudamiento).toFixed(0)}% de sus activos. Posición sólida.`
          : endeudamiento <= 60
          ? `El ${endeudamiento.toFixed(0)}% de tus activos están financiados con deuda. Nivel manejable.`
          : `Alta dependencia de deuda (${endeudamiento.toFixed(0)}%). Tu empresa es vulnerable.`,
      recomendacion:
        endeudamiento < 40
          ? 'Puedes apalancarte responsablemente para crecer. Considera deuda productiva.'
          : endeudamiento <= 60
          ? 'No adquieras más deuda hasta reducir el nivel actual. Enfócate en generar utilidades.'
          : 'Prioridad máxima: reestructura tu deuda. Busca ampliar plazos y reducir tasas de interés.',
      formula: 'Pasivos totales / Activos totales × 100',
    },
    {
      nombre: 'Flujo de Caja',
      valor: flujoCaja,
      unidad: 'S/.',
      color: flujoCaja >= 0 ? 'verde' : 'rojo',
      label: flujoCaja >= 0 ? 'Positivo' : 'Negativo',
      interpretacion:
        flujoCaja >= 0
          ? `Generas ${formatSoles(flujoCaja)} de excedente mensual. Tu empresa produce caja.`
          : `Estás consumiendo ${formatSoles(Math.abs(flujoCaja))} más de lo que ingresas cada mes.`,
      recomendacion:
        flujoCaja >= 0
          ? 'Destina al menos el 20% del excedente a un fondo de emergencia empresarial.'
          : 'Identifica los 3 gastos más grandes y evalúa cuáles pueden reducirse o diferirse.',
      formula: 'Ingresos totales − Gastos totales',
    },
  ];
}

/* ---- Componente principal ---- */
export default function FinancieroDiagnostico() {
  const [plan, setPlan] = usePlan();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [animating, setAnimating] = useState(false);

  const [datos, setDatos] = useState<DatosFinancieros>({
    ingresos: '52000',
    gastos: '38000',
    activos: '180000',
    pasivos: '65000',
    cuentasCobrar: '28000',
    cuentasPagar: '15000',
  });
  const [errors, setErrors] = useState<Partial<DatosFinancieros>>({});

  // Bloqueo por plan
  const bloqueado = PLAN_LEVEL[plan] < PLAN_LEVEL['empresario'];

  const validate = () => {
    const newErrors: Partial<DatosFinancieros> = {};
    const campos: (keyof DatosFinancieros)[] = ['ingresos', 'gastos', 'activos', 'pasivos', 'cuentasCobrar', 'cuentasPagar'];
    campos.forEach((c) => {
      if (!datos[c] || toNum(datos[c]) < 0) newErrors[c] = 'Ingresa un valor válido';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goTo = (s: 1 | 2) => {
    setAnimating(true);
    setTimeout(() => { setStep(s); setAnimating(false); }, 180);
  };

  const handleNext = () => { if (validate()) goTo(2); };

  const indicadores = calcularIndicadores(datos);
  const scoreGeneral = Math.round(
    indicadores.filter((i) => i.color === 'verde').length * 25
  );

  if (bloqueado) {
    return (
      <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
        <FullPageLocked requiredPlan="empresario" onBack={() => router.push('/diagnostico')} />
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/diagnostico')} className="text-blue-500 hover:underline font-medium">
            ← Diagnósticos
          </button>
          <span className="text-gray-300">/</span>
          <span className="font-semibold" style={{ color: '#1B3A6B' }}>Diagnóstico Financiero</span>
        </div>

        {/* Progress steps */}
        <WizardSteps currentStep={step} steps={['Datos financieros', 'Resultados']} />

        {/* Contenido animado */}
        <div
          className="transition-all duration-200"
          style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
        >
          {step === 1 && (
            <Step1Datos datos={datos} onChange={setDatos} errors={errors} onNext={handleNext} />
          )}
          {step === 2 && (
            <Step2Resultados
              indicadores={indicadores}
              scoreGeneral={scoreGeneral}
              datos={datos}
              onBack={() => goTo(1)}
              onFinish={() => router.push('/diagnostico')}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

/* ---- Paso 1: Datos ---- */
function Step1Datos({
  datos, onChange, errors, onNext,
}: {
  datos: DatosFinancieros;
  onChange: (d: DatosFinancieros) => void;
  errors: Partial<DatosFinancieros>;
  onNext: () => void;
}) {
  const set = (k: keyof DatosFinancieros, v: string) => onChange({ ...datos, [k]: v });

  const campos = [
    { key: 'ingresos' as const, label: 'Ingresos del mes actual', hint: 'Total de ventas y otros ingresos del mes', icon: '📈' },
    { key: 'gastos' as const, label: 'Gastos del mes actual', hint: 'Sueldos, alquiler, compras, servicios y todos los gastos', icon: '📉' },
    { key: 'activos' as const, label: 'Activos totales', hint: 'Todo lo que tiene la empresa: dinero, mercadería, equipos, inmuebles', icon: '🏢' },
    { key: 'pasivos' as const, label: 'Pasivos totales', hint: 'Todo lo que debe la empresa: préstamos, deudas, tributos por pagar', icon: '💳' },
    { key: 'cuentasCobrar' as const, label: 'Cuentas por cobrar', hint: 'Clientes que te adeudan dinero por ventas ya realizadas', icon: '📤' },
    { key: 'cuentasPagar' as const, label: 'Cuentas por pagar', hint: 'Lo que debes a proveedores por compras ya recibidas', icon: '📥' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: '#F1F5F9' }}>
        <h2 className="font-black text-lg" style={{ color: '#1B3A6B' }}>Datos financieros de tu empresa</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Prellenados con datos de tu perfil. Corrígelos si es necesario.
        </p>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {campos.map(({ key, label, hint, icon }) => (
          <div key={key}>
            <label className="text-sm font-semibold flex items-center gap-1.5 mb-1" style={{ color: '#1B3A6B' }}>
              <span>{icon}</span> {label}
            </label>
            <p className="text-xs text-gray-400 mb-1.5">{hint}</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">S/.</span>
              <input
                type="number"
                min="0"
                value={datos[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full rounded-xl border-2 py-3 pl-10 pr-4 text-sm outline-none transition-all"
                style={{
                  borderColor: errors[key] ? '#E63946' : '#E0E5EF',
                  color: '#1B3A6B',
                }}
                placeholder="0"
              />
            </div>
            {errors[key] && <p className="text-xs mt-1" style={{ color: '#E63946' }}>{errors[key]}</p>}
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
        <button
          onClick={onNext}
          className="py-3 px-8 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
        >
          Calcular indicadores
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ---- Paso 2: Resultados ---- */
function Step2Resultados({
  indicadores, scoreGeneral, datos, onBack, onFinish,
}: {
  indicadores: Indicador[];
  scoreGeneral: number;
  datos: DatosFinancieros;
  onBack: () => void;
  onFinish: () => void;
}) {
  const colorScore = scoreGeneral >= 75 ? 'verde' : scoreGeneral >= 50 ? 'amarillo' : 'rojo';
  const labelScore = scoreGeneral >= 75 ? 'Salud financiera buena' : scoreGeneral >= 50 ? 'Salud financiera regular' : 'Salud financiera en riesgo';

  return (
    <div className="flex flex-col gap-4">
      {/* Score general */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5 border-2"
        style={{ background: COLORS_LIGHT[colorScore], borderColor: COLORS_BORDER[colorScore] }}
      >
        <div
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center flex-shrink-0 border-4"
          style={{ borderColor: COLORS[colorScore], background: 'white' }}
        >
          <span className="text-2xl font-black" style={{ color: COLORS[colorScore] }}>{scoreGeneral}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS[colorScore] }}>
            Resultado general
          </p>
          <h3 className="font-black text-lg" style={{ color: '#1B3A6B' }}>{labelScore}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {indicadores.filter((i) => i.color === 'verde').length} de {indicadores.length} indicadores en verde
          </p>
        </div>
      </div>

      {/* Indicadores individuales */}
      {indicadores.map((ind) => (
        <IndicadorCard key={ind.nombre} indicador={ind} />
      ))}

      {/* Botones */}
      <div className="flex gap-3 mt-2">
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
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
        >
          Guardar diagnóstico ✓
        </button>
      </div>
    </div>
  );
}

function IndicadorCard({ indicador: ind }: { indicador: Indicador }) {
  const [expanded, setExpanded] = useState(false);
  const c = ind.color;

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden"
      style={{ borderColor: COLORS_BORDER[c], background: 'white' }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center gap-4"
        style={{ background: COLORS_LIGHT[c] }}
      >
        {/* Semáforo */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-base"
          style={{ background: COLORS[c], color: 'white' }}
        >
          {c === 'verde' ? '✓' : c === 'amarillo' ? '!' : '✕'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{ind.nombre}</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black" style={{ color: COLORS[c] }}>
              {ind.unidad === 'S/.' ? `S/. ${Math.abs(ind.valor).toLocaleString('es-PE')}` : `${ind.valor}${ind.unidad}`}
            </span>
            {ind.unidad === 'S/.' && ind.valor < 0 && (
              <span className="text-xs font-semibold" style={{ color: COLORS.rojo }}>negativo</span>
            )}
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: COLORS[c] + '20', color: COLORS[c] }}
          >
            {ind.label}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="px-5 py-4 flex flex-col gap-3 border-t" style={{ borderColor: COLORS_BORDER[c] }}>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Fórmula</p>
            <code className="text-xs bg-gray-50 px-2 py-1 rounded-lg text-gray-600">{ind.formula}</code>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Interpretación</p>
            <p className="text-sm text-gray-700 leading-relaxed">{ind.interpretacion}</p>
          </div>
          <div
            className="rounded-xl p-3 border"
            style={{ background: COLORS_LIGHT[c], borderColor: COLORS_BORDER[c] }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: COLORS[c] }}>💡 Recomendación MCF</p>
            <p className="text-xs text-gray-700 leading-relaxed">{ind.recomendacion}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Componentes compartidos ---- */
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
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
              style={{
                background: isDone ? '#22C55E' : isActive ? '#1B3A6B' : '#E5E7EB',
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

function FullPageLocked({ requiredPlan, onBack }: { requiredPlan: string; onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-5 py-12 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: '#F1F5F9' }}>
        🔒
      </div>
      <div>
        <h2 className="text-xl font-black" style={{ color: '#1B3A6B' }}>Función bloqueada</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          El Diagnóstico Financiero está disponible desde el{' '}
          <span className="font-semibold">Plan {requiredPlan === 'pro' ? 'Pro' : 'Empresario'}</span>.
          Actualiza tu plan para acceder.
        </p>
      </div>
      <button
        className="py-3 px-6 rounded-2xl font-bold text-white shadow-md hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}
      >
        Ver planes y precios
      </button>
      <button onClick={onBack} className="text-sm font-medium underline" style={{ color: '#4A90D9' }}>
        ← Volver a diagnósticos
      </button>
    </div>
  );
}
