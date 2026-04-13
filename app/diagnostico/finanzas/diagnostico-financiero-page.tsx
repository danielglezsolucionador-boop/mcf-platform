'use client';

import { useState } from 'react';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
type Step = 'intro' | 'form' | 'analizando' | 'resultado';

interface DatosFinancieros {
  ventasMensuales: string;
  costoVentas: string;
  activoCorriente: string;
  pasivoCorriente: string;
  pasivoTotal: string;
  activoTotal: string;
  cuentasPorCobrar: string;
  utilidadNeta: string;
}

interface RatioResult {
  nombre: string;
  valor: number;
  ideal: string;
  score: number;
  descripcion: string;
  interpretacion: string;
}

// ─── COLORES MCF ─────────────────────────────────────────────────────────────
const NAVY = '#1B3A6B';

function scoreColor(s: number) {
  if (s >= 80) return '#16A34A';
  if (s >= 60) return '#D97706';
  return '#DC2626';
}
function scoreLabel(s: number) {
  if (s >= 80) return 'Saludable';
  if (s >= 60) return 'En riesgo';
  return 'Crítico';
}
function scoreBg(s: number) {
  if (s >= 80) return '#F0FDF4';
  if (s >= 60) return '#FFFBEB';
  return '#FEF2F2';
}
function scoreEmoji(s: number) {
  if (s >= 80) return '🟢';
  if (s >= 60) return '🟡';
  return '🔴';
}

