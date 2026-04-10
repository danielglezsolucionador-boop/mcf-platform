'use client';

import PlanBadge from './PlanBadge';
import { Plan, PLAN_LABELS } from './types';

interface DashboardHeaderProps {
  plan: Plan;
  onPlanChange: (plan: Plan) => void;
  userName: string;
  companyName: string;
  currentPage: string;
}

const PAGE_TITLES: Record<string, string> = {
  inicio: 'Dashboard',
  diagnostico: 'Diagnóstico',
  simulador: 'Simulador',
  educacion: 'Educación',
  ecosistema: 'Ecosistema',
  configuracion: 'Configuración',
};

export default function DashboardHeader({
  plan,
  onPlanChange,
  userName,
  companyName,
  currentPage,
}: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  // Capitalizar primera letra
  const todayStr = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header
      className="sticky top-0 z-20 px-4 lg:px-6 py-3.5 flex items-center gap-3"
      style={{
        background: 'rgba(244, 246, 249, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(27,58,107,0.08)',
      }}
    >
      {/* Título de página */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-black leading-none" style={{ color: '#1B3A6B' }}>
          {PAGE_TITLES[currentPage] ?? 'Dashboard'}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{todayStr}</p>
      </div>

      {/* Selector de plan (demo) */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2"
        style={{ borderColor: '#E0E5EF', background: 'white' }}
      >
        <span className="text-xs text-gray-400 hidden sm:block font-medium whitespace-nowrap">
          Simular plan:
        </span>
        <select
          value={plan}
          onChange={(e) => onPlanChange(e.target.value as Plan)}
          className="text-xs font-bold outline-none bg-transparent cursor-pointer"
          style={{ color: '#1B3A6B' }}
        >
          <option value="estudiante">🎓 Estudiante</option>
          <option value="empresario">💼 Empresario</option>
          <option value="pro">⭐ Pro</option>
        </select>
      </div>

      {/* Info de empresa + avatar */}
      <div className="flex items-center gap-2.5">
        <div className="text-right hidden sm:block min-w-0">
          <p className="text-sm font-semibold leading-none truncate max-w-32" style={{ color: '#1B3A6B' }}>
            {userName}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <p className="text-xs text-gray-400 truncate max-w-28">{companyName}</p>
            <PlanBadge plan={plan} size="sm" />
          </div>
        </div>
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #4A90D9 100%)', color: 'white' }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
