'use client';

import Link from 'next/link';
import { formatCLP } from './productUtils';

interface TopProductItem {
  nombre: string;
  unidades: number;
  ganancia: number;
}

interface VentAppAnaliticaViewProps {
  totalVendido: number;
  gananciaNeta: number;
  transacciones: number;
  stockCritico: number;
  fechaFormateada: string;
  topProductos: TopProductItem[];
}

export function VentAppAnaliticaView({
  totalVendido,
  gananciaNeta,
  transacciones,
  stockCritico,
  fechaFormateada,
  topProductos,
}: VentAppAnaliticaViewProps) {
  return (
    <div className="flex-1 flex flex-col bg-[#0F1419] text-[#E7EBEF] w-full">
      {/* Header con soporte Safe-Area */}
      <header className="flex items-center justify-between px-[20px] pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[14px] shrink-0">
        <div>
          <h1 className="font-heading font-bold text-[19px] text-[#E7EBEF] tracking-tight">
            Analítica
          </h1>
          <div className="text-[11px] text-[#5B6472] mt-[2px]">
            Desempeño en tiempo real
          </div>
        </div>
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

      {/* Body */}
      <div className="flex-1 px-[18px] pb-6 min-h-0">
        {/* Date Chip */}
        <div className="flex items-center gap-[6px] bg-[#1A2129] border border-[#2A333D] rounded-[11px] px-[12px] py-[8px] text-[12px] font-semibold text-[#8B95A3] w-fit mb-[14px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-[13px] h-[13px]">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {fechaFormateada}
        </div>

        {/* 2x2 KPI Grid */}
        <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
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

        {/* Top Sellers Header */}
        <div className="flex justify-between items-center mb-[10px]">
          <div className="text-[13px] font-semibold text-[#E7EBEF]">
            Productos destacados <span className="text-[#5B6472] font-medium text-[11px]">· catálogo</span>
          </div>
        </div>

        {/* Top Sellers List */}
        <div>
          {topProductos.length === 0 ? (
            <div className="text-center py-6 text-[#5B6472] text-xs">
              No hay registros de productos aún
            </div>
          ) : (
            topProductos.map((item, idx) => (
              <div
                key={item.nombre}
                className={`flex justify-between items-center py-[9px] ${
                  idx < topProductos.length - 1 ? 'border-b border-dashed border-[#2A333D]' : ''
                }`}
              >
                <div>
                  <div className="text-[12.5px] font-medium text-[#E7EBEF] truncate max-w-[200px]" title={item.nombre}>
                    {item.nombre}
                  </div>
                  <div className="text-[10.5px] text-[#5B6472] mt-[1px]">
                    {item.unidades} und. en stock
                  </div>
                </div>
                <div className="font-mono text-[12.5px] font-semibold text-[#4F9E82]">
                  +{formatCLP(item.ganancia)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
