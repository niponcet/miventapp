import type { ReactNode } from 'react';
import { MobileTabBar } from '@/components/ventapp';

export const metadata = {
  title: 'VentApp | PWA Móvil',
  description: 'Punto de venta y gestión móvil en terreno',
  manifest: '/manifest.json',
};

export default function VentAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-dvh bg-[#0A0E12] text-[#E7EBEF] flex justify-center items-start sm:py-6 sm:px-4">
      {/* Shell responsivo: Marco fijo con viewport controlado */}
      <div className="w-full sm:max-w-[420px] h-dvh sm:h-[840px] sm:max-h-[92vh] sm:rounded-[36px] sm:border sm:border-[#232B34] bg-[#0F1419] flex flex-col relative sm:shadow-2xl overflow-hidden">
        {/* Contenedor de contenido con scroll independiente */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </div>

        {/* Barra de navegación flotante fija (anclada permanentemente al marco) */}
        <MobileTabBar />
      </div>
    </div>
  );
}
