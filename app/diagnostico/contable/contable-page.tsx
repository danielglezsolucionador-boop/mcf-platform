'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { usePlan } from '@/hooks/usePlan';

/* ─────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────── */
interface DatosContables {
  // Registro
  tieneContadorExterno: boolean;
  softwareContable: 'ninguno' | 'excel' | 'sistema';
  registroAlDia: boolean;
  // Documentos
  guardaComprobantes: boolean;
  tieneLibrosContables: boolean;
  conciliaBancos: boolean;
  // Gastos
  mezclaCuentasPersonales: boolean;
  tieneControlInventario: boolean;
  // Cuentas por cobrar
  diasCobranza: number;
  clientesMorosos: number; // porcentaje
  // Cuentas por pagar
  diasPago: number;
  proveedoresMorosos: number; // porcentaje de facturas vencidas
}

interface HallazgoContable {
  area: string;
  titulo: string;
  descripcion: string;
  severidad: 'critico' | 'importante' | 'moderado' | 'bien';
  impacto: string;
  accion: string;
}

interface DiagnosticoContableResult {
  score: number;
  nivel: 'Excelente' | 'Bueno' | 'Regular' | 'Deficiente';
  colorGeneral: string;
  hallazgos: HallazgoContable[];
  fortalezas: string[];
  recomendaciones: string[];
  resumen: string;
}