// ─── LÓGICA DE DIAGNÓSTICO ───────────────────────────────────────────────────
function calcularDiagnostico(datos: DatosFinancieros): {
  ratios: RatioResult[];
  scoreGlobal: number;
  recomendaciones: string[];
} {
  const ventas = parseFloat(datos.ventasMensuales) || 0;
  const costo = parseFloat(datos.costoVentas) || 0;
  const activoCte = parseFloat(datos.activoCorriente) || 0;
  const pasivoCte = parseFloat(datos.pasivoCorriente) || 0;
  const pasivoTotal = parseFloat(datos.pasivoTotal) || 0;
  const activoTotal = parseFloat(datos.activoTotal) || 0;
  const cxc = parseFloat(datos.cuentasPorCobrar) || 0;
  const utilidad = parseFloat(datos.utilidadNeta) || 0;

  const ratios: RatioResult[] = [];

  // 1. Ratio de Liquidez Corriente
  const liquidez = pasivoCte > 0 ? activoCte / pasivoCte : 0;
  const scoreLiquidez = liquidez >= 2 ? 100 : liquidez >= 1.5 ? 85 : liquidez >= 1 ? 65 : liquidez >= 0.5 ? 40 : 15;
  ratios.push({
    nombre: 'Ratio de liquidez corriente',
    valor: Math.round(liquidez * 100) / 100,
    ideal: '> 1.5 (óptimo > 2.0)',
    score: scoreLiquidez,
    descripcion: 'Mide si puedes pagar tus deudas de corto plazo con tus activos corrientes.',
    interpretacion:
      liquidez >= 1.5
        ? 'Tu liquidez es adecuada. Tienes capacidad para cubrir deudas inmediatas.'
        : liquidez >= 1
        ? 'Liquidez ajustada. Cuidado con compromisos nuevos de corto plazo.'
        : 'Riesgo de iliquidez. Prioriza cobrar cuentas pendientes urgentemente.',
  });

  // 2. Ratio de Endeudamiento
  const endeudamiento = activoTotal > 0 ? (pasivoTotal / activoTotal) * 100 : 0;
  const scoreEndeud =
    endeudamiento <= 30 ? 100 : endeudamiento <= 50 ? 80 : endeudamiento <= 65 ? 60 : endeudamiento <= 80 ? 35 : 15;
  ratios.push({
    nombre: 'Ratio de endeudamiento',
    valor: Math.round(endeudamiento * 10) / 10,
    ideal: '< 50% (óptimo < 30%)',
    score: scoreEndeud,
    descripcion: 'Porcentaje de tus activos que están financiados con deuda.',
    interpretacion:
      endeudamiento <= 50
        ? 'Nivel de deuda saludable. Tu empresa depende principalmente de capital propio.'
        : endeudamiento <= 70
        ? 'Endeudamiento moderado. Evalúa antes de asumir nuevos créditos.'
        : 'Alto nivel de deuda. Considera reestructurar pasivos o incrementar capital.',
  });

  // 3. Margen de Utilidad Neta
  const margen = ventas > 0 ? (utilidad / ventas) * 100 : 0;
  const scoreMargen =
    margen >= 20 ? 100 : margen >= 10 ? 85 : margen >= 5 ? 65 : margen >= 0 ? 40 : 10;
  ratios.push({
    nombre: 'Margen de utilidad neta',
    valor: Math.round(margen * 10) / 10,
    ideal: '> 10% (óptimo > 20%)',
    score: scoreMargen,
    descripcion: 'Porcentaje de ganancia que queda de cada sol vendido.',
    interpretacion:
      margen >= 10
        ? 'Rentabilidad positiva. Tu negocio genera ganancias saludables.'
        : margen >= 5
        ? 'Rentabilidad baja. Revisa estructura de costos y precios.'
        : 'Rentabilidad en riesgo. Analiza urgentemente costos y gastos operativos.',
  });

  // 4. Capital de Trabajo
  const capitalTrabajo = activoCte - pasivoCte;
  const scoreCapital =
    capitalTrabajo > activoTotal * 0.3
      ? 100
      : capitalTrabajo > activoTotal * 0.15
      ? 80
      : capitalTrabajo > 0
      ? 60
      : capitalTrabajo > -activoTotal * 0.1
      ? 35
      : 10;
  ratios.push({
    nombre: 'Capital de trabajo',
    valor: capitalTrabajo,
    ideal: 'Positivo y creciente',
    score: scoreCapital,
    descripcion: 'Recursos disponibles para operar el día a día de tu empresa.',
    interpretacion:
      capitalTrabajo > 0
        ? 'Capital de trabajo positivo. Tienes recursos para operar sin apuros.'
        : 'Capital de trabajo negativo. Riesgo operativo alto — actúa inmediatamente.',
  });

  // 5. Rotación de Cuentas por Cobrar
  const rotacionCxC = cxc > 0 ? ventas / cxc : 0;
  const diasCobro = rotacionCxC > 0 ? Math.round(30 / rotacionCxC) : 0;
  const scoreRotacion =
    diasCobro <= 30 ? 100 : diasCobro <= 45 ? 80 : diasCobro <= 60 ? 60 : diasCobro <= 90 ? 35 : 10;
  ratios.push({
    nombre: 'Días de cobro (CxC)',
    valor: diasCobro,
    ideal: '< 30 días (óptimo < 15 días)',
    score: scoreRotacion,
    descripcion: 'Promedio de días que tardas en cobrar tus ventas al crédito.',
    interpretacion:
      diasCobro <= 30
        ? 'Cobras rápido. Tu ciclo de efectivo es eficiente.'
        : diasCobro <= 60
        ? 'Cobranza media. Implementa políticas de cobro más estrictas.'
        : 'Cobranza lenta. Riesgo de morosidad — revisa clientes y condiciones de crédito.',
  });

  const scoreGlobal = Math.round(
    ratios.reduce((s, r) => s + r.score, 0) / ratios.length
  );

  // Recomendaciones automáticas
  const recomendaciones: string[] = [];
  const ratioLiquidez = ratios[0];
  const ratioEndeud = ratios[1];
  const ratioMargen = ratios[2];
  const ratioCapital = ratios[3];
  const ratioCobro = ratios[4];

  if (ratioLiquidez.score < 65)
    recomendaciones.push('Acelera el cobro de cuentas pendientes y negocia extensión de plazos con proveedores para mejorar liquidez.');
  if (ratioEndeud.score < 65)
    recomendaciones.push('Evalúa refinanciar deudas a mayor plazo y evita nuevos créditos de corto plazo hasta reducir el ratio de endeudamiento.');
  if (ratioMargen.score < 65)
    recomendaciones.push('Revisa tu estructura de costos — identifica los 3 gastos más altos y negocia mejores condiciones con tus proveedores.');
  if (ratioCapital.score < 65)
    recomendaciones.push('Tu capital de trabajo está en riesgo. Considera línea de crédito revolvente con tu banco para operaciones del día a día.');
  if (ratioCobro.score < 65)
    recomendaciones.push(`Estás cobrando en ${diasCobro} días promedio — demasiado. Implementa descuentos por pronto pago (2% a 10 días) para acelerar el flujo.`);

  if (recomendaciones.length === 0)
    recomendaciones.push('¡Excelente salud financiera! Mantén tus indicadores actualizados mensualmente y considera reinvertir utilidades para crecer.');

  return { ratios, scoreGlobal, recomendaciones };
}

