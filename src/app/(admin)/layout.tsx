/**
 * Layout para el grupo de rutas (admin).
 *
 * Envuelve las páginas del panel ERP: dashboard y productos.
 * Incluye sidebar de navegación y estructura responsive.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin | MiVentApp',
  description: 'Panel de administración de inventario y analítica',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <div className="flex h-16 items-center px-6">
          <span className="text-lg font-bold text-indigo-600">MiVentApp</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/productos"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            📦 Productos
          </Link>
          <Link
            href="/ventapp"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            🛒 VentApp
          </Link>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800 lg:hidden">
          <span className="text-lg font-bold text-indigo-600">MiVentApp</span>
        </header>

        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
