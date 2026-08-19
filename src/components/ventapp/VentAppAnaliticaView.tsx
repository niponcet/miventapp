'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatCLP, formatTime24, formatDateShort } from './productUtils';
import { ProfileButton } from './ProfileButton';

export interface VentaHistorialItem {
  id: string;
  total_venta: number;
  ganancia_neta: number;
  fecha_hora: string | null;
  estado: string;
  items: {
    nombre: string;
    cantidad: number;
    subtotal: number;
  }[];
}

interface VentAppAnaliticaViewProps {
  totalVendido: number;
  gananciaNeta: number;
  transacciones: number;
  stockCritico: number;
  fechaFormateada: string;
  historialVentas: VentaHistorialItem[];
}

export function VentAppAnaliticaView({
  totalVendido,
  gananciaNeta,
  transacciones,
  stockCritico,
  fechaFormateada,
  historialVentas,
}: VentAppAnaliticaViewProps) {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [cierreFeedback, setCierreFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    whatsappUrl?: string;
  } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSaleId((prev) => (prev === id ? null : id));
  };

  const handleCerrarCaja = async () => {
    setIsClosing(true);
    setCierreFeedback(null);

    try {
      const res = await fetch('/api/cierre-jornada', {
        method: 'POST',
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Error al procesar el cierre de caja');
      }

      setCierreFeedback({
        type: 'success',
        message: '¡Cierre de jornada consolidado y guardado con éxito!',
        whatsappUrl: json.whatsappUrl,
      });
    } catch (err: any) {
      setCierreFeedback({
        type: 'error',
        message: err.message || 'Error al procesar cierre de caja',
      });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0F1419] text-[#E7EBEF] w-full">
      {/* Header Fijo con soporte Safe-Area y Blur Nativo */}
      <header className="sticky top-0 z-30 bg-[#0F1419]/90 backdrop-blur-md border-b border-[#232B34]/60 flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-3.5 shrink-0 transition-colors">
        <div>
          <h1 className="font-heading font-bold text-[19px] text-[#E7EBEF] tracking-tight">
            Analítica & Ventas
          </h1>
          <div className="text-[11px] text-[#5B6472] mt-[2px]">
            Desempeño e historial en tiempo real
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
      <div className="flex-1 px-5 pt-3.5 pb-6 min-h-0">
        {/* Date Chip & Cerrar Caja Row */}
        <div className="flex items-center justify-between gap-2 mb-[14px]">
          {/* Date Chip */}
          <div className="flex items-center gap-[6px] bg-[#1A2129] border border-[#2A333D] rounded-[11px] px-[12px] py-[8px] text-[12px] font-semibold text-[#8B95A3] w-fit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[13px] h-[13px]">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {fechaFormateada}
          </div>

          {/* Botón Cerrar Caja alineado a la derecha */}
          <button
            type="button"
            onClick={handleCerrarCaja}
            disabled={isClosing}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-[11px] transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isClosing ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Cerrando...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-3.5 h-3.5">
                  <path d="M20.5 11.5a8.5 8.5 0 1 1-3.3-6.7" />
                  <path d="M21 4v5h-5" />
                </svg>
                <span>Cerrar caja</span>
              </>
            )}
          </button>
        </div>

        {/* Feedback Alert Toast de Cierre */}
        {cierreFeedback && (
          <div
            className={`flex flex-col gap-2 p-3.5 rounded-xl text-xs font-medium border mb-3.5 animate-in fade-in duration-200 ${
              cierreFeedback.type === 'error'
                ? 'bg-[#C0526B]/15 border-[#C0526B]/40 text-[#E78B9F]'
                : 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{cierreFeedback.message}</span>
              <button
                type="button"
                onClick={() => setCierreFeedback(null)}
                className="text-current opacity-70 hover:opacity-100 px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            {cierreFeedback.whatsappUrl && (
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-800/40">
                <a
                  href={cierreFeedback.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[11px] rounded-lg transition-colors"
                >
                  <span>Enviar a WhatsApp</span>
                  <span>↗</span>
                </a>
                <Link
                  href="/cierre"
                  className="text-[11px] text-emerald-400 hover:underline px-2 py-1"
                >
                  Ver en panel admin →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* 2x2 KPI Grid */}
        <div className="grid grid-cols-2 gap-[10px] mb-[18px]">
          {/* Card 1: Total vendido */}
          <div className="bg-[#1A2129] border border-[#232B34] rounded-[16px] p-[14px_14px_12px] relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#5B8DEF]">
            <div className="text-[10.5px] text-[#5B6472] font-semibold mb-[8px]">
              Total vendido
            </div>
            <div className="font-mono text-[18px] font-bold text-[#E7EBEF]">
              {formatCLP(totalVendido)}
            </div>
          </div>

          {/* Card 2: Ganancia neta */}
          <div className="bg-[#1A2129] border border-[#232B34] rounded-[16px] p-[14px_14px_12px] relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#4F9E82]">
            <div className="text-[10.5px] text-[#5B6472] font-semibold mb-[8px]">
              Ganancia neta
            </div>
            <div className="font-mono text-[18px] font-bold text-[#E7EBEF]">
              {formatCLP(gananciaNeta)}
            </div>
          </div>

          {/* Card 3: Transacciones */}
          <div className="bg-[#1A2129] border border-[#232B34] rounded-[16px] p-[14px_14px_12px] relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#5B8DEF]">
            <div className="text-[10.5px] text-[#5B6472] font-semibold mb-[8px]">
              Transacciones
            </div>
            <div className="font-mono text-[18px] font-bold text-[#E7EBEF]">
              {transacciones}
            </div>
          </div>

          {/* Card 4: Stock crítico */}
          <div className="bg-[#1A2129] border border-[#232B34] rounded-[16px] p-[14px_14px_12px] relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#D98B4F]">
            <div className="text-[10.5px] text-[#5B6472] font-semibold mb-[8px]">
              Stock crítico
            </div>
            <div className="font-mono text-[18px] font-bold text-[#E7EBEF]">
              {stockCritico}
            </div>
          </div>
        </div>

        {/* Sales History Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-[13px] font-semibold text-[#E7EBEF] flex items-center gap-1.5">
            <span>Historial de ventas</span>
            <span className="text-[#5B6472] font-normal text-[11px]">
              ({historialVentas.length} órdenes)
            </span>
          </div>
          <Link
            href="/ventapp"
            className="text-[11px] font-semibold text-[#5B8DEF] hover:underline"
          >
            + Nueva venta
          </Link>
        </div>

        {/* Sales History List */}
        {historialVentas.length === 0 ? (
          <div className="bg-[#1A2129] border border-[#232B34] rounded-2xl p-8 text-center text-[#5B6472]">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-40 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
              <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
            </svg>
            <p className="text-xs font-semibold text-[#8B95A3]">Sin ventas registradas aún</p>
            <p className="text-[11px] text-[#5B6472] mt-0.5">Las ventas que cobres en terreno aparecerán aquí en tiempo real.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {historialVentas.map((venta) => {
              const isExpanded = expandedSaleId === venta.id;
              const shortId = venta.id ? venta.id.slice(0, 6).toUpperCase() : 'TK';
              const totalItemsCount = venta.items.reduce((sum, i) => sum + i.cantidad, 0);

              return (
                <div
                  key={venta.id}
                  onClick={() => toggleExpand(venta.id)}
                  className="bg-[#1A2129] border border-[#232B34] hover:border-[#2A333D] rounded-2xl p-3.5 transition-all cursor-pointer select-none active:scale-[0.99]"
                >
                  {/* Top line: ID, hora, monto total */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#5B8DEF] bg-[#5B8DEF]/10 border border-[#5B8DEF]/20 px-2 py-0.5 rounded-md">
                        #{shortId}
                      </span>
                      <span className="text-[11px] text-[#5B6472]" suppressHydrationWarning>
                        {formatDateShort(venta.fecha_hora)} · {formatTime24(venta.fecha_hora)}
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold text-[#E7EBEF]">
                      {formatCLP(venta.total_venta)}
                    </div>
                  </div>

                  {/* Summary / Profit line */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B95A3] truncate max-w-[180px]">
                      {totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'} ·{' '}
                      {venta.items.map((i) => `${i.cantidad}x ${i.nombre}`).join(', ')}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#4F9E82] shrink-0">
                      +{formatCLP(venta.ganancia_neta)} ganancia
                    </span>
                  </div>

                  {/* Expanded Items Breakdown */}
                  {isExpanded && (
                    <div className="mt-3 pt-2.5 border-t border-dashed border-[#2A333D] space-y-1.5 animate-in fade-in duration-200">
                      <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#5B6472] mb-1">
                        Detalle de la orden
                      </div>
                      {venta.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-[#8B95A3]">
                          <span className="truncate pr-2">
                            <span className="font-mono font-bold text-white">{it.cantidad}x</span> {it.nombre}
                          </span>
                          <span className="font-mono font-medium text-white shrink-0">
                            {formatCLP(it.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
