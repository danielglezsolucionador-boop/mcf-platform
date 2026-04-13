'use client';

import { useState, useEffect, useRef } from 'react';

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type Plan = 'estudiante' | 'empresario' | 'pro';

// ─── DATOS MOCK (reemplaza con tu API real) ───────────────────────────────────
const MOCK_USER = {
  nombre: 'Carlos García',
  empresa: 'Empresa Demo Peru S.A.C.',
  sector: 'Comercio · MYPE',
  ruc: '20123456789',
  avatar: 'CG',
};

const DIAGNOSTICOS = [
  {
    id: 1,
    nombre: 'Salud Financiera',
    score: 68,
    scorePrev: 65,
    icon: '💰',
    color: '#D97706',
    bg: '#FFFBEB',
    detalle: 'Ratio corriente: 0.8 · Liquidez en observación',
    acciones: ['Revisar cuentas por cobrar', 'Negociar plazo con proveedores'],
  },
  {
    id: 2,
    nombre: 'Gestión Tributaria',
    score: 78,
    scorePrev: 80,
    icon: '📋',
    color: '#D97706',
    bg: '#FFFBEB',
    detalle: 'PDT 621 pendiente · Declaraciones al día',
    acciones: ['Presentar PDT 621 antes del 15', 'Revisar detracciones pendientes'],
  },
  {
    id: 3,
    nombre: 'Flujo de Caja',
    score: 71,
    scorePrev: 68,
    icon: '📈',
    color: '#D97706',
    bg: '#FFFBEB',
    detalle: 'Flujo positivo · Cobranzas lentas (42 días)',
    acciones: ['Cobrar factura #0234 vencida', 'Revisar proyección del mes'],
  },
];

const IIE_GENERAL = Math.round(
  DIAGNOSTICOS.reduce((s, d) => s + d.score, 0) / DIAGNOSTICOS.length
);

const ALERTAS = [
  { nivel: 'urgente', color: '#EF4444', bg: '#FEF2F2', texto: 'Declaración IGV vence en 5 días', fecha: 'Hoy', icono: '🚨' },
  { nivel: 'atencion', color: '#F59E0B', bg: '#FFFBEB', texto: 'Ratio de liquidez por debajo de 1.0', fecha: 'Ayer', icono: '⚠️' },
  { nivel: 'info', color: '#3B82F6', bg: '#EFF6FF', texto: 'Planilla de octubre lista para revisar', fecha: 'Lunes', icono: 'ℹ️' },
  { nivel: 'info', color: '#8B5CF6', bg: '#F5F3FF', texto: 'Nuevo video: Cómo reducir tu IGV legalmente', fecha: 'Martes', icono: '🎓' },
];

const RECOMENDACIONES_BASE = [
  'Refinanciar deuda de largo plazo — ahorro estimado del 12%',
  'Aplicar régimen MYPE tributario en próximo ejercicio',
];

const RECOMENDACIONES_PRO = [
  'Refinanciar deuda de largo plazo — ahorro estimado del 12%',
  'Aplicar régimen MYPE tributario en próximo ejercicio',
  'Crear fondo de reserva: 15% de utilidad mensual',
  'Revisar contratos de arrendamiento operativo',
  'Automatizar cobranzas para reducir días de venta a 30d',
];

