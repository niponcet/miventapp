import type { ReactNode } from 'react';
import { MobileTabBar } from '@/components/ventapp';

export const metadata = {
  title: 'VentApp | PWA Móvil',
  description: 'Punto de venta y gestión móvil en terreno',
  manifest: '/manifest.json',
};

export default function VentAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-[#0A0E12] text-[#E7EBEF] flex justify-center items-start sm:py-6 sm:px-4">
      {/* Shell responsivo: Pantalla completa en móvil, marco centrado en tablet/desktop */}
      <div className="w-full sm:max-w-[420px] min-h-screen sm:min-h-[840px] sm:max-h-[92vh] sm:rounded-[36px] sm:border sm:border-[#232B34] bg-[#0F1419] flex flex-col relative pb-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:shadow-2xl overflow-y-auto overflow-x-hidden">
        {children}
        <MobileTabBar />
      </div>
    </div>
  );
}
