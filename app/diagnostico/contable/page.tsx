'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LEVEL } from '@/components/dashboard/types';

/* ---- Cuestionario ---- */
interface Pregunta {
  id: number;
  texto: string;
  positivo: 'si' | 'no'; // qué respuesta es buena
  penalidad: number;      // puntos que se restan si responde mal
  problemaSi: string;
  problemaNO: string;
  recomendacion: string;
  severidad: 'crítico' | 'importante' | 'moderado';
}

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Llevas registro de todos tus ingresos?',
    positivo: 'si',
    penalidad: 15,
    problemaSi: '',
    problemaNO: 'No registras todos tus ingresos. Esto puede generar inconsistencias con SUNAT.',
    recomendacion: 'Implementa un cuaderno de ingresos diario o usa un software de facturación electrónica. Registra cada venta al momento de realizarla.',
    severidad: 'crítico',
  },
  {
    id: 2,
    texto: '¿Tienes todos los comprobantes de tus gastos?',
    positivo: 'si',
    penalidad: 15,
    problemaSi: '',
    problemaNO: 'Sin comprobantes, tus gastos no son deducibles y SUNAT puede observarlos.',
    recomendacion: 'Exige siempre factura o boleta por cada gasto. Digitaliza los comprobantes en una carpeta en la nube (Google Drive, Dropbox).',
    severidad: 'crítico',
  },
  {
    id: 3,
    texto: '¿Clasificas tus gastos por categorías?',
    positivo: 'si',
    penalidad: 10,
    problemaSi: '',
    problemaNO: 'Sin clasificación no puedes identificar dónde se va tu dinero ni optimizar gastos.',
    recomendacion: 'Crea al menos 5 categorías: Planillas, Compras/Inventario, Alquileres, Servicios, Marketing. Clasifica cada semana.',
    severidad: 'moderado',
  },
  {
    id: 4,
    texto: '¿Concilias tu cuenta bancaria con tu contabilidad mensualmente?',
    positivo: 'si',
    penalidad: 15,
    problemaSi: '',
    problemaNO: 'Sin conciliación bancaria puedes tener diferencias contables sin detectar.',
    recomendacion: 'El último día de cada mes, compara el estado de cuenta bancario con tus registros contables. Cualquier diferencia debe investigarse.',
    severidad: 'importante',
  },
  {
    id: 5,
    texto: '¿Tienes deudas con proveedores sin registrar en tu contabilidad?',
    positivo: 'no',
    penalidad: 10,
    problemaSi: 'Tienes pasivos ocultos. Tu contabilidad no refleja la realidad de tu empresa.',
    problemaNO: '',
    recomendacion: 'Levanta un inventario de todas tus deudas con proveedores. Registra inmediatamente cada compra al crédito como una cuenta por pagar.',
    severidad: 'importante',
  },
  {
    id: 6,
    texto: '¿Has mezclado gastos personales con los del negocio?',
    positivo: 'no',
    penalidad: 15,
    problemaSi: 'Mezclar gastos personales con los del negocio es una infracción tributaria y distorsiona tu contabilidad.',
    problemaNO: '',
    recomendacion: 'Separa completamente las cuentas bancarias personales y de la empresa. Usa tarjetas distintas. Los gastos personales nunca deben pasar por la empresa.',
    severidad: 'crítico',
  },
  {
    id: 7,
    texto: '¿Tu contador te entrega reportes mensuales?',
    positivo: 'si',
    penalidad: 10,
    problemaSi: '',
    problemaNO: 'Sin reportes mensuales, tomas decisiones sin información financiera actualizada.',
    recomendacion: 'Exige a tu contador: Estado de Resultados, Balance General y Flujo de Caja cada mes. Si no cumple, considera cambiar de contador.',
    severidad: 'moderado',
  },
  {
    id: 8,
    texto: '¿Tienes respaldo digital de tus documentos contables?',
    positivo: 'si',
    penalidad: 10,
    problemaSi: '',
    problemaNO: 'Sin respaldo digital, perder documentos físicos puede costarte caro ante una fiscalización.',
    recomendacion: 'Escanea o fotografia todos los documentos contables. Guárdalos en la nube por al menos 5 años (obligatorio por ley peruana).',
    severidad: 'moderado',
  },
];

type Respuesta = 'si' | 'no' | null;

