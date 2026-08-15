/**
 * Layout para el grupo de rutas (ventapp).
 *
 * Interfaz de ventas con alto contraste, sin sidebar.
 * Diseñada para pantalla completa y uso táctil.
 */
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'VentApp | MiVentApp',
  description: 'Punto de venta con interfaz de alto contraste',
};

export default function VentAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header compacto */}
      <header className="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
        <span className="text-sm font-bold text-indigo-400">VentApp</span>
        <Link
          href="/dashboard"
          className="rounded px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          ← Admin
        </Link>
      </header>

      {/* Contenido principal a pantalla completa */}
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
