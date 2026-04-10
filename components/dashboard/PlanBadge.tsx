'use client';

import { Plan, PLAN_LABELS, PLAN_COLORS } from './types';

interface PlanBadgeProps {
  plan: Plan;
  size?: 'sm' | 'md';
}

const PLAN_ICONS: Record<Plan, string> = {
  estudiante: '🎓',
  empresario: '💼',
  pro: '⭐',
};

export default function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  const colors = PLAN_COLORS[plan];
  const isSmall = size === 'sm';

  return (
    <span
      className="inline-flex items-center gap-1 font-bold rounded-full border"
      style={{
        background: colors.bg,
        color: colors.text,
        borderColor: colors.border,
        fontSize: isSmall ? '0.65rem' : '0.75rem',
        padding: isSmall ? '2px 8px' : '3px 10px',
      }}
    >
      <span>{PLAN_ICONS[plan]}</span>
      {PLAN_LABELS[plan]}
    </span>
  );
}