/* ─────────────────────────────────────────────
   MOTOR CONTABLE
───────────────────────────────────────────── */
function calcularDiagnosticoContable(d: DatosContables): DiagnosticoContableResult {
  let score = 100;
  const hallazgos: HallazgoContable[] = [];
  const fortalezas: string[] = [];

  // ── 1. CALIDAD DEL REGISTRO ──────────────
  if (!d.tieneContadorExterno) {
    score -= 15;
    hallazgos.push({
      area: 'Registro',
      titulo: 'Sin contador responsable',
      descripcion: 'No tienes un contador que supervise tu contabilidad formalmente.',
      severidad: 'importante',
      impacto: 'Riesgo de errores en declaraciones y multas tributarias por omisión.',
      accion: 'Contrata un contador externo o de planta. El costo mensual es menor a una sola multa de SUNAT.',
    });
  } else {
    fortalezas.push('Tienes un contador supervisando tu contabilidad.');
  }

  if (d.softwareContable === 'ninguno') {
    score -= 20;
    hallazgos.push({
      area: 'Registro',
      titulo: 'Sin sistema contable',
      descripcion: 'Llevas tu contabilidad sin ningún software, lo que genera alto riesgo de errores.',
      severidad: 'critico',
      impacto: 'Imposible generar estados financieros confiables. SUNAT puede rechazar tu contabilidad.',
      accion: 'Implementa al menos un sistema básico como CONCAR, SISCONT o Alegra. Hay opciones desde S/. 50/mes.',
    });
  } else if (d.softwareContable === 'excel') {
    score -= 8;
    hallazgos.push({
      area: 'Registro',
      titulo: 'Solo usas Excel',
      descripcion: 'Excel no es un sistema contable oficial y es propenso a errores humanos.',
      severidad: 'moderado',
      impacto: 'Riesgo de errores en cálculos y dificultad para generar reportes auditables.',
      accion: 'Migra a un software contable homologado. Facilita la fiscalización y ahorra tiempo.',
    });
  } else {
    fortalezas.push('Usas sistema contable profesional.');
  }

  if (!d.registroAlDia) {
    score -= 15;
    hallazgos.push({
      area: 'Registro',
      titulo: 'Registros atrasados',
      descripcion: 'Tu contabilidad no está al día, lo que genera una visión distorsionada del negocio.',
      severidad: 'importante',
      impacto: 'No puedes tomar decisiones basadas en datos reales. Riesgo de declaraciones incorrectas.',
      accion: 'Establece un cierre contable mensual fijo. Agenda 1 día al mes para actualizar todos los registros.',
    });
  } else {
    fortalezas.push('Tu contabilidad está al día.');
  }

  // ── 2. CONTROL DOCUMENTARIO ──────────────
  if (!d.guardaComprobantes) {
    score -= 20;
    hallazgos.push({
      area: 'Documentos',
      titulo: 'Sin archivo de comprobantes',
      descripcion: 'No guardas sistemáticamente tus facturas y comprobantes de pago.',
      severidad: 'critico',
      impacto: 'SUNAT puede desconocer tus deducciones de IGV e IR. Multas de hasta 50% del tributo omitido.',
      accion: 'Crea una carpeta física y digital por mes. Guarda TODO: facturas, boletas, contratos. Mínimo 5 años.',
    });
  } else {
    fortalezas.push('Guardas tus comprobantes correctamente.');
  }

  if (!d.tieneLibrosContables) {
    score -= 15;
    hallazgos.push({
      area: 'Documentos',
      titulo: 'Sin libros contables al día',
      descripcion: 'Los libros contables electrónicos (PLE) no están actualizados.',
      severidad: 'importante',
      impacto: 'Infracción tributaria. SUNAT puede imponer multa de hasta 0.6% de los ingresos netos.',
      accion: 'Actualiza tus libros electrónicos en el PLE de SUNAT. Tu contador debe encargarse de esto mensualmente.',
    });
  } else {
    fortalezas.push('Libros contables electrónicos al día.');
  }

  if (!d.conciliaBancos) {
    score -= 12;
    hallazgos.push({
      area: 'Control',
      titulo: 'Sin conciliación bancaria',
      descripcion: 'No cruzas tus registros contables con los movimientos bancarios reales.',
      severidad: 'importante',
      impacto: 'Dinero perdido no detectado, errores contables acumulados, posibles fraudes internos.',
      accion: 'Realiza conciliación bancaria mensual. Compara tu libro de bancos con el estado de cuenta. Es obligatorio.',
    });
  } else {
    fortalezas.push('Realizas conciliación bancaria regularmente.');
  }

  // ── 3. SEPARACIÓN DE CUENTAS ─────────────
  if (d.mezclaCuentasPersonales) {
    score -= 18;
    hallazgos.push({
      area: 'Gastos',
      titulo: '⚠️ Mezcla de cuentas personales y empresariales',
      descripcion: 'Usas la misma cuenta bancaria o tarjeta para gastos personales y del negocio.',
      severidad: 'critico',
      impacto: 'Contabilidad inválida. Deducciones rechazadas por SUNAT. Imposible saber la rentabilidad real.',
      accion: 'URGENTE: Abre una cuenta bancaria exclusiva para el negocio hoy mismo. Paga tu sueldo como "retiro de gerente" y no mezcles.',
    });
  } else {
    fortalezas.push('Separas correctamente gastos personales y empresariales.');
  }

  if (!d.tieneControlInventario) {
    score -= 10;
    hallazgos.push({
      area: 'Gastos',
      titulo: 'Sin control de inventario',
      descripcion: 'No llevas un registro formal de tu inventario o stock.',
      severidad: 'moderado',
      impacto: 'Pérdidas no detectadas, costo de ventas incorrecto, SUNAT puede observar diferencias.',
      accion: 'Implementa un kardex básico. Puedes empezar en Excel mientras consigues un sistema adecuado.',
    });
  } else {
    fortalezas.push('Tienes control de inventario actualizado.');
  }

  // ── 4. CUENTAS POR COBRAR ────────────────
  if (d.diasCobranza > 60) {
    score -= 12;
    hallazgos.push({
      area: 'Cobranza',
      titulo: `Cobranza lenta (${d.diasCobranza} días promedio)`,
      descripcion: 'Tus clientes tardan demasiado en pagarte, lo que afecta tu flujo de caja.',
      severidad: d.diasCobranza > 90 ? 'critico' : 'importante',
      impacto: `Con ${d.diasCobranza} días de cobranza, tu dinero está financiando a tus clientes sin interés.`,
      accion: 'Ofrece descuento del 2-3% por pronto pago. Cobra el 50% al inicio del servicio. Usa factoring si necesitas liquidez.',
    });
  } else if (d.diasCobranza > 30) {
    score -= 5;
    hallazgos.push({
      area: 'Cobranza',
      titulo: `Cobranza mejorable (${d.diasCobranza} días)`,
      descripcion: 'Tu plazo de cobranza está por encima de lo recomendado.',
      severidad: 'moderado',
      impacto: 'Capital de trabajo inmovilizado innecesariamente.',
      accion: 'Negocia plazos más cortos con nuevos clientes. Implementa recordatorios automáticos de pago.',
    });
  } else {
    fortalezas.push(`Cobranza ágil: ${d.diasCobranza} días promedio.`);
  }

  if (d.clientesMorosos > 10) {
    score -= 8;
    hallazgos.push({
      area: 'Cobranza',
      titulo: `${d.clientesMorosos}% de clientes morosos`,
      descripcion: 'Alto porcentaje de clientes con facturas vencidas sin pagar.',
      severidad: d.clientesMorosos > 20 ? 'critico' : 'importante',
      impacto: `Pérdida potencial de ${d.clientesMorosos}% de tu facturación pendiente.`,
      accion: 'Llama personalmente a los 5 clientes con mayor deuda. Ofrece plan de pagos. Evalúa reportar a Infocorp si supera 90 días.',
    });
  }

  // ── SCORE FINAL ──────────────────────────
  score = Math.max(0, Math.min(100, score));
  const nivel: DiagnosticoContableResult['nivel'] =
    score >= 80 ? 'Excelente' : score >= 60 ? 'Bueno' : score >= 40 ? 'Regular' : 'Deficiente';
  const colorGeneral =
    score >= 80 ? '#22C55E' : score >= 60 ? '#4A90D9' : score >= 40 ? '#FBBF24' : '#E63946';

  const recomendaciones: string[] = [];
  const criticos = hallazgos.filter((h) => h.severidad === 'critico');
  if (criticos.length > 0) {
    recomendaciones.push(`Atiende AHORA: ${criticos.map((h) => h.titulo).join(', ')}. Cada día que pasa aumenta el riesgo tributario.`);
  }
  recomendaciones.push('Establece un día fijo al mes para cierre contable. La disciplina mensual previene el 80% de los problemas contables.');
  recomendaciones.push('Pide a tu contador un informe mensual de 1 página con: ventas, gastos, utilidad y flujo. Si no lo tienes, algo está mal.');
  if (fortalezas.length > 2) {
    recomendaciones.push('Tu base contable es buena. Enfócate en mantener la consistencia y en digitalizar lo que aún es manual.');
  }

  const resumen =
    score >= 80
      ? `Tu contabilidad está bien gestionada con ${score}/100. Tienes una base sólida para crecer con confianza.`
      : score >= 60
      ? `Contabilidad aceptable con ${score}/100. Hay oportunidades de mejora que reducirán riesgos y mejorarán tus decisiones.`
      : score >= 40
      ? `Contabilidad con riesgos importantes: ${score}/100. Necesitas correcciones urgentes para evitar problemas con SUNAT.`
      : `Contabilidad en estado crítico: ${score}/100. Riesgo alto de multas y fiscalización. Actúa de inmediato.`;

  return {
    score,
    nivel,
    colorGeneral,
    hallazgos: hallazgos.sort((a, b) => {
      const ord = { critico: 0, importante: 1, moderado: 2, bien: 3 };
      return ord[a.severidad] - ord[b.severidad];
    }),
    fortalezas,
    recomendaciones,
    resumen,
  };
}

