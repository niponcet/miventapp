import type { ReactNode } from 'react';

export const metadata = {
  title: 'Catálogo de Productos | MiVentApp',
  description: 'Módulo 1: Catálogo, precios y control de inventario',
};

export default function ProductosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {children}
    </div>
  );
}
