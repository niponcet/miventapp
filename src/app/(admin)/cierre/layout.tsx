import type { ReactNode } from 'react';

export const metadata = {
  title: 'Cierre de Caja | MiVentApp',
  description: 'Módulo de cierre de jornada, balance diario y notificaciones automáticas',
};

export default function CierreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {children}
    </div>
  );
}
