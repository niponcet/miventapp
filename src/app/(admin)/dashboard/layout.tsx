import type { ReactNode } from 'react';

export const metadata = {
  title: 'Analítica | MiVentApp',
  description: 'Módulo 3: Analítica de ventas, métricas y ledger de jornada',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {children}
    </div>
  );
}
