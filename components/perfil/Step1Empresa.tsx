'use client';

import { EmpresaData } from './types';

const RUBROS = [
  { value: 'comercio', label: '🛒 Comercio' },
  { value: 'servicios', label: '🤝 Servicios' },
  { value: 'manufactura', label: '🏭 Manufactura' },
  { value: 'construccion', label: '🏗️ Construcción' },
  { value: 'transporte', label: '🚛 Transporte' },
  { value: 'restaurantes', label: '🍽️ Restaurantes' },
  { value: 'tecnologia', label: '💻 Tecnología' },
  { value: 'salud', label: '🏥 Salud' },
  { value: 'educacion', label: '📚 Educación' },
  { value: 'otro', label: '📦 Otro' },
];

const REGIMENES = [
  'Régimen General',
  'Régimen MYPE Tributario',
  'Régimen Especial de Renta',
  'Nuevo RUS',
];

interface Step1Props {
  data: EmpresaData;
  onChange: (data: EmpresaData) => void;
  errors: Partial<Record<keyof EmpresaData, string>>;
}

export default function Step1Empresa({ data, onChange, errors }: Step1Props) {
  const set = (field: keyof EmpresaData, value: string) =>
    onChange({ ...data, [field]: value });

  return (
    <div className="flex flex-col gap-5">
      {/* Banner info SUNAT */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
      >
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="#3B82F6">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="font-semibold">Datos obtenidos de SUNAT.</span> Puedes corregir
          cualquier campo si hay algún error o si deseas actualizarlo.
        </p>
      </div>

      {/* RUC (solo lectura) */}
      <div>
        <label className="text-sm font-semibold block mb-1" style={{ color: '#1B3A6B' }}>
          RUC
        </label>
        <div
          className="w-full rounded-xl border-2 py-3 px-4 text-sm flex items-center gap-2"
          style={{ borderColor: '#E0E5EF', background: '#F8FAFC', color: '#6B7280' }}
        >
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-mono">{data.ruc}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            Verificado SUNAT
          </span>
        </div>
      </div>

      {/* Razón Social */}
      <Field
        label="Razón Social / Nombre de empresa"
        value={data.razonSocial}
        onChange={(v) => set('razonSocial', v)}
        error={errors.razonSocial}
        placeholder="Ej: MI EMPRESA S.A.C."
      />

      {/* Nombre comercial */}
      <Field
        label="Nombre comercial (opcional)"
        value={data.nombreComercial}
        onChange={(v) => set('nombreComercial', v)}
        placeholder="Ej: Mi Empresa"
        hint="El nombre con el que te conocen tus clientes"
      />

      {/* Régimen tributario */}
      <div>
        <label className="text-sm font-semibold block mb-1" style={{ color: '#1B3A6B' }}>
          Régimen tributario
        </label>
        <select
          value={data.regimenTributario}
          onChange={(e) => set('regimenTributario', e.target.value)}
          className="w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all"
          style={{
            borderColor: errors.regimenTributario ? '#E63946' : '#E0E5EF',
            color: '#1B3A6B',
            background: 'white',
          }}
        >
          <option value="">Selecciona tu régimen</option>
          {REGIMENES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {errors.regimenTributario && (
          <p className="text-xs mt-1" style={{ color: '#E63946' }}>
            {errors.regimenTributario}
          </p>
        )}
      </div>

      {/* Rubro */}
      <div>
        <label className="text-sm font-semibold block mb-1" style={{ color: '#1B3A6B' }}>
          Rubro o sector
        </label>
        <p className="text-xs text-gray-400 mb-2">
          ¿A qué se dedica principalmente tu empresa?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {RUBROS.map((rubro) => {
            const isSelected = data.rubro === rubro.value;
            return (
              <button
                key={rubro.value}
                type="button"
                onClick={() => set('rubro', rubro.value)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-all duration-150 border-2 active:scale-95"
                style={{
                  borderColor: isSelected ? '#1B3A6B' : '#E0E5EF',
                  background: isSelected
                    ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                    : 'white',
                  color: isSelected ? '#1B3A6B' : '#6B7280',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {rubro.label}
              </button>
            );
          })}
        </div>
        {errors.rubro && (
          <p className="text-xs mt-1" style={{ color: '#E63946' }}>
            {errors.rubro}
          </p>
        )}
      </div>

      {/* Dirección fiscal */}
      <div>
        <label className="text-sm font-semibold block mb-1" style={{ color: '#1B3A6B' }}>
          Dirección fiscal
        </label>
        <textarea
          value={data.direccionFiscal}
          onChange={(e) => set('direccionFiscal', e.target.value)}
          rows={2}
          className="w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all resize-none"
          style={{
            borderColor: errors.direccionFiscal ? '#E63946' : '#E0E5EF',
            color: '#1B3A6B',
          }}
          placeholder="Dirección registrada ante SUNAT"
        />
        {errors.direccionFiscal && (
          <p className="text-xs mt-1" style={{ color: '#E63946' }}>
            {errors.direccionFiscal}
          </p>
        )}
      </div>

      {/* Ubigeo / Ciudad */}
      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Departamento"
          value={data.departamento}
          onChange={(v) => set('departamento', v)}
          placeholder="Lima"
        />
        <Field
          label="Provincia"
          value={data.provincia}
          onChange={(v) => set('provincia', v)}
          placeholder="Lima"
        />
        <Field
          label="Distrito"
          value={data.distrito}
          onChange={(v) => set('distrito', v)}
          placeholder="Miraflores"
        />
      </div>
    </div>
  );
}

/* ---- Componente auxiliar de campo ---- */
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
}

function Field({ label, value, onChange, placeholder, error, hint }: FieldProps) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1" style={{ color: '#1B3A6B' }}>
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 py-3 px-4 text-sm outline-none transition-all"
        style={{
          borderColor: error ? '#E63946' : '#E0E5EF',
          color: '#1B3A6B',
        }}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: '#E63946' }}>
          {error}
        </p>
      )}
    </div>
  );
}
