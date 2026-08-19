'use client';

import { useState, useTransition } from 'react';
import type { Producto } from '@/types/database';
import { formatCLP, getProductIcon } from './productUtils';
import { ProfileButton } from './ProfileButton';
import { useCartStore } from '@/store/useCartStore';
import { registrarVentaAction } from '@/app/(ventapp)/actions';

interface VentAppVentaViewProps {
  initialProductos: Producto[];
}

export function VentAppVentaView({ initialProductos }: VentAppVentaViewProps) {
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [completedSale, setCompletedSale] = useState<{ units: number; totalVenta: number } | null>(null);

  // Zustand Store del Carrito
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeOne = useCartStore((state) => state.removeOne);
  const clearCart = useCartStore((state) => state.clearCart);

  // Totales derivados de Zustand
  const totalUnits = cartItems.reduce((sum, i) => sum + i.cantidad, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.producto.precio_venta * i.cantidad, 0);

  // Filtrar productos por búsqueda
  const filteredProducts = productos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(search.toLowerCase()))
  );

  const handleProductClick = (producto: Producto) => {
    setStatusMessage(null);
    const result = addItem(producto);

    if (!result.success && result.message) {
      setStatusMessage({ text: result.message, type: 'error' });
    }
  };

  const handleRemoveOne = (productoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusMessage(null);
    removeOne(productoId);
  };

  const handleClear = () => {
    setStatusMessage(null);
    clearCart();
  };

  const handleCobrar = () => {
    if (totalUnits === 0) return;

    setStatusMessage(null);
    startTransition(async () => {
      const itemsToCheckout = cartItems.map((i) => ({
        productoId: i.producto.id,
        cantidad: i.cantidad,
      }));

      const result = await registrarVentaAction(itemsToCheckout);

      if (!result.success) {
        setStatusMessage({
          text: result.error || 'Ocurrió un error al procesar el cobro',
          type: 'error',
        });
      } else {
        const unitsSold = totalUnits;
        const totalVenta = result.totalVenta || totalAmount;

        // Descontar existencias en el estado local de productos de la vista
        setProductos((prev) =>
          prev.map((p) => {
            const soldItem = cartItems.find((i) => i.producto.id === p.id);
            if (soldItem) {
              return { ...p, stock_actual: Math.max(0, p.stock_actual - soldItem.cantidad) };
            }
            return p;
          })
        );

        // Limpiar carrito en Zustand
        clearCart();

        // Mostrar ticket modal de confirmación
        setCompletedSale({
          units: unitsSold,
          totalVenta,
        });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0F1419] text-[#E7EBEF] w-full">
      {/* Header Fijo con soporte Safe-Area y Blur Nativo */}
      <header className="sticky top-0 z-30 bg-[#0F1419]/90 backdrop-blur-md border-b border-[#232B34]/60 flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-3.5 shrink-0 transition-colors">
        <h1 className="font-heading font-bold text-[19px] text-[#E7EBEF] tracking-tight">
          Nueva venta
        </h1>
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

      {/* Search Row */}
      <div className="px-5 pt-3.5 pb-3.5 shrink-0">
        <div className="flex items-center gap-2.5 bg-[#1A2129] border border-[#2A333D] rounded-[16px] px-3.5 py-3 min-h-[44px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className="w-[18px] h-[18px] text-[#5B6472] shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto en catálogo..."
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

      {/* Feedback Alert Toast */}
      {statusMessage && (
        <div className="px-5 mb-3">
          <div
            className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium border ${
              statusMessage.type === 'error'
                ? 'bg-[#C0526B]/15 border-[#C0526B]/40 text-[#E78B9F]'
                : 'bg-[#4F9E82]/15 border-[#4F9E82]/40 text-[#4F9E82]'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="ml-2 text-current opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-5 min-h-0">
        {/* Quick Action Chips */}
        <div className="flex gap-2.5 mb-4">
          <button
            type="button"
            disabled={totalUnits === 0 || isPending}
            onClick={handleCobrar}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 font-bold rounded-[14px] py-3 text-[14px] transition-all active:scale-95 shadow-md ${
              totalUnits > 0 && !isPending
                ? 'bg-[#5B8DEF] text-[#06121F] shadow-[#5B8DEF]/20 cursor-pointer'
                : 'bg-[#1A2129] text-[#5B6472] border border-[#232B34] cursor-not-allowed opacity-70'
            }`}
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4 text-[#06121F]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} className="w-[17px] h-[17px]">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {totalUnits > 0 ? `Cobrar (${formatCLP(totalAmount)})` : 'Cobrar'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={totalUnits === 0}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 border rounded-[14px] py-3 text-[14px] transition-all ${
              totalUnits > 0
                ? 'bg-[#1A2129] border-[#2A333D] text-[#E7EBEF] font-bold cursor-pointer active:scale-95 hover:border-[#5B6472]'
                : 'bg-[#1A2129]/50 border-[#232B34] text-[#5B6472] cursor-not-allowed'
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[17px] h-[17px]">
              <rect x="3" y="7" width="18" height="13" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {totalUnits > 0 ? `Limpiar (${totalUnits})` : 'Orden vacía'}
          </button>
        </div>

        {/* Selected Items Floating Summary Bar */}
        {totalUnits > 0 && (
          <div className="flex items-center justify-between bg-[#1A2129] border border-[#5B8DEF]/40 rounded-xl px-3.5 py-2.5 mb-3 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#5B8DEF] animate-pulse" />
              <span className="text-xs text-[#E7EBEF] font-semibold">
                {totalUnits} ítem(s) en la orden
              </span>
            </div>
            <span className="font-mono text-sm font-bold text-[#5B8DEF]">
              {formatCLP(totalAmount)}
            </span>
          </div>
        )}

        {/* Product Grid */}
        <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#5B6472] mb-2.5 flex justify-between items-center">
          <span>Productos en catálogo ({filteredProducts.length})</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[#5B6472]">
            <p className="text-sm">No se encontraron productos para &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filteredProducts.map((p) => {
              const cartItem = cartItems.find((i) => i.producto.id === p.id);
              const qtySelected = cartItem ? cartItem.cantidad : 0;
              const isOutOfStock = p.stock_actual <= 0;
              const isMaxSelected = qtySelected >= p.stock_actual;
              const icon = getProductIcon(p.nombre);

              return (
                <div
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className={`bg-[#1A2129] border rounded-[16px] p-[12px_11px_11px] flex flex-col gap-2 transition-all relative select-none ${
                    isOutOfStock
                      ? 'opacity-40 border-[#232B34] cursor-not-allowed'
                      : qtySelected > 0
                      ? 'border-[#5B8DEF] shadow-md shadow-[#5B8DEF]/10 cursor-pointer active:scale-[0.97]'
                      : 'border-[#232B34] hover:border-[#2A333D] cursor-pointer active:scale-[0.97]'
                  }`}
                >
                  {/* Badge contador de unidades en orden */}
                  {qtySelected > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <button
                        type="button"
                        onClick={(e) => handleRemoveOne(p.id, e)}
                        className="w-5 h-5 rounded-full bg-[#C0526B] text-white flex items-center justify-center text-xs font-bold hover:opacity-90 active:scale-90 cursor-pointer"
                        title="Quitar uno"
                      >
                        -
                      </button>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          isMaxSelected
                            ? 'bg-[#D98B4F] text-[#06121F]'
                            : 'bg-[#5B8DEF] text-[#06121F]'
                        }`}
                        title={isMaxSelected ? 'Stock máximo alcanzado' : `${qtySelected} en orden`}
                      >
                        {qtySelected}
                      </span>
                    </div>
                  )}

                  {/* Swatch con Icono */}
                  <div className="w-full h-[44px] rounded-[10px] bg-[#212A34] flex items-center justify-center text-[#5B8DEF]">
                    {icon}
                  </div>

                  {/* Nombre */}
                  <div className="text-[13px] font-bold text-[#E7EBEF] leading-[1.2] truncate" title={p.nombre}>
                    {p.nombre}
                  </div>

                  {/* Precios y Stock Disponible */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="font-mono text-[13.5px] font-bold text-[#E7EBEF]">
                      {formatCLP(p.precio_venta)}
                    </div>
                    <div
                      className={`text-[10px] font-mono font-semibold ${
                        isOutOfStock
                          ? 'text-[#C0526B]'
                          : isMaxSelected
                          ? 'text-[#D98B4F]'
                          : 'text-[#5B6472]'
                      }`}
                    >
                      {isOutOfStock
                        ? 'Agotado'
                        : isMaxSelected
                        ? `${p.stock_actual} máx`
                        : `${p.stock_actual} disp.`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Venta Exitosa / Ticket */}
      {completedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setCompletedSale(null)}
        >
          <div
            className="w-full max-w-xs bg-[#1A2129] border border-[#2A333D] rounded-3xl p-6 shadow-2xl text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-[#4F9E82]/20 text-[#4F9E82] flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-6 h-6">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-lg text-white mb-1">
              ¡Venta Completada!
            </h3>
            <p className="text-xs text-[#8B95A3] mb-4">
              La transacción y el descuento de stock se registraron atómicamente en la base de datos.
            </p>

            <div className="bg-[#0F1419] rounded-xl p-3 mb-4 space-y-1 text-xs">
              <div className="flex justify-between text-[#8B95A3]">
                <span>Ítems vendidos:</span>
                <span className="font-mono text-white">{completedSale.units} unidades</span>
              </div>
              <div className="flex justify-between text-[#8B95A3]">
                <span>Total cobrado:</span>
                <span className="font-mono font-bold text-[#4F9E82]">
                  {formatCLP(completedSale.totalVenta)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCompletedSale(null)}
              className="w-full py-3 bg-[#5B8DEF] text-[#06121F] font-bold rounded-xl text-sm transition-all active:scale-95 cursor-pointer"
            >
              Continuar vendiendo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
