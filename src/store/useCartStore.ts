/**
 * Store del carrito de compras en tiempo real (Zustand).
 *
 * Gestiona:
 *   - Agregar / quitar productos con límite de stock_actual
 *   - Actualizar cantidades y restar unidades
 *   - Calcular totales y subtotales
 *   - Limpiar carrito al procesar una venta
 */
import { create } from 'zustand';
import type { Producto } from '@/types/database';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  descuento: number;

  // Acciones
  addItem: (producto: Producto) => { success: boolean; message?: string };
  removeOne: (productoId: string) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  setDescuento: (descuento: number) => void;
  clearCart: () => void;

  // Selectores y Helpers
  getItemQuantity: (productoId: string) => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  descuento: 0,

  addItem: (producto) => {
    const state = get();
    const existing = state.items.find((i) => i.producto.id === producto.id);
    const currentQty = existing ? existing.cantidad : 0;

    if (producto.stock_actual <= 0) {
      return { success: false, message: `"${producto.nombre}" se encuentra agotado.` };
    }

    if (currentQty >= producto.stock_actual) {
      return {
        success: false,
        message: `Stock máximo alcanzado para "${producto.nombre}" (${producto.stock_actual} unidades).`,
      };
    }

    if (existing) {
      set({
        items: state.items.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        ),
      });
    } else {
      set({
        items: [...state.items, { producto, cantidad: 1 }],
      });
    }

    return { success: true };
  },

  removeOne: (productoId) => {
    const state = get();
    const existing = state.items.find((i) => i.producto.id === productoId);
    if (!existing) return;

    if (existing.cantidad <= 1) {
      set({
        items: state.items.filter((i) => i.producto.id !== productoId),
      });
    } else {
      set({
        items: state.items.map((i) =>
          i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i
        ),
      });
    }
  },

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

  getItemQuantity: (productoId) => {
    const item = get().items.find((i) => i.producto.id === productoId);
    return item ? item.cantidad : 0;
  },

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.producto.precio_venta * i.cantidad, 0),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - get().descuento);
  },

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.cantidad, 0),
}));