const PLANES_CONFIG: Record<Plan, { label: string; precio: string; color: string; bg: string; border: string; badge: string }> = {
  estudiante: { label: 'Estudiante', precio: 'Gratis', color: '#4B5563', bg: '#F9FAFB', border: '#E5E7EB', badge: '🎓' },
  empresario: { label: 'Empresario', precio: 'S/. 50/mes', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', badge: '💼' },
  pro: { label: 'Pro', precio: 'S/. 99/mes', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', badge: '⭐' },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

function scoreEmoji(s: number) {
  if (s >= 80) return '🟢';
  if (s >= 60) return '🟡';
  return '🔴';
}

function hoy() {
  return new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ─── GAUGE SVG ────────────────────────────────────────────────────────────────
function GaugeCircle({ score, size = 160 }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const r = 58;
  const circ = 2 * Math.PI * r;
  const fill = (displayed / 100) * circ;
  const color = scoreColor(displayed);

  useEffect(() => {
    setDisplayed(0);
    let v = 0;
    const t = setInterval(() => {
      v += 1.5;
      if (v >= score) { setDisplayed(score); clearInterval(t); }
      else setDisplayed(Math.round(v));
    }, 12);
    return () => clearInterval(t);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={70} cy={70} r={r} fill="none" stroke="#E8EFF7" strokeWidth={12} />
        <circle
          cx={70} cy={70} r={r} fill="none"
          stroke={color} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={`${fill} ${circ - fill}`}
          style={{ transition: 'stroke-dasharray 0.05s linear' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{displayed}</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>de 100</div>
        <div style={{ fontSize: 10, fontWeight: 700, color, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {scoreLabel(displayed)}
        </div>
      </div>
    </div>
  );
}

// ─── MINI BARRA DE PROGRESO ───────────────────────────────────────────────────
function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ height: 5, borderRadius: 99, background: '#E8EFF7', marginTop: 8, overflow: 'hidden' }}>
      <div style={{ height: 5, borderRadius: 99, background: color, width: `${value}%`, transition: 'width 1s ease' }} />
    </div>
  );
}

// ─── RACHA DIARIA ─────────────────────────────────────────────────────────────
function RachaWidget({ plan }: { plan: Plan }) {
  const dias = plan === 'estudiante' ? 1 : plan === 'empresario' ? 7 : 23;
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%)',
      borderRadius: 14, padding: '14px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      color: '#fff',
    }}>
      <div>
        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Racha activa</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>🔥 {dias} días</div>
        <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>revisando tu empresa</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>Meta del mes</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: 2,
              background: i < Math.min(dias % 7 || 7, 7) ? '#60A5FA' : 'rgba(255,255,255,0.2)',
            }} />
          ))}
        </div>
        <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>última semana</div>
      </div>
    </div>
  );
}

// ─── ACCIÓN DEL DÍA ───────────────────────────────────────────────────────────
function AccionDia({ plan }: { plan: Plan }) {
  const acciones = {
    estudiante: { texto: 'Ver: "Cómo calcular tu punto de equilibrio"', icono: '▶️', tiempo: '8 min', color: '#4B5563', bg: '#F9FAFB', border: '#E5E7EB' },
    empresario: { texto: 'Presentar PDT 621 — vence en 5 días', icono: '📅', tiempo: 'Urgente', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
    pro: { texto: 'Revisar recomendación IA: refinanciamiento de deuda', icono: '🤖', tiempo: '3 min', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  };
  const a = acciones[plan];
  return (
    <div style={{
      background: a.bg, borderRadius: 12, padding: '12px 16px',
      border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <div style={{ fontSize: 22 }}>{a.icono}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: a.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Acción del día
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginTop: 2 }}>{a.texto}</div>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: a.color,
        background: '#fff', border: `1px solid ${a.border}`,
        borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap',
      }}>
        {a.tiempo}
      </div>
    </div>
  );
}

