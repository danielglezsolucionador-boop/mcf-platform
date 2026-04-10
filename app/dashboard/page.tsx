'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Block1IIE from '@/components/dashboard/blocks/Block1IIE';
import Block2Semaforo from '@/components/dashboard/blocks/Block2Semaforo';
import Block3Alertas from '@/components/dashboard/blocks/Block3Alertas';
import Block4Recomendaciones from '@/components/dashboard/blocks/Block4Recomendaciones';
import Block5Simulador from '@/components/dashboard/blocks/Block5Simulador';
import Block6Educacion from '@/components/dashboard/blocks/Block6Educacion';
import { Plan } from '@/components/dashboard/types';

/* ---- Mock del usuario actual ---- */
const MOCK_USER = {
  nombre: 'Carlos García',
  empresa: 'Empresa Demo Peru S.A.C.',
};

export default function DashboardPage() {
  const [plan, setPlan] = useState<Plan>('estudiante');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgrade = () => setShowUpgradeModal(true);

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      {/* Sidebar desktop */}
      <Sidebar
        activeItem="inicio"
        plan={plan}
        userName={MOCK_USER.nombre}
        companyName={MOCK_USER.empresa}
      />

      {/* Área principal con margen para el sidebar */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <DashboardHeader
          plan={plan}
          onPlanChange={setPlan}
          userName={MOCK_USER.nombre}
          companyName={MOCK_USER.empresa}
          currentPage="inicio"
        />

        {/* Contenido */}
        <main className="flex-1 px-4 lg:px-6 py-5 pb-24 lg:pb-8 flex flex-col gap-4">
          {/* Saludo personalizado */}
          <WelcomeBanner plan={plan} userName={MOCK_USER.nombre} />

          {/* Fila superior: IIE + Semáforo */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Block1IIE plan={plan} onUpgrade={handleUpgrade} />
            <Block2Semaforo plan={plan} onUpgrade={handleUpgrade} />
          </div>

          {/* Alertas */}
          <Block3Alertas plan={plan} onUpgrade={handleUpgrade} />

          {/* Recomendaciones + Simulador */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Block4Recomendaciones plan={plan} onUpgrade={handleUpgrade} />
            <Block5Simulador plan={plan} onUpgrade={handleUpgrade} />
          </div>

          {/* Educación (siempre visible) */}
          <Block6Educacion />
        </main>
      </div>

      {/* Navegación móvil inferior */}
      <MobileNav activeItem="inicio" />

      {/* Modal de upgrade */}
      {showUpgradeModal && (
        <UpgradeModal currentPlan={plan} onClose={() => setShowUpgradeModal(false)} onSelect={setPlan} />
      )}
    </div>
  );
}

/* ---- Banner de bienvenida ---- */
function WelcomeBanner({ plan, userName }: { plan: Plan; userName: string }) {
  const firstName = userName.split(' ')[0];

  const msgs: Record<Plan, { text: string; color: string; bg: string; border: string }> = {
    estudiante: {
      text: `¡Hola, ${firstName}! Estás en el Plan Estudiante. Accede a videos y mejora tu conocimiento financiero.`,
      color: '#4B5563',
      bg: '#F9FAFB',
      border: '#E5E7EB',
    },
    empresario: {
      text: `¡Hola, ${firstName}! Tu empresa está siendo monitoreada. Tienes 3 alertas activas que requieren atención.`,
      color: '#1E40AF',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    },
    pro: {
      text: `¡Hola, ${firstName}! Tienes acceso completo. La IA ha generado 5 recomendaciones nuevas para tu empresa.`,
      color: '#92400E',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
  };

  const m = msgs[plan];

  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-3 border"
      style={{ background: m.bg, borderColor: m.border }}
    >
      <span className="text-2xl">
        {plan === 'estudiante' ? '🎓' : plan === 'empresario' ? '💼' : '⭐'}
      </span>
      <p className="text-sm font-medium" style={{ color: m.color }}>
        {m.text}
      </p>
    </div>
  );
}

/* ---- Modal de upgrade ---- */
function UpgradeModal({
  currentPlan,
  onClose,
  onSelect,
}: {
  currentPlan: Plan;
  onClose: () => void;
  onSelect: (p: Plan) => void;
}) {
  const plans: { plan: Plan; price: string; features: string[]; color: string; bg: string }[] = [
    {
      plan: 'estudiante',
      price: 'Gratis',
      features: ['Videos educativos', 'Ejercicios prácticos', 'Comunidad MCF'],
      color: '#4B5563',
      bg: '#F9FAFB',
    },
    {
      plan: 'empresario',
      price: 'S/. 50/mes',
      features: [
        'Todo lo de Estudiante',
        'Diagnóstico empresarial',
        '2 recomendaciones de IA',
        'Semáforo de salud',
        'Alertas tributarias',
        'Simulador de inversión y préstamo',
      ],
      color: '#1E40AF',
      bg: '#EFF6FF',
    },
    {
      plan: 'pro',
      price: 'S/. 99/mes',
      features: [
        'Todo lo de Empresario',
        '5 recomendaciones de IA',
        'Todos los simuladores',
        'Soporte prioritario',
        'Reportes PDF',
        'Asesor contable asignado',
      ],
      color: '#92400E',
      bg: '#FFFBEB',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 className="text-xl font-black" style={{ color: '#1B3A6B' }}>
              Elige tu plan MCF
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Sin permanencia. Cancela cuando quieras.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: '#6B7280' }}
          >
            ✕
          </button>
        </div>

        {/* Planes */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrent = p.plan === currentPlan;
            return (
              <div
                key={p.plan}
                className="rounded-2xl border-2 overflow-hidden"
                style={{
                  borderColor: isCurrent ? '#1B3A6B' : '#E5E7EB',
                  background: p.bg,
                }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-base capitalize" style={{ color: '#1B3A6B' }}>
                      {p.plan === 'pro' ? '⭐ Pro' : p.plan === 'empresario' ? '💼 Empresario' : '🎓 Estudiante'}
                    </span>
                    {isCurrent && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-black" style={{ color: p.color }}>
                    {p.price}
                  </p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { onSelect(p.plan); onClose(); }}
                    className="w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{
                      background: isCurrent ? '#F3F4F6' : 'linear-gradient(135deg, #E63946 0%, #C1121F 100%)',
                      color: isCurrent ? '#9CA3AF' : 'white',
                      cursor: isCurrent ? 'default' : 'pointer',
                    }}
                  >
                    {isCurrent ? 'Plan actual' : 'Seleccionar'}
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
