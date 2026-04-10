'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoMCF from '@/components/auth/LogoMCF';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import SunatIcon from '@/components/auth/SunatIcon';

/* ---- Tipos ---- */
interface SunatData {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  regimenTributario: string;
  estadoContribuyente: string;
  condicionContribuyente: string;
  direccionFiscal: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  tipoContribuyente: string;
  fechaInscripcion: string;
  actividadEconomica: string;
}

interface FormErrors {
  ruc?: string;
  claveSol?: string;
}

/* ---- Mock de datos SUNAT ---- */
const MOCK_SUNAT_DB: Record<string, SunatData> = {
  '20601234567': {
    ruc: '20601234567',
    razonSocial: 'EMPRESA DEMO PERU S.A.C.',
    nombreComercial: 'DEMO PERU',
    regimenTributario: 'Régimen General',
    estadoContribuyente: 'ACTIVO',
    condicionContribuyente: 'HABIDO',
    direccionFiscal: 'AV. JAVIER PRADO ESTE NRO. 4200 URB. CAMACHO',
    ubigeo: '150113',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LA MOLINA',
    tipoContribuyente: 'SOCIEDAD ANONIMA CERRADA',
    fechaInscripcion: '2018-03-15',
    actividadEconomica: 'Actividades de Consultoría de Gestión',
  },
  '10412345678': {
    ruc: '10412345678',
    razonSocial: 'GARCIA LOPEZ CARLOS ANTONIO',
    nombreComercial: 'CARLOS GARCIA NEGOCIOS',
    regimenTributario: 'Régimen MYPE Tributario',
    estadoContribuyente: 'ACTIVO',
    condicionContribuyente: 'HABIDO',
    direccionFiscal: 'JR. UNION NRO. 500 DPTO. 301',
    ubigeo: '150101',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'LIMA',
    tipoContribuyente: 'PERSONA NATURAL CON NEGOCIO',
    fechaInscripcion: '2020-07-10',
    actividadEconomica: 'Venta al por Menor en Comercios',
  },
  '20512345678': {
    ruc: '20512345678',
    razonSocial: 'DISTRIBUIDORA LOS ANDES E.I.R.L.',
    nombreComercial: 'LOS ANDES DISTRIBUCIONES',
    regimenTributario: 'Régimen Especial de Renta',
    estadoContribuyente: 'ACTIVO',
    condicionContribuyente: 'HABIDO',
    direccionFiscal: 'AV. ARGENTINA NRO. 1256 INT. B CALLAO',
    ubigeo: '070101',
    departamento: 'CALLAO',
    provincia: 'CALLAO',
    distrito: 'CALLAO',
    tipoContribuyente: 'EMPRESA INDIVIDUAL RESP. LTDA',
    fechaInscripcion: '2016-11-22',
    actividadEconomica: 'Comercio al por Mayor de Alimentos',
  },
};

/* ---- Pasos del flujo ---- */
type Step = 'form' | 'loading' | 'confirm' | 'error';

const REGIMEN_COLORS: Record<string, { backgroundColor: string; color: string }> = {
  'Régimen General': { backgroundColor: '#DBEAFE', color: '#1E40AF' },
  'Régimen MYPE Tributario': { backgroundColor: '#D1FAE5', color: '#065F46' },
  'Régimen Especial de Renta': { backgroundColor: '#FEF3C7', color: '#92400E' },
  'Nuevo RUS': { backgroundColor: '#FCE7F3', color: '#9D174D' },
};

