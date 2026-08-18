/**
 * Layout para el grupo de rutas (ventapp).
 *
 * Interfaz de ventas con alto contraste, sin sidebar.
 * Diseñada para pantalla completa y uso táctil en móviles/tablets (PWA).
 */
import type { ReactNode } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/app/(auth)/actions';

export const metadata = {
  title: 'VentApp | MiVentApp POS',
  description: 'Punto de venta táctil con interfaz de alto contraste',
};

export default async function VentAppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName =
    user?.user_metadata?.nombre_completo ||
    user?.email?.split('@')[0] ||
    'Cajero';

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header compacto optimizado para PWA / POS */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-4 bg-zinc-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-xs text-black font-mono">
            MV
          </div>
          <div>
            <span className="text-sm font-bold text-indigo-400">VentApp POS</span>
            <div className="text-[11px] text-zinc-400">Cajero: <span className="text-zinc-200 font-medium">{userName}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            ← Panel Admin
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg bg-red-950/40 border border-red-900/50 p-1.5 text-xs text-red-300 hover:bg-red-900/60 hover:text-red-100 transition-colors"
              title="Cerrar turno / Salir"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </header>

      {/* Contenido principal a pantalla completa */}
      <main className="flex flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
