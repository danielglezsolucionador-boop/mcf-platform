'use client';

import { EquipoData } from './types';

interface Step2Props {
  data: EquipoData;
  onChange: (data: EquipoData) => void;
}

interface PersonaCategory {
  key: keyof EquipoData;
  label: string;
  sublabel: string;
  hint: string;
  icon: React.ReactNode;
  color: string;
  colorLight: string;
}

const CATEGORIAS: PersonaCategory[] = [
  {
    key: 'planilla',
    label: 'Empleados en planilla',
    sublabel: 'Contrato formal',
    hint: 'Personas con contrato de trabajo: CTS, seguro, vacaciones',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: '#1B3A6B',
    colorLight: '#EFF6FF',
  },
  {
    key: 'honorarios',
    label: 'Recibo por honorarios',
    sublabel: 'Cuarta categoría',
    hint: 'Profesionales independientes que emiten recibos por honorarios',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: '#7C3AED',
    colorLight: '#F5F3FF',
  },
  {
    key: 'informales',
    label: 'Otros colaboradores',
    sublabel: 'Sin contrato formal',
    hint: 'Familiares, apoyo eventual, trabajadores informales',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: '#D97706',
    colorLight: '#FFFBEB',
  },
];

function toNum(val: string): number {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : Math.max(0, n);
}

export default function Step2Equipo({ data, onChange }: Step2Props) {
  const set = (key: keyof EquipoData, value: string) => {
    // Solo permitir números enteros no negativos
    if (value !== '' && !/^\d+$/.test(value)) return;
    onChange({ ...data, [key]: value });
  };

  const total = toNum(data.planilla) + toNum(data.honorarios) + toNum(data.informales);

  const getTotalLabel = (n: number): string => {
    if (n === 0) return 'Sin colaboradores registrados aún';
    if (n === 1) return '1 persona en tu equipo';
    if (n < 5) return `${n} personas en tu equipo (microempresa)`;
    if (n < 10) return `${n} personas en tu equipo (pequeña empresa)`;
    if (n < 50) return `${n} personas en tu equipo (empresa mediana)`;
    return `${n} personas en tu equipo (empresa grande)`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Mensaje informativo */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="#22C55E">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-xs text-green-800 leading-relaxed">
          <span className="font-semibold">No importa si son formales o informales.</span>{' '}
          Esta información nos ayuda a darte mejores recomendaciones sobre planillas,
          beneficios sociales y cumplimiento laboral.
        </p>
      </div>

      {/* Tarjetas de categorías */}
      {CATEGORIAS.map((cat) => (
        <div
          key={cat.key}
          className="rounded-2xl p-5 border-2 transition-all duration-200"
          style={{
            borderColor: toNum(data[cat.key]) > 0 ? cat.color : '#E0E5EF',
            background: toNum(data[cat.key]) > 0 ? cat.colorLight : 'white',
          }}
        >
          <div className="flex items-start gap-4">
            {/* Ícono */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: cat.colorLight, color: cat.color }}
            >
              {cat.icon}
            </div>

            {/* Info + input */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm" style={{ color: '#1B3A6B' }}>
                    {cat.label}
                  </p>
                  <p className="text-xs font-medium" style={{ color: cat.color }}>
                    {cat.sublabel}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{cat.hint}</p>
                </div>

                {/* Input numérico grande */}
                <div className="flex-shrink-0 text-center">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = toNum(data[cat.key]);
                        if (current > 0) set(cat.key, String(current - 1));
                      }}
                      className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-all active:scale-95"
                      style={{
                        background: '#F3F4F6',
                        color: '#6B7280',
                        border: '2px solid #E5E7EB',
                      }}
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={data[cat.key]}
                      onChange={(e) => set(cat.key, e.target.value)}
                      className="w-16 text-center text-xl font-bold rounded-xl border-2 py-2 px-1 outline-none transition-all"
                      style={{
                        borderColor: toNum(data[cat.key]) > 0 ? cat.color : '#E0E5EF',
                        color: cat.color,
                      }}
                      placeholder="0"
                    />

                    <button
                      type="button"
                      onClick={() => set(cat.key, String(toNum(data[cat.key]) + 1))}
                      className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-all active:scale-95 text-white"
                      style={{ background: cat.color }}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">personas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Total */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between"
        style={{
          background: total > 0
            ? 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)'
            : '#F3F4F6',
        }}
      >
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: total > 0 ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}
          >
            Total del equipo
          </p>
          <p
            className="text-base font-bold mt-0.5"
            style={{ color: total > 0 ? 'white' : '#6B7280' }}
          >
            {getTotalLabel(total)}
          </p>
        </div>
        <div
          className="text-4xl font-black"
          style={{ color: total > 0 ? 'white' : '#D1D5DB' }}
        >
          {total}
        </div>
      </div>

      {/* Desglose visual */}
      {total > 0 && (
        <div className="flex gap-2">
          {CATEGORIAS.map((cat) => {
            const n = toNum(data[cat.key]);
            const pct = total > 0 ? Math.round((n / total) * 100) : 0;
            if (n === 0) return null;
            return (
              <div
                key={cat.key}
                className="flex-1 rounded-xl p-3 text-center"
                style={{ background: cat.colorLight }}
              >
                <p className="text-2xl font-black" style={{ color: cat.color }}>
                  {n}
                </p>
                <p className="text-xs font-medium mt-0.5" style={{ color: cat.color }}>
                  {cat.sublabel}
                </p>
                <p className="text-xs text-gray-400">{pct}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
