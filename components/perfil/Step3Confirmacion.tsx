'use client';

import { WizardData, RUBRO_LABELS } from './types';

interface Step3Props {
  data: WizardData;
  onCorrect: () => void;
}

function toNum(val: string): number {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : Math.max(0, n);
}

const REGIMEN_BADGE: Record<string, { bg: string; color: string }> = {
  'Régimen General': { bg: '#DBEAFE', color: '#1E40AF' },
  'Régimen MYPE Tributario': { bg: '#D1FAE5', color: '#065F46' },
  'Régimen Especial de Renta': { bg: '#FEF3C7', color: '#92400E' },
  'Nuevo RUS': { bg: '#FCE7F3', color: '#9D174D' },
};

export default function Step3Confirmacion({ data, onCorrect }: Step3Props) {
  const { empresa, equipo } = data;
  const totalPersonas =
    toNum(equipo.planilla) + toNum(equipo.honorarios) + toNum(equipo.informales);

  const regimenStyle = REGIMEN_BADGE[empresa.regimenTributario] ?? {
    bg: '#F3F4F6',
    color: '#374151',
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Cabecera de éxito */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#D1FAE5' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="#22C55E">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-base" style={{ color: '#065F46' }}>
            ¡Perfil casi listo!
          </h3>
          <p className="text-xs text-gray-500">Revisa que todo esté correcto</p>
        </div>
      </div>

      {/* ---- Tarjeta empresa ---- */}
      <div
        className="rounded-2xl overflow-hidden border-2"
        style={{ borderColor: '#E0E5EF' }}
      >
        {/* Header azul */}
        <div
          className="px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-white font-bold text-base leading-tight truncate">
                {empresa.razonSocial || '—'}
              </h4>
              {empresa.nombreComercial && empresa.nombreComercial !== empresa.razonSocial && (
                <p className="text-blue-200 text-xs mt-0.5">{empresa.nombreComercial}</p>
              )}
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={regimenStyle}
            >
              {empresa.regimenTributario || 'Sin régimen'}
            </span>
          </div>
          <p className="text-blue-200 text-sm font-mono mt-2">RUC: {empresa.ruc}</p>
        </div>

        {/* Datos */}
        <div className="p-5 flex flex-col gap-4">
          <Row
            icon={<RubroIcon />}
            label="Rubro"
            value={RUBRO_LABELS[empresa.rubro] ?? empresa.rubro ?? '—'}
          />
          <Row
            icon={<LocationIcon />}
            label="Dirección fiscal"
            value={
              empresa.direccionFiscal
                ? `${empresa.direccionFiscal}${empresa.distrito ? `, ${empresa.distrito}` : ''}${empresa.departamento ? ` — ${empresa.departamento}` : ''}`
                : '—'
            }
          />
        </div>
      </div>

      {/* ---- Tarjeta equipo ---- */}
      <div
        className="rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: '#E0E5EF' }}
      >
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ background: '#F8FAFC' }}>
          <div className="flex items-center gap-2">
            <TeamIcon />
            <span className="font-semibold text-sm" style={{ color: '#1B3A6B' }}>
              Equipo humano
            </span>
          </div>
          <span
            className="text-2xl font-black"
            style={{ color: totalPersonas > 0 ? '#1B3A6B' : '#D1D5DB' }}
          >
            {totalPersonas}
          </span>
        </div>

        {/* Desglose */}
        <div className="divide-y divide-gray-100">
          <TeamRow
            label="En planilla"
            value={toNum(equipo.planilla)}
            color="#1B3A6B"
          />
          <TeamRow
            label="Recibo por honorarios"
            value={toNum(equipo.honorarios)}
            color="#7C3AED"
          />
          <TeamRow
            label="Otros colaboradores"
            value={toNum(equipo.informales)}
            color="#D97706"
          />
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '1px solid #FED7AA' }}
      >
        <p className="text-sm font-semibold text-orange-800">
          🎉 ¡Tu perfil está listo!
        </p>
        <p className="text-xs text-orange-700 mt-1 leading-relaxed">
          MCF ya puede darte recomendaciones personalizadas para{' '}
          <span className="font-semibold">{empresa.razonSocial || 'tu empresa'}</span>.
        </p>
      </div>

      {/* Botón corregir */}
      <button
        type="button"
        onClick={onCorrect}
        className="w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-100 active:scale-95 border-2 flex items-center justify-center gap-2"
        style={{ color: '#1B3A6B', borderColor: '#E0E5EF' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Corregir algo
      </button>
    </div>
  );
}

/* ---- Sub-componentes ---- */
function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function TeamRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="px-5 py-3 flex items-center justify-between">
      <p className="text-sm text-gray-600">{label}</p>
      <span
        className="text-sm font-bold px-3 py-1 rounded-full"
        style={{
          background: value > 0 ? `${color}15` : '#F3F4F6',
          color: value > 0 ? color : '#9CA3AF',
        }}
      >
        {value} {value === 1 ? 'persona' : 'personas'}
      </span>
    </div>
  );
}

/* ---- Íconos ---- */
function RubroIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#1B3A6B" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
