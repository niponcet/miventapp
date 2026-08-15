/**
 * Página principal de VentApp — Módulo 2: Interfaz de Ventas.
 *
 * Vista de alto contraste con cuadrícula de productos y carrito lateral.
 * Optimizada para teclado numérico y uso en pantalla táctil.
 */
'use client';

import { ProductGrid, Cart } from '@/components/ventapp';

export default function VentAppPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Cuadrícula de productos — 2/3 del ancho */}
      <section className="flex-1 overflow-y-auto p-4">
        <ProductGrid />
      </section>

      {/* Carrito lateral — 1/3 del ancho */}
      <aside className="w-80 shrink-0 border-l border-zinc-800 bg-zinc-900 lg:w-96">
        <Cart />
      </aside>
    </div>
  );
}
