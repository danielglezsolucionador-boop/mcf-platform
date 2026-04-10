'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoMCF from '@/components/auth/LogoMCF';
import StepIndicator from '@/components/perfil/StepIndicator';
import Step1Empresa from '@/components/perfil/Step1Empresa';
import Step2Equipo from '@/components/perfil/Step2Equipo';
import Step3Confirmacion from '@/components/perfil/Step3Confirmacion';
import { WizardData, EmpresaData } from '@/components/perfil/types';

/* ---- Mock data de SUNAT (empresa pre-cargada) ---- */
const MOCK_EMPRESA: EmpresaData = {
  ruc: '20601234567',
  razonSocial: 'EMPRESA DEMO PERU S.A.C.',
  nombreComercial: 'Demo Peru',
  regimenTributario: 'Régimen General',
  rubro: '',
  direccionFiscal: 'AV. JAVIER PRADO ESTE NRO. 4200 URB. CAMACHO',
  departamento: 'LIMA',
  provincia: 'LIMA',
  distrito: 'LA MOLINA',
};

const STEP_LABELS = [
  'Paso 1 — Datos de tu empresa',
  'Paso 2 — Tu equipo humano',
  'Paso 3 — Confirmar y finalizar',
];

const TOTAL_STEPS = 3;

type Step1Errors = Partial<Record<keyof EmpresaData, string>>;

export default function PerfilEmpresaPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<WizardData>({
    empresa: { ...MOCK_EMPRESA },
    equipo: { planilla: '', honorarios: '', informales: '' },
  });

  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  // Refs para el contenedor de pasos (animación)
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- Validación paso 1 ---- */
  const validateStep1 = (): boolean => {
    const errors: Step1Errors = {};
    if (!data.empresa.razonSocial.trim()) errors.razonSocial = 'La razón social es obligatoria';
    if (!data.empresa.regimenTributario) errors.regimenTributario = 'Selecciona tu régimen tributario';
    if (!data.empresa.rubro) errors.rubro = 'Selecciona el rubro de tu empresa';
    if (!data.empresa.direccionFiscal.trim()) errors.direccionFiscal = 'La dirección fiscal es obligatoria';
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---- Navegación entre pasos ---- */
  const goTo = (nextStep: number) => {
    if (animating) return;
    setDirection(nextStep > currentStep ? 'forward' : 'back');
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setAnimating(false);
      // Scroll al top de la card
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 220);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
    }
    if (currentStep < TOTAL_STEPS) goTo(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) goTo(currentStep - 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1800));
    setSaving(false);
    router.push('/dashboard');
  };

  const handleCorrect = () => goTo(1);

  /* ---- Animación CSS ---- */
  const slideClass = animating
    ? direction === 'forward'
      ? 'translate-x-4 opacity-0'
      : '-translate-x-4 opacity-0'
    : 'translate-x-0 opacity-100';

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-8"
      style={{ background: 'linear-gradient(160deg, #F4F6F9 0%, #E8EEF8 100%)' }}
    >
      {/* Decoraciones de fondo */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#1B3A6B', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="fixed bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#4A90D9', transform: 'translate(-30%, 30%)' }}
      />

      <div className="w-full max-w-lg flex flex-col gap-5" ref={containerRef}>
        {/* Logo */}
        <div className="flex justify-center">
          <LogoMCF size="sm" showSlogan={false} />
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-xl font-black" style={{ color: '#1B3A6B' }}>
            Configura tu perfil de empresa
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Solo tomará 2 minutos. Puedes editarlo después.
          </p>
        </div>

        {/* Card principal */}
        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(27, 58, 107, 0.12)' }}
        >
          {/* Barra de progreso */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <StepIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              labels={STEP_LABELS}
            />
          </div>

          {/* Contenido del paso con animación */}
          <div className="px-6 py-5 overflow-hidden">
            <div
              className={`transition-all duration-200 ease-in-out ${slideClass}`}
            >
              {/* Header del paso */}
              <div className="mb-5">
                <h2 className="text-base font-bold" style={{ color: '#1B3A6B' }}>
                  {currentStep === 1 && 'Datos de tu empresa'}
                  {currentStep === 2 && '¿Cuántas personas trabajan en tu empresa?'}
                  {currentStep === 3 && 'Resumen de tu perfil'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {currentStep === 1 && 'Cargamos tus datos de SUNAT. Corrígelos si hace falta.'}
                  {currentStep === 2 && 'Incluye a todos, sea cual sea su tipo de contrato.'}
                  {currentStep === 3 && 'Verifica que todo esté bien antes de continuar.'}
                </p>
              </div>

              {currentStep === 1 && (
                <Step1Empresa
                  data={data.empresa}
                  onChange={(empresa) => setData({ ...data, empresa })}
                  errors={step1Errors}
                />
              )}
              {currentStep === 2 && (
                <Step2Equipo
                  data={data.equipo}
                  onChange={(equipo) => setData({ ...data, equipo })}
                />
              )}
              {currentStep === 3 && (
                <Step3Confirmacion
                  data={data}
                  onCorrect={handleCorrect}
                />
              )}
            </div>
          </div>

          {/* Footer con botones */}
          <div
            className="px-6 py-4 flex items-center justify-between gap-3"
            style={{ borderTop: '1px solid #F1F5F9', background: '#FAFBFC' }}
          >
            {/* Botón Anterior */}
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || animating}
              className="flex items-center gap-2 py-3 px-5 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-100 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed border-2"
              style={{ color: '#1B3A6B', borderColor: '#E0E5EF' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {/* Indicador de puntos */}
            <div className="flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: currentStep === i + 1 ? 20 : 6,
                    height: 6,
                    background: currentStep === i + 1 ? '#1B3A6B' : '#D1D5DB',
                  }}
                />
              ))}
            </div>

            {/* Botón Siguiente / Finalizar */}
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={animating}
                className="flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 shadow-md"
                style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #2E5CA8 100%)' }}
              >
                Siguiente
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving || animating}
                className="flex items-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 shadow-md"
                style={{ background: 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)' }}
              >
                {saving ? (
                  <>
                    <LoadingSpinner />
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Todo está correcto, ir a mi dashboard
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Nota de seguridad */}
        <p className="text-center text-xs text-gray-400">
          🔒 Tu información está protegida y nunca se comparte con terceros
        </p>
      </div>
    </main>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
