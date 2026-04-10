'use client';

import Link from 'next/link';
import LogoMCF from '@/components/auth/LogoMCF';
import PlanBadge from './PlanBadge';
import { Plan, NAV_ITEMS, PLAN_PRICE } from './types';

interface SidebarProps {
  activeItem: string;
  plan: Plan;
  userName: string;
  companyName: string;
}

export default function Sidebar({ activeItem, plan, userName, companyName }: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-30"
      style={{ background: '#1B3A6B', boxShadow: '4px 0 24px rgba(27,58,107,0.18)' }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <rect x="20" y="6" width="8" height="36" rx="3" fill="white" />
              <rect x="6" y="20" width="36" height="8" rx="3" fill="white" />
              <circle cx="38" cy="10" r="4" fill="#E63946" />
            </svg>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-none">MCF</p>
            <p className="text-blue-200 text-xs leading-none mt-0.5">Médico Contable</p>
          </div>
        </div>
      </div>

      {/* Perfil usuario */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #4A90D9 0%, #E63946 100%)', color: 'white' }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{userName}</p>
            <p className="text-blue-200 text-xs truncate">{companyName}</p>
          </div>
        </div>
        <div className="mt-2.5">
          <PlanBadge plan={plan} size="sm" />
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
              style={{
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <span className="text-xl w-7 text-center flex-shrink-0">{item.emoji}</span>
              <span
                className="text-sm font-semibold transition-colors"
                style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.65)' }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#4A90D9' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Card de upgrade */}
      {plan !== 'pro' && (
        <div className="mx-3 mb-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-white text-xs font-bold">
              {plan === 'estudiante' ? '🚀 ¡Desbloquea MCF completo!' : '⭐ Pasa al Plan Pro'}
            </p>
            <p className="text-blue-200 text-xs mt-1 leading-relaxed">
              {plan === 'estudiante'
                ? 'Accede a diagnóstico, simuladores y alertas de IA.'
                : 'Recomendaciones ilimitadas de IA y todos los simuladores.'}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-white font-black text-sm">
                {plan === 'estudiante' ? 'S/. 50/mes' : 'S/. 99/mes'}
              </span>
              <button
                className="ml-auto py-1.5 px-3 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#E63946' }}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Versión */}
      <div className="px-4 pb-4">
        <p className="text-blue-300 text-xs opacity-50">MCF v1.0 · {PLAN_PRICE[plan]}</p>
      </div>
    </aside>
  );
}
