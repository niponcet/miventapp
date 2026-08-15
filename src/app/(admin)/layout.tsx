/**
 * Layout para el grupo de rutas (admin).
 *
 * Estructura sidebar + main content fiel al diseño de referencia.
 */
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';

export const metadata = {
  title: 'Admin | MiVentApp',
  description: 'Panel de administración de inventario y analítica',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main
        className="flex-1 h-screen min-w-0 flex flex-col overflow-hidden"
        style={{ padding: '22px 28px 20px' }}
      >
        {children}
      </main>
    </div>
  );
}
