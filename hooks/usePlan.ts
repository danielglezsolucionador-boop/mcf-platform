'use client';

import { useState, useEffect } from 'react';
import { Plan } from '@/components/dashboard/types';

export function usePlan(defaultPlan: Plan = 'estudiante') {
  const [plan, setPlan] = useState<Plan>(defaultPlan);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcf_plan') as Plan;
      if (saved && ['estudiante', 'empresario', 'pro'].includes(saved)) {
        setPlan(saved);
      }
    }
  }, []);

  const changePlan = (newPlan: Plan) => {
    setPlan(newPlan);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mcf_plan', newPlan);
    }
  };

  return [plan, changePlan] as const;
}