// ─── GAUGE SVG ────────────────────────────────────────────────────────────────
function GaugeMini({ score }: { score: number }) {
  const r = 40, circ = 2 * Math.PI * r, fill = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: 100, height: 100 }}>
      <svg width={100} height={100} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={50} cy={50} r={r} fill="none" stroke="#E8EFF7" strokeWidth={10} />
        <circle cx={50} cy={50} r={r} fill="none" stroke={scoreColor(score)}
          strokeWidth={10} strokeLinecap="round"
          strokeDasharray={`${fill} ${circ - fill}`} />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(score), lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: '#64748B', marginTop: 1 }}>/ 100</div>
      </div>
    </div>
  );
}

// ─── CAMPO DE FORMULARIO ──────────────────────────────────────────────────────
function Campo({
  label, campo, valor, onChange, ayuda, prefijo = 'S/.',
}: {
  label: string; campo: keyof DatosFinancieros; valor: string;
  onChange: (c: keyof DatosFinancieros, v: string) => void;
  ayuda?: string; prefijo?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>
      {ayuda && <span style={{ fontSize: 10, color: '#94A3B8' }}>{ayuda}</span>}
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
        <span style={{ padding: '0 10px', fontSize: 12, color: '#94A3B8', background: '#F8FAFC', borderRight: '1px solid #E2E8F0', height: 38, display: 'flex', alignItems: 'center' }}>{prefijo}</span>
        <input
          type="number" min="0" value={valor}
          onChange={(e) => onChange(campo, e.target.value)}
          placeholder="0.00"
          style={{ flex: 1, border: 'none', outline: 'none', padding: '0 12px', fontSize: 13, height: 38, color: '#1E293B', background: '#fff' }}
        />
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function DiagnosticoFinanciero() {
  const [step, setStep] = useState<Step>('intro');
  const [datos, setDatos] = useState<DatosFinancieros>({
    ventasMensuales: '',
    costoVentas: '',
    activoCorriente: '',
    pasivoCorriente: '',
    pasivoTotal: '',
    activoTotal: '',
    cuentasPorCobrar: '',
    utilidadNeta: '',
  });
  const [resultado, setResultado] = useState<ReturnType<typeof calcularDiagnostico> | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  const handleChange = (campo: keyof DatosFinancieros, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const formValido = Object.values(datos).every((v) => v !== '' && parseFloat(v) >= 0);

  const iniciarAnalisis = () => {
    setStep('analizando');
    setTimeout(() => {
      const res = calcularDiagnostico(datos);
      setResultado(res);
      setStep('resultado');
    }, 2200);
  };

  const reiniciar = () => {
    setStep('intro');
    setDatos({ ventasMensuales: '', costoVentas: '', activoCorriente: '', pasivoCorriente: '', pasivoTotal: '', activoTotal: '', cuentasPorCobrar: '', utilidadNeta: '' });
    setResultado(null);
    setExpandido(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <a href="/diagnostico" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>← Diagnósticos</a>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>💰 Diagnóstico Financiero</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
            Análisis de liquidez, endeudamiento, rentabilidad y flujo de tu empresa
          </p>
        </div>

        {/* ── INTRO ─────────────────────────────────────────────────────── */}
        {step === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12 }}>¿Qué vas a obtener?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '📊', texto: 'Score financiero de 0 a 100 con semáforo de colores' },
                  { icon: '📐', texto: '5 ratios clave calculados automáticamente' },
                  { icon: '⚠️', texto: 'Alertas sobre los indicadores en riesgo' },
                  { icon: '✅', texto: 'Recomendaciones concretas personalizadas para tu empresa' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: '#374151' }}>{item.texto}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#EFF6FF', borderRadius: 12, border: '1px solid #BFDBFE', padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', marginBottom: 4 }}>📋 Qué necesitas tener a la mano</div>
              <div style={{ fontSize: 12, color: '#1E40AF' }}>
                Balance General y Estado de Resultados del último mes. Si no tienes los documentos exactos, puedes ingresar valores aproximados — igual obtendrás un diagnóstico útil.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94A3B8', marginTop: -4 }}>
              <span>⏱</span>
              <span>Tiempo estimado: 5 minutos</span>
            </div>

            <button
              onClick={() => setStep('form')}
              style={{
                background: NAVY, color: '#fff', border: 'none', borderRadius: 12,
                padding: '14px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%',
              }}
            >
              Iniciar diagnóstico →
            </button>
          </div>
        )}

        {/* ── FORMULARIO ────────────────────────────────────────────────── */}
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Sección 1: Resultados */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                1️⃣ Estado de resultados — último mes
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Campo label="Ventas totales" campo="ventasMensuales" valor={datos.ventasMensuales} onChange={handleChange}
                  ayuda="Total facturado en el mes" />
                <Campo label="Costo de ventas" campo="costoVentas" valor={datos.costoVentas} onChange={handleChange}
                  ayuda="Costo directo de productos/servicios" />
                <Campo label="Utilidad neta" campo="utilidadNeta" valor={datos.utilidadNeta} onChange={handleChange}
                  ayuda="Ganancia después de todos los gastos" />
                <Campo label="Cuentas por cobrar" campo="cuentasPorCobrar" valor={datos.cuentasPorCobrar} onChange={handleChange}
                  ayuda="Ventas al crédito pendientes de cobro" />
              </div>
            </div>

            {/* Sección 2: Balance */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                2️⃣ Balance general — al cierre del mes
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Campo label="Activo corriente" campo="activoCorriente" valor={datos.activoCorriente} onChange={handleChange}
                  ayuda="Caja + banco + CxC + inventarios" />
                <Campo label="Pasivo corriente" campo="pasivoCorriente" valor={datos.pasivoCorriente} onChange={handleChange}
                  ayuda="Deudas que vencen en menos de 1 año" />
                <Campo label="Activo total" campo="activoTotal" valor={datos.activoTotal} onChange={handleChange}
                  ayuda="Todo lo que posee tu empresa" />
                <Campo label="Pasivo total" campo="pasivoTotal" valor={datos.pasivoTotal} onChange={handleChange}
                  ayuda="Total de deudas (corto y largo plazo)" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('intro')}
                style={{
                  flex: 1, background: '#fff', color: '#374151', border: '1px solid #E2E8F0',
                  borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                ← Volver
              </button>
              <button
                onClick={iniciarAnalisis}
                disabled={!formValido}
                style={{
                  flex: 3, background: formValido ? NAVY : '#E2E8F0',
                  color: formValido ? '#fff' : '#94A3B8',
                  border: 'none', borderRadius: 12, padding: '12px', fontSize: 14,
                  fontWeight: 700, cursor: formValido ? 'pointer' : 'not-allowed',
                }}
              >
                Analizar mi empresa →
              </button>
            </div>

            {!formValido && (
              <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>
                Completa todos los campos para continuar
              </div>
            )}
          </div>
        )}

        {/* ── ANALIZANDO ────────────────────────────────────────────────── */}
        {step === 'analizando' && (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0',
            padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Analizando tu empresa...</div>
            <div style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
              Calculando tus 5 ratios financieros clave
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 300, marginTop: 8 }}>
              {['Ratio de liquidez', 'Endeudamiento', 'Margen de utilidad', 'Capital de trabajo', 'Días de cobro'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ height: 4, flex: 1, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{
                      height: 4, borderRadius: 99, background: NAVY,
                      width: '0%', animation: `fill${i} 2s ${i * 0.3}s forwards ease-out`,
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>{item}</span>
                </div>
              ))}
            </div>
            <style>{`
              @keyframes fill0{to{width:100%}}
              @keyframes fill1{to{width:100%}}
              @keyframes fill2{to{width:100%}}
              @keyframes fill3{to{width:100%}}
              @keyframes fill4{to{width:100%}}
            `}</style>
          </div>
        )}

        {/* ── RESULTADO ─────────────────────────────────────────────────── */}
        {step === 'resultado' && resultado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Score principal */}
            <div style={{
              background: '#fff', borderRadius: 16, border: `2px solid ${scoreColor(resultado.scoreGlobal)}30`,
              padding: 24, display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <GaugeMini score={resultado.scoreGlobal} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                  IIE Financiero — {new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(resultado.scoreGlobal) }}>
                  {scoreEmoji(resultado.scoreGlobal)} {scoreLabel(resultado.scoreGlobal)}
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  {resultado.scoreGlobal >= 80
                    ? 'Tu empresa tiene una salud financiera sólida. Mantén el ritmo.'
                    : resultado.scoreGlobal >= 60
                    ? 'Hay áreas de riesgo que necesitan atención en los próximos 30 días.'
                    : 'Situación crítica. Actúa esta semana en los puntos marcados en rojo.'}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: scoreBg(resultado.scoreGlobal), color: scoreColor(resultado.scoreGlobal), border: `1px solid ${scoreColor(resultado.scoreGlobal)}30` }}>
                    {resultado.scoreGlobal} / 100 puntos
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                    5 ratios analizados
                  </span>
                </div>
              </div>
            </div>

            {/* Ratios individuales */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Detalle por indicador</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resultado.ratios.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setExpandido(expandido === i ? null : i)}
                    style={{
                      border: `1px solid ${expandido === i ? scoreColor(r.score) + '40' : '#E2E8F0'}`,
                      borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                      background: expandido === i ? scoreBg(r.score) : '#F8FAFC',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        background: scoreColor(r.score),
                      }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', flex: 1 }}>{r.nombre}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 800, color: scoreColor(r.score),
                        minWidth: 60, textAlign: 'right',
                      }}>
                        {r.nombre.includes('días') ? `${Math.round(r.valor)} días` :
                          r.nombre.includes('Endeudamiento') || r.nombre.includes('Margen') ? `${r.valor.toFixed(1)}%` :
                          r.nombre.includes('Capital') ? `S/. ${r.valor.toLocaleString('es-PE')}` :
                          r.valor.toFixed(2)}
                      </span>
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>{expandido === i ? '▲' : '▼'}</span>
                    </div>
                    {expandido === i && (
                      <div style={{ padding: '0 14px 12px', borderTop: '1px solid #E2E8F030' }}>
                        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>{r.descripcion}</div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{r.interpretacion}</div>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>Ideal: {r.ideal}</div>
                        <div style={{ height: 4, borderRadius: 99, background: '#E2E8F0', marginTop: 8 }}>
                          <div style={{ height: 4, borderRadius: 99, background: scoreColor(r.score), width: `${r.score}%` }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>Score: {r.score}/100</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendaciones */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 14 }}>
                🤖 Recomendaciones para los próximos 30 días
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {resultado.recomendaciones.map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', background: '#EFF6FF',
                      color: NAVY, fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso legal */}
            <div style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', lineHeight: 1.5, padding: '0 20px' }}>
              Este diagnóstico es orientativo y no reemplaza la asesoría de un contador público colegiado.
              MCF — Médico Contable Financiero · {new Date().getFullYear()}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={reiniciar}
                style={{
                  flex: 1, background: '#fff', color: '#374151', border: '1px solid #E2E8F0',
                  borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                ↺ Nuevo diagnóstico
              </button>
              <button
                onClick={() => { /* aquí va tu lógica de guardar/PDF */ alert('Función de guardado próximamente'); }}
                style={{
                  flex: 2, background: NAVY, color: '#fff', border: 'none',
                  borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                💾 Guardar resultados
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