// ─── BLOQUE IIE ──────────────────────────────────────────────────────────────
function Block1IIE({ plan, onUpgrade }: { plan: Plan; onUpgrade: () => void }) {
  const locked = plan === 'estudiante';
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            IIE — Índice Integral Empresarial
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{hoy()}</div>
        </div>
        <div style={{
          fontSize: 12, fontWeight: 700, color: '#16A34A',
          background: '#F0FDF4', borderRadius: 8, padding: '4px 10px',
          border: '1px solid #BBF7D0',
        }}>
          ↑ +3 pts este mes
        </div>
      </div>

      {locked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
          <div style={{ filter: 'blur(8px)', pointerEvents: 'none', userSelect: 'none' }}>
            <GaugeCircle score={72} />
          </div>
          <div style={{ marginTop: -40, zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>🔒</div>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, margin: '4px 0 10px' }}>
              Activa Plan Empresario para ver tu IIE
            </div>
            <button onClick={onUpgrade} style={{
              background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              Ver planes →
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <GaugeCircle score={IIE_GENERAL} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {DIAGNOSTICOS.map((d) => (
              <div key={d.id} style={{
                textAlign: 'center', background: '#F8FAFC',
                borderRadius: 10, padding: '10px 6px', border: '1px solid #E2E8F0',
              }}>
                <div style={{ fontSize: 16 }}>{d.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(d.score), marginTop: 2 }}>{d.score}</div>
                <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 1 }}>{d.nombre.split(' ')[0]}</div>
                <MiniBar value={d.score} color={scoreColor(d.score)} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── BLOQUE SEMÁFORO ──────────────────────────────────────────────────────────
function Block2Semaforo({ plan, onUpgrade }: { plan: Plan; onUpgrade: () => void }) {
  const locked = plan === 'estudiante';
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>
        Semáforo de salud
      </div>
      {locked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 8 }}>
          <div style={{ fontSize: 22 }}>🔒</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>Disponible en Plan Empresario</div>
          <button onClick={onUpgrade} style={{
            background: '#F8FAFC', color: '#1B3A6B', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4,
          }}>
            Activar →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DIAGNOSTICOS.map((d) => (
            <div key={d.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              background: '#F8FAFC', border: '1px solid #E2E8F0',
            }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                background: scoreColor(d.score),
                boxShadow: `0 0 0 3px ${scoreColor(d.score)}30`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{d.nombre}</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>{d.detalle}</div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: scoreColor(d.score),
                background: '#fff', border: `1px solid ${scoreColor(d.score)}30`,
                borderRadius: 6, padding: '2px 8px',
              }}>
                {scoreLabel(d.score)}
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 4, padding: '8px 12px', borderRadius: 10,
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            fontSize: 11, color: '#166534', fontWeight: 500, textAlign: 'center',
          }}>
            {scoreEmoji(IIE_GENERAL)} Tu empresa está mejorando. ¡Sigue así!
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TARJETAS DE DIAGNÓSTICO ──────────────────────────────────────────────────
function Block3Diagnosticos({ plan, onUpgrade }: { plan: Plan; onUpgrade: () => void }) {
  const locked = plan === 'estudiante';
  const [activo, setActivo] = useState<number | null>(null);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
      {DIAGNOSTICOS.map((d) => {
        const trend = d.score - d.scorePrev;
        const isOpen = activo === d.id;
        if (locked) return (
          <div key={d.id} style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0',
            padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 6, opacity: 0.7, minHeight: 140,
          }}>
            <div style={{ fontSize: 22 }}>🔒</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', textAlign: 'center' }}>{d.nombre}</div>
            <div style={{ fontSize: 10, color: '#64748B' }}>Plan Empresario</div>
            <button onClick={onUpgrade} style={{
              background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE',
              borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}>Desbloquear</button>
          </div>
        );
        return (
          <div
            key={d.id}
            onClick={() => setActivo(isOpen ? null : d.id)}
            style={{
              background: '#fff', borderRadius: 14,
              border: isOpen ? `2px solid ${scoreColor(d.score)}` : '1px solid #E2E8F0',
              padding: 16, cursor: 'pointer', transition: 'border-color .2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{d.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                background: trend >= 0 ? '#DCFCE7' : '#FEE2E2',
                color: trend >= 0 ? '#166534' : '#991B1B',
              }}>
                {trend >= 0 ? `↑ +${trend}` : `↓ ${trend}`} pts
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>{d.nombre}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: scoreColor(d.score) }}>
              {d.score}<span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 400 }}>/100</span>
            </div>
            <MiniBar value={d.score} color={scoreColor(d.score)} />
            {isOpen && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6 }}>{d.detalle}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Acciones:</div>
                {d.acciones.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginBottom: 3 }}>
                    <span style={{ color: '#16A34A', fontSize: 10, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 10, color: '#374151' }}>{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── BLOQUE ALERTAS ───────────────────────────────────────────────────────────
function Block4Alertas({ plan, onUpgrade }: { plan: Plan; onUpgrade: () => void }) {
  const locked = plan === 'estudiante';
  const alertas = locked ? ALERTAS.slice(3) : ALERTAS;
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Alertas activas
        </div>
        {!locked && (
          <span style={{
            fontSize: 10, fontWeight: 700, background: '#FEF2F2', color: '#DC2626',
            borderRadius: 99, padding: '2px 8px', border: '1px solid #FECACA',
          }}>
            3 pendientes
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alertas.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: a.bg, borderRadius: 10, border: `1px solid ${a.color}20`,
          }}>
            <span style={{ fontSize: 16 }}>{a.icono}</span>
            <span style={{ fontSize: 12, color: '#374151', flex: 1, fontWeight: 500 }}>{a.texto}</span>
            <span style={{ fontSize: 10, color: '#94A3B8', whiteSpace: 'nowrap' }}>{a.fecha}</span>
          </div>
        ))}
        {locked && (
          <button onClick={onUpgrade} style={{
            background: '#F9FAFB', color: '#1B3A6B', border: '1px dashed #CBD5E1',
            borderRadius: 10, padding: '10px', fontSize: 11, fontWeight: 600,
            cursor: 'pointer', marginTop: 2,
          }}>
            🔒 Ver 3 alertas más — Actualiza tu plan
          </button>
        )}
      </div>
    </div>
  );
}

