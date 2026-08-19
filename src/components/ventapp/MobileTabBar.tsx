'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileTabBar() {
  const pathname = usePathname();

  const isVenta = pathname === '/ventapp';
  const isInventario = pathname === '/ventapp/inventario';
  const isAnalitica = pathname === '/ventapp/analitica';

  return (
    <div className="absolute bottom-[max(0.85rem,env(safe-area-inset-bottom,0px))] left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
      <nav
        className="pointer-events-auto flex items-center gap-[3px] bg-[#0F1419]/95 border border-[#2A333D] rounded-full p-[4px] shadow-2xl backdrop-blur-md"
        aria-label="Navegación principal de VentApp"
      >
        {/* Tab 1: Venta */}
        <Link
          href="/ventapp"
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold select-none transition-all duration-150 active:scale-95 cursor-pointer ${
            isVenta
              ? 'bg-[#5B8DEF] text-[#06121F] shadow-sm'
              : 'text-[#8B95A3] hover:text-[#E7EBEF]'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-4 h-4 shrink-0">
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="17" cy="20" r="1.4" />
            <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
          </svg>
          <span>Venta</span>
        </Link>

        {/* Tab 2: Inventario */}
        <Link
          href="/ventapp/inventario"
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold select-none transition-all duration-150 active:scale-95 cursor-pointer ${
            isInventario
              ? 'bg-[#5B8DEF] text-[#06121F] shadow-sm'
              : 'text-[#8B95A3] hover:text-[#E7EBEF]'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-4 h-4 shrink-0">
            <path d="M3 7l9-4 9 4-9 4-9-4z" />
            <path d="M3 7v10l9 4 9-4V7" />
          </svg>
          <span>Inventario</span>
        </Link>

        {/* Tab 3: Analítica */}
        <Link
          href="/ventapp/analitica"
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold select-none transition-all duration-150 active:scale-95 cursor-pointer ${
            isAnalitica
              ? 'bg-[#5B8DEF] text-[#06121F] shadow-sm'
              : 'text-[#8B95A3] hover:text-[#E7EBEF]'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-4 h-4 shrink-0">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
          <span>Analítica</span>
        </Link>
      </nav>
    </div>
  );
}
