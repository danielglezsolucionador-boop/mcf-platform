'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Plan } from '@/components/dashboard/types';

const MOCK_USER = { nombre: 'Carlos García', empresa: 'Empresa Demo Peru S.A.C.' };

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  plan: Plan;
  onPlanChange: (plan: Plan) => void;
}

export default function AppLayout({ children, currentPage, plan, onPlanChange }: AppLayoutProps) {
  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <Sidebar
        activeItem={currentPage}
        plan={plan}
        userName={MOCK_USER.nombre}
        companyName={MOCK_USER.empresa}
      />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <DashboardHeader
          plan={plan}
          onPlanChange={onPlanChange}
          userName={MOCK_USER.nombre}
          companyName={MOCK_USER.empresa}
          currentPage={currentPage}
        />
        <main className="flex-1 px-4 lg:px-6 py-5 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav activeItem={currentPage} />
    </div>
  );
}