export default function ContableDiagnostico() {
  const [plan, setPlan] = usePlan();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [animating, setAnimating] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<number, Respuesta>>(
    Object.fromEntries(PREGUNTAS.map((p) => [p.id, null]))
  );
  const [errorMsg, setErrorMsg] = useState('');

  const bloqueado = PLAN_LEVEL[plan] < PLAN_LEVEL['empresario'];

  const responder = (id: number, r: Respuesta) => {
    setRespuestas((prev) => ({ ...prev, [id]: r }));
    setErrorMsg('');
  };

  const goTo = (s: 1 | 2) => {
    setAnimating(true);
    setTimeout(() => { setStep(s); setAnimating(false); }, 180);
  };

  const handleNext = () => {
    const sinResponder = PREGUNTAS.filter((p) => respuestas[p.id] === null);
    if (sinResponder.length > 0) {
      setErrorMsg(`Faltan ${sinResponder.length} pregunta${sinResponder.length > 1 ? 's' : ''} por responder`);
      return;
    }
    goTo(2);
  };

  /* ---- Cálculo del score ---- */
  const calcularScore = () => {
    let score = 100;
    const problemas: { pregunta: Pregunta; descripcion: string }[] = [];

    PREGUNTAS.forEach((p) => {
      const r = respuestas[p.id];
      const esMala = r !== null && r !== p.positivo;
      if (esMala) {
        score -= p.penalidad;
        problemas.push({
          pregunta: p,
          descripcion: r === 'si' ? p.problemaSi : p.problemaNO,
        });
      }
    });

    return { score: Math.max(0, score), problemas };
  };

  const { score, problemas } = calcularScore();

  if (bloqueado) {
    return (
      <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
        <FullPageLocked onBack={() => router.push('/diagnostico')} />
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
          <span className="font-semibold" style={{ color: '#1B3A6B' }}>Diagnóstico Contable</span>
        </div>

        <WizardSteps currentStep={step} steps={['Cuestionario', 'Resultado']} />

        <div
          className="transition-all duration-200"
          style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
        >
          {step === 1 && (
            <Step1Cuestionario
              respuestas={respuestas}
              onResponder={responder}
              onNext={handleNext}
              errorMsg={errorMsg}
            />
          )}
          {step === 2 && (
            <Step2Resultado
              score={score}
              problemas={problemas}
              onBack={() => goTo(1)}
              onFinish={() => router.push('/diagnostico')}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

/* ---- Paso 1: Cuestionario ---- */
function Step1Cuestionario({
  respuestas, onResponder, onNext, errorMsg,
}: {
  respuestas: Record<number, Respuesta>;
  onResponder: (id: number, r: Respuesta) => void;
  onNext: () => void;
  errorMsg: string;
}) {
  const respondidas = Object.values(respuestas).filter((r) => r !== null).length;
  const pct = Math.round((respondidas / PREGUNTAS.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: '#F1F5F9' }}>
        <h2 className="font-black text-lg" style={{ color: '#1B3A6B' }}>Cuestionario contable</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Responde honestamente. Mientras más preciso seas, mejor será tu diagnóstico.
        </p>
        {/* Progreso del cuestionario */}
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">{respondidas} / {PREGUNTAS.length} respondidas</span>
            <span className="text-xs font-semibold" style={{ color: '#4A90D9' }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: '#4A90D9' }}
            />
          </div>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
        {PREGUNTAS.map((p, i) => {
          const r = respuestas[p.id];
          const isBadAnswer = r !== null && r !== p.positivo;
          return (
            <div
              key={p.id}
              className="px-6 py-4 flex items-start gap-4 transition-colors"
              style={{ background: isBadAnswer ? '#FFF8F8' : 'transparent' }}
            >
              {/* Número */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{
                  background: r !== null ? (isBadAnswer ? '#FEE2E2' : '#D1FAE5') : '#F3F4F6',
                  color: r !== null ? (isBadAnswer ? '#E63946' : '#22C55E') : '#9CA3AF',
                }}
              >
                {r !== null ? (isBadAnswer ? '!' : '✓') : i + 1}
              </div>

              {/* Pregunta + botones */}
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{p.texto}</p>
                <div className="flex gap-2 mt-2.5">
                  {(['si', 'no'] as const).map((opcion) => {
                    const isSelected = r === opcion;
                    const isBad = isSelected && opcion !== p.positivo;
                    return (
                      <button
                        key={opcion}
                        onClick={() => onResponder(p.id, opcion)}
                        className="px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all active:scale-95"
                        style={{
                          background: isSelected
                            ? isBad ? '#E63946' : '#22C55E'
                            : 'white',
                          borderColor: isSelected
                            ? isBad ? '#E63946' : '#22C55E'
                            : '#E0E5EF',
                          color: isSelected ? 'white' : '#6B7280',
                        }}
                      >
                        {opcion === 'si' ? '✓ Sí' : '✕ No'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
        {errorMsg && (
          <p className="text-sm font-semibold text-center mb-3" style={{ color: '#E63946' }}>
            ⚠ {errorMsg}
          </p>
        )}
        <button
          onClick={onNext}
          className="w-full py-3 px-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
          style={{ background: 'linear-gradient(135deg, #4A90D9 0%, #1B3A6B 100%)' }}
        >
          Ver mi resultado contable →
        </button>
      </div>
    </div>
  );
}

/* ---- Paso 2: Resultado ---- */
function Step2Resultado({
  score, problemas, onBack, onFinish,
}: {
  score: number;
  problemas: { pregunta: Pregunta; descripcion: string }[];
  onBack: () => void;
  onFinish: () => void;
}) {
  const colorScore = score >= 80 ? '#22C55E' : score >= 60 ? '#FBBF24' : '#E63946';
  const labelScore = score >= 80 ? 'Contabilidad en buen estado' : score >= 60 ? 'Contabilidad con problemas' : 'Contabilidad en riesgo crítico';
  const SEVER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    crítico: { bg: '#FEE2E2', text: '#E63946', label: 'Crítico' },
    importante: { bg: '#FEF3C7', text: '#D97706', label: 'Importante' },
    moderado: { bg: '#DBEAFE', text: '#1E40AF', label: 'Moderado' },
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Score */}
      <div
        className="rounded-2xl p-5 flex items-center gap-5 border-2"
        style={{
          background: score >= 80 ? '#F0FDF4' : score >= 60 ? '#FFFBEB' : '#FFF1F2',
          borderColor: colorScore + '60',
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center flex-shrink-0 border-4 bg-white"
          style={{ borderColor: colorScore }}
        >
          <span className="text-2xl font-black" style={{ color: colorScore }}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colorScore }}>
            Puntaje contable
          </p>
          <h3 className="font-black text-lg" style={{ color: '#1B3A6B' }}>{labelScore}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {problemas.length === 0
              ? '¡Sin problemas detectados! Tu contabilidad es sólida.'
              : `${problemas.length} problema${problemas.length > 1 ? 's' : ''} detectado${problemas.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Problemas */}
      {problemas.length > 0 && (
        <div className="bg-white rounded-2xl border-2 overflow-hidden" style={{ borderColor: '#F1F5F9' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#F1F5F9', background: '#FAFBFC' }}>
            <h4 className="font-bold text-sm" style={{ color: '#1B3A6B' }}>
              🔍 Problemas detectados
            </h4>
          </div>
          <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
            {problemas.map(({ pregunta: p, descripcion }) => {
              const s = SEVER_COLORS[p.severidad];
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: s.bg, color: s.text }}
                    >
                      {s.label}
                    </span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{p.texto}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{descripcion}</p>
                      <div
                        className="mt-2 p-2.5 rounded-lg border text-xs leading-relaxed"
                        style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#065F46' }}
                      >
                        <span className="font-semibold">💡 Cómo resolverlo: </span>
                        {p.recomendacion}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 mt-1">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-4 rounded-2xl font-semibold text-sm border-2 transition-all hover:bg-gray-50 active:scale-95"
          style={{ color: '#1B3A6B', borderColor: '#E0E5EF' }}
        >
          ← Modificar respuestas
        </button>
        <button
          onClick={onFinish}
          className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
          style={{ background: 'linear-gradient(135deg, #4A90D9 0%, #1B3A6B 100%)' }}
        >
          Guardar diagnóstico ✓
        </button>
      </div>
    </div>
  );
}

/* ---- Componentes auxiliares ---- */
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
                background: isDone ? '#22C55E' : isActive ? '#4A90D9' : '#E5E7EB',
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

function FullPageLocked({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-5 py-12 text-center">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: '#F1F5F9' }}>🔒</div>
      <div>
        <h2 className="text-xl font-black" style={{ color: '#1B3A6B' }}>Función bloqueada</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          El Diagnóstico Contable requiere el <span className="font-semibold">Plan Empresario</span>.
        </p>
      </div>
      <button className="py-3 px-6 rounded-2xl font-bold text-white shadow-md hover:opacity-90 active:scale-95" style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}>
        Ver planes y precios
      </button>
      <button onClick={onBack} className="text-sm font-medium underline" style={{ color: '#4A90D9' }}>← Volver</button>
    </div>
  );
}
