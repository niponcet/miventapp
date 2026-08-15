/**
 * Store del carrito de compras en tiempo real (Zustand).
 *
 * Gestiona:
 *   - Agregar / quitar productos
 *   - Actualizar cantidades
 *   - Calcular totales y descuentos
 *   - Limpiar carrito al cerrar una venta
 */
import { create } from 'zustand';
import type { Producto } from '@/types/database';

// ─── Tipos ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  descuento: number;

  // Acciones
  addItem: (producto: Producto) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  setDescuento: (descuento: number) => void;
  clearCart: () => void;

  // Selectores derivados
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  descuento: 0,

  addItem: (producto) =>
    set((state) => {
      const existing = state.items.find((i) => i.producto.id === producto.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.producto.id === producto.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { producto, cantidad: 1 }] };
    }),

  removeItem: (productoId) =>
    set((state) => ({
      items: state.items.filter((i) => i.producto.id !== productoId),
    })),

  updateQuantity: (productoId, cantidad) =>
    set((state) => {
      if (cantidad <= 0) {
        return { items: state.items.filter((i) => i.producto.id !== productoId) };
      }
      return {
        items: state.items.map((i) =>
          i.producto.id === productoId ? { ...i, cantidad } : i
        ),
      };
    }),

  setDescuento: (descuento) => set({ descuento }),

  clearCart: () => set({ items: [], descuento: 0 }),

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.producto.precio_venta * i.cantidad, 0),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - get().descuento);
  },

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.cantidad, 0),
}));