/* ─────────────────────────────────────────────
   DATOS DEMO
───────────────────────────────────────────── */
const DEMO: DatosContables = {
  tieneContadorExterno: true,
  softwareContable: 'excel',
  registroAlDia: true,
  guardaComprobantes: true,
  tieneLibrosContables: false,
  conciliaBancos: false,
  mezclaCuentasPersonales: true,
  tieneControlInventario: false,
  diasCobranza: 45,
  clientesMorosos: 15,
  diasPago: 30,
  proveedoresMorosos: 5,
};

/* ─────────────────────────────────────────────
   UI HELPERS
───────────────────────────────────────────── */
function WizardSteps({ step }: { step: 1 | 2 }) {
  const steps = ['Cuestionario', 'Diagnóstico IA'];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: step > i + 1 ? '#22C55E' : step === i + 1 ? '#4A90D9' : '#E5E7EB',
                color: step >= i + 1 ? 'white' : '#9CA3AF',
              }}
            >
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className="text-xs font-semibold" style={{ color: step === i + 1 ? '#4A90D9' : step > i + 1 ? '#22C55E' : '#9CA3AF' }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-12 h-0.5 mx-2" style={{ background: step > i + 1 ? '#22C55E' : '#E5E7EB' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function Toggle({ label, value, onChange, sublabel }: { label: string; value: boolean; onChange: (v: boolean) => void; sublabel?: string }) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-3 rounded-xl cursor-pointer transition-all"
      style={{ background: value ? '#EFF6FF' : '#F9FAFB', border: `1.5px solid ${value ? '#BFDBFE' : '#E5E7EB'}` }}
      onClick={() => onChange(!value)}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{label}</p>
        {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      </div>
      <div
        className="w-11 h-6 rounded-full transition-all flex items-center px-0.5 flex-shrink-0"
        style={{ background: value ? '#4A90D9' : '#D1D5DB' }}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow transition-all"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, unit, hint }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; unit: string; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold" style={{ color: '#374151' }}>{label}</label>
        <span className="text-sm font-black" style={{ color: '#4A90D9' }}>{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-300">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASO 1 — CUESTIONARIO
───────────────────────────────────────────── */
function Step1Cuestionario({ datos, onChange, onNext }: {
  datos: DatosContables;
  onChange: (d: DatosContables) => void;
  onNext: () => void;
}) {
  const set = <K extends keyof DatosContables>(key: K) => (v: DatosContables[K]) =>
    onChange({ ...datos, [key]: v });

  return (
    <div className="flex flex-col gap-5">
      {/* Registro */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#EFF6FF' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>📋 Calidad del Registro</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cómo gestionas tu contabilidad</p>
        </div>
        <Toggle
          label="¿Tienes contador responsable?"
          sublabel="Externo o de planta que supervisa tu contabilidad"
          value={datos.tieneContadorExterno}
          onChange={set('tieneContadorExterno')}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold" style={{ color: '#374151' }}>¿Qué usas para llevar tu contabilidad?</label>
          <div className="grid grid-cols-3 gap-2">
            {(['ninguno', 'excel', 'sistema'] as const).map((op) => (
              <button
                key={op}
                onClick={() => set('softwareContable')(op)}
                className="py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all"
                style={{
                  borderColor: datos.softwareContable === op ? '#4A90D9' : '#E5E7EB',
                  background: datos.softwareContable === op ? '#EFF6FF' : 'white',
                  color: datos.softwareContable === op ? '#4A90D9' : '#6B7280',
                }}
              >
                {op === 'ninguno' ? '❌ Nada' : op === 'excel' ? '📊 Excel' : '💻 Sistema'}
              </button>
            ))}
          </div>
        </div>
        <Toggle
          label="¿Tus registros están al día?"
          sublabel="Menos de 30 días de atraso en registros"
          value={datos.registroAlDia}
          onChange={set('registroAlDia')}
        />
      </div>

      {/* Documentos */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#F0FDF4' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>📁 Control Documentario</h2>
          <p className="text-xs text-gray-400 mt-0.5">Respaldo de tu contabilidad</p>
        </div>
        <Toggle
          label="¿Guardas todos tus comprobantes?"
          sublabel="Facturas, boletas, recibos físicos y/o digitales"
          value={datos.guardaComprobantes}
          onChange={set('guardaComprobantes')}
        />
        <Toggle
          label="¿Tienes libros electrónicos al día en SUNAT?"
          sublabel="PLE: Registro de Ventas y Compras electrónico"
          value={datos.tieneLibrosContables}
          onChange={set('tieneLibrosContables')}
        />
        <Toggle
          label="¿Concilias tus cuentas bancarias?"
          sublabel="Cruzas mensualmente tu contabilidad con el banco"
          value={datos.conciliaBancos}
          onChange={set('conciliaBancos')}
        />
      </div>

      {/* Gastos */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#FFFBEB' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>💳 Separación y Control de Gastos</h2>
          <p className="text-xs text-gray-400 mt-0.5">Uno de los errores más frecuentes en pymes</p>
        </div>
        <Toggle
          label="¿Mezclas cuentas personales con la empresa?"
          sublabel="Usas la misma cuenta o tarjeta para gastos personales"
          value={datos.mezclaCuentasPersonales}
          onChange={set('mezclaCuentasPersonales')}
        />
        <Toggle
          label="¿Tienes control de inventario?"
          sublabel="Kardex o sistema que registra entradas y salidas"
          value={datos.tieneControlInventario}
          onChange={set('tieneControlInventario')}
        />
      </div>

      {/* Cobranza */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-4" style={{ borderColor: '#FFF1F2' }}>
        <div>
          <h2 className="font-black text-base" style={{ color: '#1B3A6B' }}>💰 Cuentas por Cobrar</h2>
          <p className="text-xs text-gray-400 mt-0.5">Velocidad y calidad de tu cobranza</p>
        </div>
        <SliderInput
          label="Días promedio de cobranza"
          value={datos.diasCobranza}
          onChange={set('diasCobranza')}
          min={0} max={120} unit=" días"
          hint="¿Cuántos días después de la venta cobras en promedio?"
        />
        <SliderInput
          label="% de clientes con facturas vencidas"
          value={datos.clientesMorosos}
          onChange={set('clientesMorosos')}
          min={0} max={60} unit="%"
          hint="Del total de tus cuentas por cobrar, ¿qué % está vencido?"
        />
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)', boxShadow: '0 4px 20px #4A90D940' }}
      >
        📚 Analizar con IA →
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASO 2 — RESULTADO
───────────────────────────────────────────── */
function ScoreCircle({ score, color }: { score: number; color: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F1F5F9" strokeWidth="14" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="900" fill={color}>{score}</text>
        <text x="70" y="83" textAnchor="middle" fontSize="11" fill="#9CA3AF">/100</text>
      </svg>
    </div>
  );
}

function HallazgoCard({ h }: { h: HallazgoContable }) {
  const [open, setOpen] = useState(false);
  const color = h.severidad === 'critico' ? '#E63946' : h.severidad === 'importante' ? '#FBBF24' : h.severidad === 'moderado' ? '#4A90D9' : '#22C55E';
  const fondo = h.severidad === 'critico' ? '#FFF1F2' : h.severidad === 'importante' ? '#FFFBEB' : h.severidad === 'moderado' ? '#EFF6FF' : '#F0FDF4';
  return (
    <div
      className="rounded-2xl border-2 overflow-hidden cursor-pointer transition-all"
      style={{ borderColor: color + '40', background: fondo }}
      onClick={() => setOpen(!open)}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>{h.titulo}</p>
          <p className="text-xs text-gray-400">{h.area}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: color + '20', color }}
          >
            {h.severidad === 'critico' ? '🔴 Crítico' : h.severidad === 'importante' ? '🟡 Importante' : '🔵 Moderado'}
          </span>
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t" style={{ borderColor: color + '30' }}>
          <p className="text-xs text-gray-500 pt-2">{h.descripcion}</p>
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#991B1B' }}>
            <span className="font-semibold">⚡ Impacto: </span>{h.impacto}
          </div>
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: color + '15', color: '#1B3A6B' }}>
            <span className="font-semibold">💡 Qué hacer: </span>{h.accion}
          </div>
        </div>
      )}
    </div>
  );
}

function Step2Resultado({ resultado, onBack, onFinish }: {
  resultado: DiagnosticoContableResult;
  onBack: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Score general */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 border-2"
        style={{ background: '#F8FAFF', borderColor: resultado.colorGeneral + '40' }}>
        <ScoreCircle score={resultado.score} color={resultado.colorGeneral} />
        <div className="flex-1 text-center sm:text-left">
          <div
            className="inline-block text-xs font-black px-3 py-1 rounded-full mb-2"
            style={{ background: resultado.colorGeneral + '20', color: resultado.colorGeneral }}
          >
            {resultado.nivel === 'Excelente' ? '🟢' : resultado.nivel === 'Bueno' ? '🔵' : resultado.nivel === 'Regular' ? '🟡' : '🔴'} {resultado.nivel}
          </div>
          <h2 className="font-black text-xl" style={{ color: '#1B3A6B' }}>Diagnóstico Contable</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{resultado.resumen}</p>
        </div>
      </div>

      {/* Fortalezas */}
      {resultado.fortalezas.length > 0 && (
        <div className="bg-white rounded-2xl border-2 p-4 flex flex-col gap-2" style={{ borderColor: '#BBF7D0' }}>
          <h3 className="font-black text-sm" style={{ color: '#166534' }}>✅ Lo que estás haciendo bien</h3>
          {resultado.fortalezas.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-green-500 text-xs">✓</span>
              <p className="text-xs text-gray-600">{f}</p>
            </div>
          ))}
        </div>
      )}

      {/* Hallazgos */}
      {resultado.hallazgos.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-black text-sm" style={{ color: '#1B3A6B' }}>
            🔍 Hallazgos ({resultado.hallazgos.length}) — toca cada uno para ver qué hacer
          </h3>
          {resultado.hallazgos.map((h, i) => <HallazgoCard key={i} h={h} />)}
        </div>
      )}

      {/* Recomendaciones */}
      <div className="bg-white rounded-2xl border-2 p-5 flex flex-col gap-3" style={{ borderColor: '#BFDBFE' }}>
        <h3 className="font-black text-sm" style={{ color: '#1B3A6B' }}>🎯 Plan de acción</h3>
        {resultado.recomendaciones.map((r, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black text-white mt-0.5"
              style={{ background: '#4A90D9' }}>
              {i + 1}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{r}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>📅 {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        <span>MCF · Confidencial</span>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition-all"
          style={{ borderColor: '#E0E5EF', color: '#6B7280' }}>
          ← Editar
        </button>
        <button onClick={onFinish}
          className="flex-1 py-3 rounded-2xl font-black text-sm text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)' }}>
          Guardar y salir ✓
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────────── */
export default function ContableDiagnostico() {
  const [plan, setPlan] = usePlan();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [animating, setAnimating] = useState(false);
  const [datos, setDatos] = useState<DatosContables>(DEMO);

  const resultado = useMemo(() => calcularDiagnosticoContable(datos), [datos]);

  const goTo = (s: 1 | 2) => {
    setAnimating(true);
    setTimeout(() => { setStep(s); setAnimating(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 180);
  };

  return (
    <AppLayout currentPage="diagnostico" plan={plan} onPlanChange={setPlan}>
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/diagnostico')} className="text-blue-500 hover:underline font-medium">
            ← Diagnósticos
          </button>
          <span className="text-gray-300">/</span>
          <span className="font-semibold" style={{ color: '#1B3A6B' }}>Diagnóstico Contable</span>
          <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
            📚 Plan Empresario
          </span>
        </div>

        <WizardSteps step={step} />

        <div
          className="transition-all duration-200"
          style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}
        >
          {step === 1 && <Step1Cuestionario datos={datos} onChange={setDatos} onNext={() => goTo(2)} />}
          {step === 2 && <Step2Resultado resultado={resultado} onBack={() => goTo(1)} onFinish={() => router.push('/diagnostico')} />}
        </div>
      </div>
    </AppLayout>
  );
}
