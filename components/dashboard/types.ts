export type Plan = 'estudiante' | 'empresario' | 'pro';

export const PLAN_LEVEL: Record<Plan, number> = {
  estudiante: 0,
  empresario: 1,
  pro: 2,
};

export const PLAN_LABELS: Record<Plan, string> = {
  estudiante: 'Plan Estudiante',
  empresario: 'Plan Empresario',
  pro: 'Plan Pro',
};

export const PLAN_PRICE: Record<Plan, string> = {
  estudiante: 'Gratis',
  empresario: 'S/. 50/mes',
  pro: 'S/. 99/mes',
};

export const PLAN_COLORS: Record<Plan, { bg: string; text: string; border: string }> = {
  estudiante: { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
  empresario: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  pro: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
};

export interface NavItem {
  id: string;
  label: string;
  emoji: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'inicio', label: 'Inicio', emoji: '🏠', href: '/dashboard' },
  { id: 'diagnostico', label: 'Diagnóstico', emoji: '📊', href: '/diagnostico' },
  { id: 'simulador', label: 'Simulador', emoji: '🎮', href: '/dashboard/simulador' },
  { id: 'educacion', label: 'Educación', emoji: '📚', href: '/dashboard/educacion' },
  { id: 'ecosistema', label: 'Ecosistema', emoji: '🌐', href: '/dashboard/ecosistema' },
  { id: 'configuracion', label: 'Configuración', emoji: '⚙️', href: '/dashboard/configuracion' },
];