export default function ClaveSolPage() {
  const [step, setStep] = useState<Step>('form');
  const [ruc, setRuc] = useState('');
  const [claveSol, setClaveSol] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [sunatData, setSunatData] = useState<SunatData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirming, setConfirming] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const rucLimpio = ruc.replace(/\D/g, '');
    if (!rucLimpio) {
      newErrors.ruc = 'El RUC es obligatorio';
    } else if (rucLimpio.length !== 11) {
      newErrors.ruc = 'El RUC debe tener 11 dígitos';
    } else if (!['10', '15', '17', '20'].some((p) => rucLimpio.startsWith(p))) {
      newErrors.ruc = 'RUC inválido. Debe comenzar con 10, 15, 17 o 20';
    }
    if (!claveSol) {
      newErrors.claveSol = 'La Clave SOL es obligatoria';
    } else if (claveSol.length < 4) {
      newErrors.claveSol = 'Clave SOL inválida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep('loading');
    // Simular llamada a API SUNAT (~2 segundos)
    await new Promise((r) => setTimeout(r, 2000));

    const rucLimpio = ruc.replace(/\D/g, '');
    const data = MOCK_SUNAT_DB[rucLimpio];

    if (data) {
      setSunatData(data);
      setStep('confirm');
    } else {
      setErrorMsg(
        'No encontramos una empresa registrada con ese RUC o la Clave SOL es incorrecta. Verifica tus datos e intenta nuevamente.'
      );
      setStep('error');
    }
  };

  const handleConfirmar = async () => {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 1500));
    setConfirming(false);
    alert(`¡Bienvenido a MCF, ${sunatData?.razonSocial}! (Demo)`);
  };

  const handleVolver = () => {
    setStep('form');
    setErrorMsg('');
    setSunatData(null);
  };

  /* ---- Renders por paso ---- */
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #F4F6F9 0%, #E8EEF8 100%)' }}
    >
      <div
        className="fixed top-0 left-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#1B3A6B', transform: 'translate(-30%, -30%)' }}
      />

      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <LogoMCF size="md" showSlogan={false} />
        </div>

        {/* PASO 1: Formulario */}
        {step === 'form' && (
          <AuthCard>
            <div className="flex flex-col gap-5">
              {/* Header con badge SUNAT */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow"
                  style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
                >
                  <SunatIcon size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#1B3A6B' }}>
                    Acceso con Clave SOL
                  </h2>
                  <p className="text-xs text-gray-500">
                    Conectamos directamente con SUNAT
                  </p>
                </div>
              </div>

              {/* Info de ayuda */}
              <div
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
              >
                <InfoIcon />
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#1E40AF' }}>
                    ¿Qué es la Clave SOL?
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    Es tu usuario y contraseña del portal de SUNAT (sol.sunat.gob.pe).
                    La usamos solo para verificar tu empresa. No guardamos tus credenciales.
                  </p>
                </div>
              </div>

              <form onSubmit={handleConsultar} className="flex flex-col gap-4">
                <div>
                  <InputField
                    label="RUC de tu empresa"
                    type="text"
                    placeholder="Ej: 20601234567"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    error={errors.ruc}
                    icon={<RucIcon />}
                    maxLength={11}
                    inputMode="numeric"
                  />
                  <p className="text-xs text-gray-400 mt-1 ml-1">
                    Prueba con: 20601234567 · 10412345678 · 20512345678
                  </p>
                </div>

                <InputField
                  label="Clave SOL"
                  type="password"
                  placeholder="Tu clave de SUNAT"
                  value={claveSol}
                  onChange={(e) => setClaveSol(e.target.value)}
                  error={errors.claveSol}
                  icon={<KeyIcon />}
                />

                {/* Seguridad */}
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
                >
                  <ShieldIcon />
                  <p className="text-xs" style={{ color: '#15803D' }}>
                    Conexión segura SSL. No almacenamos tu Clave SOL.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-4 rounded-2xl font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md flex items-center justify-center gap-3 mt-1"
                  style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
                >
                  <SunatIcon size={20} />
                  Consultar en SUNAT
                </button>
              </form>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-center text-gray-500">
                  <Link
                    href="/registro"
                    className="font-semibold hover:underline"
                    style={{ color: '#4A90D9' }}
                  >
                    ← Volver al registro
                  </Link>
                </p>
              </div>
            </div>
          </AuthCard>
        )}

        {/* PASO 2: Cargando / Consultando SUNAT */}
        {step === 'loading' && (
          <AuthCard>
            <div className="flex flex-col items-center gap-6 py-8">
              {/* Animación de carga */}
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }}
                >
                  <SunatIcon size={44} />
                </div>
                {/* Anillos animados */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"
                  style={{ borderColor: '#4A90D9' }}
                />
                <div
                  className="absolute inset-0 rounded-full border-2 animate-spin"
                  style={{ borderColor: '#1B3A6B', borderTopColor: 'transparent' }}
                />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold" style={{ color: '#1B3A6B' }}>
                  Consultando SUNAT...
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Verificando tu empresa en el Registro de Contribuyentes
                </p>
              </div>

              {/* Pasos visuales */}
              <div className="w-full flex flex-col gap-2">
                {[
                  'Verificando RUC...',
                  'Validando Clave SOL...',
                  'Obteniendo datos de tu empresa...',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#DBEAFE' }}
                    >
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: '#4A90D9', animationDelay: `${i * 0.3}s` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </AuthCard>
        )}

        {/* PASO 3: Confirmar datos de SUNAT */}
        {step === 'confirm' && sunatData && (
          <AuthCard className="max-w-lg">
            <div className="flex flex-col gap-5">
              {/* Header de éxito */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#D1FAE5' }}
                >
                  <CheckIcon />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#065F46' }}>
                    ¡Empresa encontrada!
                  </h2>
                  <p className="text-xs text-gray-500">
                    Verifica que los datos sean correctos
                  </p>
                </div>
              </div>

              {/* Tarjeta de empresa */}
              <div
                className="rounded-2xl overflow-hidden border-2"
                style={{ borderColor: '#E0E5EF' }}
              >
                {/* Header empresa */}
                <div
                  className="px-5 py-4"
                  style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-bold text-base leading-tight">
                        {sunatData.razonSocial}
                      </h3>
                      {sunatData.nombreComercial !== sunatData.razonSocial && (
                        <p className="text-blue-200 text-xs mt-0.5">
                          {sunatData.nombreComercial}
                        </p>
                      )}
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2"
                      style={{ background: '#22C55E', color: 'white' }}
                    >
                      {sunatData.estadoContribuyente}
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm font-mono mt-2">
                    RUC: {sunatData.ruc}
                  </p>
                </div>

                {/* Datos */}
                <div className="p-5 flex flex-col gap-3">
                  {/* Régimen tributario badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Régimen:</span>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={
                        REGIMEN_COLORS[sunatData.regimenTributario] ?? {
                          backgroundColor: '#F3F4F6',
                          color: '#374151',
                        }
                      }
                    >
                      {sunatData.regimenTributario}
                    </span>
                  </div>

                  <DataRow
                    icon={<BuildingIcon />}
                    label="Tipo de empresa"
                    value={sunatData.tipoContribuyente}
                  />
                  <DataRow
                    icon={<LocationIcon />}
                    label="Dirección fiscal"
                    value={`${sunatData.direccionFiscal}, ${sunatData.distrito} - ${sunatData.provincia}, ${sunatData.departamento}`}
                  />
                  <DataRow
                    icon={<ActivityIcon />}
                    label="Actividad económica"
                    value={sunatData.actividadEconomica}
                  />
                  <DataRow
                    icon={<CalendarIcon />}
                    label="Fecha de inscripción"
                    value={new Date(sunatData.fechaInscripcion).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  />
                  <DataRow
                    icon={<CheckCircleIcon />}
                    label="Condición"
                    value={sunatData.condicionContribuyente}
                  />
                </div>
              </div>

              {/* Pregunta de confirmación */}
              <div
                className="rounded-2xl p-4"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
              >
                <p className="text-sm font-semibold text-amber-800">
                  ¿Estos son los datos de tu empresa?
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Al confirmar, crearemos tu cuenta MCF con esta información.
                </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmar}
                  disabled={confirming}
                  className="w-full py-4 px-4 rounded-2xl font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}
                >
                  {confirming ? (
                    <>
                      <LoadingSpinner color="white" />
                      <span>Creando tu cuenta...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon color="white" />
                      <span>Confirmar y entrar a MCF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleVolver}
                  className="w-full py-3 px-4 rounded-2xl font-semibold transition-all duration-200 hover:bg-gray-100 active:scale-95 border-2"
                  style={{ color: '#1B3A6B', borderColor: '#E0E5EF' }}
                >
                  No es mi empresa, reintentar
                </button>
              </div>
            </div>
          </AuthCard>
        )}

        {/* PASO 4: Error */}
        {step === 'error' && (
          <AuthCard>
            <div className="flex flex-col items-center gap-5 py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#FEE2E2' }}
              >
                <ErrorIcon />
              </div>

              <div className="text-center">
                <h3 className="text-lg font-bold" style={{ color: '#1B3A6B' }}>
                  No pudimos verificar tu empresa
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {errorMsg}
                </p>
              </div>

              <div
                className="w-full rounded-2xl p-4"
                style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}
              >
                <p className="text-xs font-semibold text-amber-800 mb-2">
                  Posibles causas:
                </p>
                <ul className="text-xs text-amber-700 flex flex-col gap-1">
                  <li>• El RUC ingresado no existe o está dado de baja</li>
                  <li>• La Clave SOL es incorrecta</li>
                  <li>• El contribuyente está en estado NO HABIDO</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleVolver}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md"
                  style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
                >
                  Intentar nuevamente
                </button>
                <Link
                  href="/registro"
                  className="w-full py-3 px-4 rounded-2xl font-semibold text-center transition-all duration-200 hover:bg-gray-100 border-2"
                  style={{ color: '#1B3A6B', borderColor: '#E0E5EF' }}
                >
                  Registrarme con correo
                </Link>
              </div>
            </div>
          </AuthCard>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Datos obtenidos del Registro de Contribuyentes de SUNAT
        </p>
      </div>
    </main>
  );
}

/* ---- Componentes de apoyo ---- */
function DataRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold" style={{ color: '#1B3A6B' }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ---- Íconos ---- */
function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="#3B82F6">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="#22C55E">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function RucIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function CheckIcon({ color = '#22C55E' }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={color}>
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="#E63946" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LoadingSpinner({ color = '#1B3A6B' }: { color?: string }) {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
      <path className="opacity-75" fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
