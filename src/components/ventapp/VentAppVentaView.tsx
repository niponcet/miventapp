'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Producto } from '@/types/database';
import { formatCLP, getProductIcon } from './productUtils';

interface VentAppVentaViewProps {
  initialProductos: Producto[];
}

export function VentAppVentaView({ initialProductos }: VentAppVentaViewProps) {
  const [productos] = useState<Producto[]>(initialProductos);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: number }>({});
  const [showHistory, setShowHistory] = useState(false);

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

  // Manejo de carrito rápido
  const handleProductClick = (productId: string) => {
    setSelectedItems((prev) => {
      const current = prev[productId] || 0;
      return { ...prev, [productId]: current + 1 };
    });
  };

  const handleRemoveOne = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  // Totales
  const totalUnits = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  }, [selectedItems]);

  const totalAmount = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const prod = productos.find((p) => p.id === id);
      return sum + (prod ? prod.precio_venta * qty : 0);
    }, 0);
  }, [selectedItems, productos]);

  const handleClear = () => {
    setSelectedItems({});
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0F1419] text-[#E7EBEF] w-full">
      {/* Header con soporte Safe-Area */}
      <header className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-3.5 shrink-0">
        <h1 className="font-heading font-bold text-[19px] text-[#E7EBEF] tracking-tight">
          Nueva venta
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-xs text-[#8B95A3] bg-[#1A2129] border border-[#2A333D] px-2.5 py-1.5 rounded-lg hover:text-white transition-colors"
          >
            ← Admin
          </Link>
          <button
            type="button"
            className="w-[38px] h-[38px] rounded-[12px] bg-[#212A34] border border-[#2A333D] flex items-center justify-center relative shrink-0 text-[#8B95A3] hover:text-white transition-colors active:scale-95 cursor-pointer"
            title="Notificaciones"
            aria-label="Notificaciones"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-[18px] h-[18px]">
              <path d="M17 8.5a5 5 0 1 0-9.8 1.5L3 21l6.5-2a5 5 0 0 0 7.5-4.5" />
            </svg>
            <span className="absolute -top-[3px] -right-[3px] w-[11px] h-[11px] rounded-full bg-[#C0526B] border-2 border-[#0F1419]" />
          </button>
        </div>
      </header>

      {/* Search Row */}
      <div className="px-5 pb-3.5 shrink-0">
        <div className="flex items-center gap-2.5 bg-[#1A2129] border border-[#2A333D] rounded-[16px] px-3.5 py-3 min-h-[44px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className="w-[18px] h-[18px] text-[#5B6472] shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="bg-transparent border-none text-[14.5px] font-semibold text-[#E7EBEF] placeholder:text-[#5B6472] w-full outline-none"
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
      </div>

      {/* Body */}
      <div className="flex-1 px-5 min-h-0">
        {/* Quick Action Chips */}
        <div className="flex gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => {
              if (totalUnits > 0) {
                alert(`Cobrando ${totalUnits} producto(s) por un total de ${formatCLP(totalAmount)}`);
              }
            }}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 font-bold rounded-[14px] py-3 text-[14px] cursor-pointer transition-all active:scale-95 shadow-md ${
              totalUnits > 0
                ? 'bg-[#5B8DEF] text-[#06121F] shadow-[#5B8DEF]/20'
                : 'bg-[#5B8DEF]/20 text-[#5B8DEF] border border-[#5B8DEF]/30'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className="w-[17px] h-[17px]">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {totalUnits > 0 ? `Cobrar (${formatCLP(totalAmount)})` : 'Cobrar'}
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-[#1A2129] border border-[#2A333D] text-[#E7EBEF] font-bold rounded-[14px] py-3 text-[14px] cursor-pointer transition-transform active:scale-95 hover:border-[#5B6472]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[17px] h-[17px] text-[#E7EBEF]">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {totalUnits > 0 ? `Seleccionados (${totalUnits})` : 'Historial'}
          </button>
        </div>

        {/* Selected items quick bar if any */}
        {totalUnits > 0 && (
          <div className="flex items-center justify-between bg-[#1A2129] border border-[#5B8DEF]/30 rounded-xl px-3 py-2 mb-3">
            <span className="text-xs text-[#5B8DEF] font-semibold">
              {totalUnits} ítem(s) en orden actual
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-[#C0526B] hover:underline font-medium"
            >
              Limpiar
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#5B6472] mb-2.5">
          Productos ({filteredProducts.length})
        </div>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[#5B6472]">
            <p className="text-sm">No se encontraron productos para &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filteredProducts.map((p) => {
              const qtySelected = selectedItems[p.id] || 0;
              const icon = getProductIcon(p.nombre);

              return (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p.id)}
                  className={`bg-[#1A2129] border rounded-[16px] p-[12px_11px_11px] flex flex-col gap-2 cursor-pointer transition-all active:scale-[0.97] relative ${
                    qtySelected > 0
                      ? 'border-[#5B8DEF] shadow-md shadow-[#5B8DEF]/10'
                      : 'border-[#232B34] hover:border-[#2A333D]'
                  }`}
                >
                  {qtySelected > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        onClick={(e) => handleRemoveOne(p.id, e)}
                        className="w-5 h-5 rounded-full bg-[#C0526B] text-white flex items-center justify-center text-xs font-bold"
                        title="Quitar uno"
                      >
                        -
                      </button>
                      <span className="w-5 h-5 rounded-full bg-[#5B8DEF] text-[#06121F] flex items-center justify-center text-xs font-bold font-mono">
                        {qtySelected}
                      </span>
                    </div>
                  )}

                  <div className="w-full h-[44px] rounded-[10px] bg-[#212A34] flex items-center justify-center text-[#5B8DEF]">
                    {icon}
                  </div>
                  <div className="text-[13px] font-bold text-[#E7EBEF] leading-[1.2] truncate" title={p.nombre}>
                    {p.nombre}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[14px] font-bold text-[#E7EBEF]">
                      {formatCLP(p.precio_venta)}
                    </div>
                    <div className="text-[10px] text-[#5B6472] font-mono">
                      {p.stock_actual} disp.
                    </div>
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
