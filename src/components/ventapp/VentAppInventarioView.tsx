'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Producto } from '@/types/database';
import { formatCLP, getProductCategory, getProductIcon } from './productUtils';
import { ProfileButton } from './ProfileButton';

interface VentAppInventarioViewProps {
  initialProductos: Producto[];
}

export function VentAppInventarioView({ initialProductos }: VentAppInventarioViewProps) {
  const [productos] = useState<Producto[]>(initialProductos);
  const [search, setSearch] = useState('');

  // Filtrado reactivo en tiempo real
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return productos;
    const q = search.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  }, [productos, search]);

  return (
    <div className="flex-1 flex flex-col bg-[#0F1419] text-[#E7EBEF] w-full">
      {/* Header con soporte Safe-Area */}
      <header className="flex items-center justify-between px-[20px] pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[14px] shrink-0">
        <div>
          <h1 className="font-heading font-bold text-[19px] text-[#E7EBEF] tracking-tight">
            Inventario
          </h1>
          <div className="text-[11px] text-[#5B6472] mt-[2px]">
            {productos.length} productos activos
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProfileButton />
          <button
            type="button"
            className="w-[38px] h-[38px] rounded-[12px] bg-[#212A34] border border-[#2A333D] flex items-center justify-center relative shrink-0 text-[#8B95A3] hover:text-white transition-colors active:scale-95 cursor-pointer"
            title="Notificaciones"
            aria-label="Notificaciones"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute -top-[3px] -right-[3px] w-[10px] h-[10px] rounded-full bg-[#C0526B] border-2 border-[#0F1419]" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 px-[18px] pb-6 min-h-0">
        {/* Search */}
        <div className="flex items-center gap-[9px] bg-[#1A2129] border border-[#2A333D] rounded-[14px] px-[13px] py-[11px] mb-[12px] min-h-[44px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-[16px] h-[16px] text-[#5B6472] shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en inventario..."
            className="bg-transparent border-none text-[13px] text-[#E7EBEF] placeholder:text-[#5B6472] font-medium w-full outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-[#8B95A3] hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[#5B6472]">
            <p className="text-sm">No se encontraron productos para &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="space-y-[10px]">
            {filteredProducts.map((p) => {
              const category = getProductCategory(p.nombre, p.descripcion);
              const icon = getProductIcon(p.nombre);

              let statusClasses = 'bg-[#4F9E82]/14 text-[#4F9E82]';
              if (p.stock_actual <= p.stock_minimo) {
                statusClasses = 'bg-[#C0526B]/14 text-[#C0526B]';
              } else if (p.stock_actual <= p.stock_minimo * 2) {
                statusClasses = 'bg-[#D98B4F]/14 text-[#D98B4F]';
              }

              return (
                <div
                  key={p.id}
                  className="flex items-center gap-[11px] bg-[#1A2129] border border-[#232B34] hover:border-[#2A333D] rounded-[14px] px-[12px] py-[11px] transition-colors"
                >
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-[#262F3A] flex items-center justify-center shrink-0 text-[#8B95A3]">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-[#E7EBEF] truncate" title={p.nombre}>
                      {p.nombre}
                    </div>
                    <div className="text-[11px] text-[#5B6472] mt-[1px] truncate">
                      {category}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[13px] font-semibold text-[#E7EBEF]">
                      {formatCLP(p.precio_venta)}
                    </div>
                    <span
                      className={`font-mono text-[10.5px] font-bold px-[7px] py-[2px] rounded-[6px] mt-[4px] inline-block ${statusClasses}`}
                    >
                      {p.stock_actual} und.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
