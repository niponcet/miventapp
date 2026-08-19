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

  const toggleExpand = (id: string) => {
    setExpandedSaleId((prev) => (prev === id ? null : id));
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
        {/* Date Chip */}
        <div className="flex items-center gap-[6px] bg-[#1A2129] border border-[#2A333D] rounded-[11px] px-[12px] py-[8px] text-[12px] font-semibold text-[#8B95A3] w-fit mb-[14px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[13px] h-[13px]">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {fechaFormateada}
        </div>

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