// ─── BLOQUE RECOMENDACIONES ───────────────────────────────────────────────────
function Block5Recomendaciones({ plan, onUpgrade }: { plan: Plan; onUpgrade: () => void }) {
  const locked = plan === 'estudiante';
  const recs = plan === 'pro' ? RECOMENDACIONES_PRO : RECOMENDACIONES_BASE;
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Recomendaciones IA
        </div>
        {plan === 'pro' && (
          <span style={{
            fontSize: 10, fontWeight: 700, background: '#F5F3FF', color: '#7C3AED',
            borderRadius: 99, padding: '2px 8px', border: '1px solid #DDD6FE',
          }}>
            ⭐ Pro · 5 activas
          </span>
        )}
      </div>
      {locked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0' }}>
          <div style={{ fontSize: 24 }}>🤖</div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, textAlign: 'center' }}>
            La IA analizará tu empresa y generará recomendaciones personalizadas
          </div>
          <button onClick={onUpgrade} style={{
            background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 18px', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4,
          }}>
            Activar recomendaciones IA →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recs.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
              background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: '#EFF6FF',
                color: '#1E40AF', fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: 12, color: '#374151' }}>{r}</span>
            </div>
          ))}
          {plan === 'empresario' && (
            <button onClick={onUpgrade} style={{
              background: '#F5F3FF', color: '#7C3AED', border: '1px dashed #DDD6FE',
              borderRadius: 10, padding: '10px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              ⭐ Ver 3 recomendaciones más — Plan Pro
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MODAL DE PLANES ──────────────────────────────────────────────────────────
function UpgradeModal({
  currentPlan, onClose, onSelect,
}: {
  currentPlan: Plan; onClose: () => void; onSelect: (p: Plan) => void;
}) {
  const planes: { plan: Plan; features: string[] }[] = [
    {
      plan: 'estudiante',
      features: ['Videos educativos financieros', 'Ejercicios prácticos', 'Comunidad FCT', '1 alerta educativa/día'],
    },
    {
      plan: 'empresario',
      features: [
        'Todo lo del Plan Estudiante', 'IIE + 3 diagnósticos completos', 'Semáforo de salud financiera',
        '3 alertas tributarias', '2 recomendaciones IA', 'Simulador de inversión', 'Racha de revisión diaria',
      ],
    },
    {
      plan: 'pro',
      features: [
        'Todo lo del Plan Empresario', '5 recomendaciones IA personalizadas', 'Todos los simuladores',
        'Reportes PDF mensuales', 'Asesor contable asignado', 'Soporte prioritario 24h', 'Análisis vs sector',
      ],
    },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1B3A6B' }}>Elige tu plan FCT</h2>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Sin permanencia. Cancela cuando quieras.</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: 14, color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {planes.map(({ plan, features }) => {
            const cfg = PLANES_CONFIG[plan];
            const isCurrent = plan === currentPlan;
            return (
              <div key={plan} style={{ borderRadius: 16, border: `2px solid ${isCurrent ? '#1B3A6B' : '#E2E8F0'}`, background: cfg.bg, overflow: 'hidden' }}>
                <div style={{ padding: '16px 16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#1B3A6B' }}>{cfg.badge} {cfg.label}</span>
                    {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, background: '#DCFCE7', color: '#166534', borderRadius: 99, padding: '2px 6px' }}>Activo</span>}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{cfg.precio}</div>
                  <ul style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: '#374151' }}>
                        <span style={{ color: '#16A34A', flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ padding: '0 16px 16px' }}>
                  <button
                    onClick={() => { onSelect(plan); onClose(); }}
                    style={{
                      width: '100%', padding: '9px 0', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', border: 'none',
                      background: isCurrent ? '#E2E8F0' : '#1B3A6B',
                      color: isCurrent ? '#64748B' : '#fff',
                    }}
                  >
                    {isCurrent ? 'Plan actual' : `Activar ${cfg.label}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' },
  { id: 'diagnostico', label: 'Diagnóstico', icon: '📊' },
  { id: 'simulador', label: 'Simulador', icon: '🧮' },
  { id: 'educacion', label: 'Educación', icon: '🎓' },
  { id: 'reportes', label: 'Reportes', icon: '📄' },
  { id: 'soporte', label: 'Soporte', icon: '💬' },
];

function Sidebar({ plan, activeItem }: { plan: Plan; activeItem: string }) {
  const cfg = PLANES_CONFIG[plan];
  return (
    <div style={{
      width: 220, flexShrink: 0, background: '#1B3A6B',
      display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: '#60A5FA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#1B3A6B',
          }}>
            FCT
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: -0.3, lineHeight: 1.2 }}>
              Financiero
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Contable · Tributario
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeItem;
          return (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', fontSize: 13, fontWeight: 500,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderLeft: `3px solid ${isActive ? '#60A5FA' : 'transparent'}`,
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', background: '#60A5FA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#1B3A6B', flexShrink: 0,
          }}>
            {MOCK_USER.avatar}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {MOCK_USER.nombre}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {MOCK_USER.empresa}
            </div>
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: cfg.bg, color: cfg.color,
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
        }}>
          {cfg.badge} {cfg.label}
        </div>
      </div>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [plan, setPlan] = useState<Plan>('empresario');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const cfg = PLANES_CONFIG[plan];
  const firstName = MOCK_USER.nombre.split(' ')[0];

  const bannerMsgs: Record<Plan, { text: string }> = {
    estudiante: { text: `¡Hola, ${firstName}! Hoy hay 1 video nuevo sobre gestión tributaria para ti.` },
    empresario: { text: `¡Hola, ${firstName}! Tu IIE bajó 2 pts. Presentar el PDT vence en 5 días.` },
    pro: { text: `¡Hola, ${firstName}! La IA detectó 1 oportunidad de ahorro de S/. 3,200 este mes.` },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', display: 'flex' }}>
      {/* Sidebar — solo desktop */}
      <div className="hidden lg:block">
        <Sidebar plan={plan} activeItem="inicio" />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{
          background: '#fff', padding: '12px 20px',
          borderBottom: '1px solid #E2E8F0', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1B3A6B' }}>Panel principal</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{MOCK_USER.empresa} · RUC {MOCK_USER.ruc}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>Plan:</span>
            <div style={{ display: 'flex', gap: 4, background: '#F4F6F9', borderRadius: 8, padding: 3 }}>
              {(['estudiante', 'empresario', 'pro'] as Plan[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  style={{
                    padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: 'none',
                    background: p === plan ? (p === 'pro' ? '#7C3AED' : p === 'empresario' ? '#1B3A6B' : '#fff') : 'transparent',
                    color: p === plan ? (p === 'estudiante' ? '#374151' : '#fff') : '#64748B',
                    boxShadow: p === plan ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {PLANES_CONFIG[p].badge} {PLANES_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <main style={{ flex: 1, padding: '16px 20px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Banner */}
          <div style={{
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{cfg.badge}</span>
            <p style={{ fontSize: 13, fontWeight: 500, color: cfg.color }}>{bannerMsgs[plan].text}</p>
          </div>

          {/* Racha + Acción del día */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <RachaWidget plan={plan} />
            <AccionDia plan={plan} />
          </div>

          {/* IIE + Semáforo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Block1IIE plan={plan} onUpgrade={() => setShowUpgradeModal(true)} />
            <Block2Semaforo plan={plan} onUpgrade={() => setShowUpgradeModal(true)} />
          </div>

          {/* 3 Diagnósticos */}
          <Block3Diagnosticos plan={plan} onUpgrade={() => setShowUpgradeModal(true)} />

          {/* Alertas + Recomendaciones */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Block4Alertas plan={plan} onUpgrade={() => setShowUpgradeModal(true)} />
            <Block5Recomendaciones plan={plan} onUpgrade={() => setShowUpgradeModal(true)} />
          </div>

        </main>
      </div>

      {/* Modal upgrade */}
      {showUpgradeModal && (
        <UpgradeModal
          currentPlan={plan}
          onClose={() => setShowUpgradeModal(false)}
          onSelect={setPlan}
        />
      )}
    </div>
  );
}
