/**
 * Tipos TypeScript que reflejan el esquema de la base de datos en Supabase.
 *
 * Convención:
 *   - Cada tabla tiene un tipo `Row` (lectura), `Insert` (creación) y `Update` (edición parcial).
 *   - `Database` es el tipo raíz que Supabase usa para tipado end-to-end.
 *
 * Para regenerar automáticamente estos tipos:
 *   npx supabase gen types typescript --project-id <ID> > src/types/database.ts
 */

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Marca campos opcionales para inserciones (campos con default en la BD). */
type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ─── Tablas ─────────────────────────────────────────────────────────────────────

/** Producto del catálogo / inventario (Módulo 1) */
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  costo: number;
  stock: number;
  categoria_id: string | null;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductoInsert = WithOptional<Producto, 'id' | 'activo' | 'created_at' | 'updated_at'>;
export type ProductoUpdate = Partial<Omit<Producto, 'id' | 'created_at'>>;

/** Categoría de productos */
export interface Categoria {
  id: string;
  nombre: string;
  color: string | null;
  orden: number;
  created_at: string;
}

export type CategoriaInsert = WithOptional<Categoria, 'id' | 'orden' | 'created_at'>;
export type CategoriaUpdate = Partial<Omit<Categoria, 'id' | 'created_at'>>;

/** Venta registrada en VentApp (Módulo 2) */
export interface Venta {
  id: string;
  total: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
  descuento: number;
  notas: string | null;
  created_at: string;
}

export type VentaInsert = WithOptional<Venta, 'id' | 'descuento' | 'notas' | 'created_at'>;
export type VentaUpdate = Partial<Omit<Venta, 'id' | 'created_at'>>;

/** Detalle de línea de una venta */
export interface VentaDetalle {
  id: string;
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export type VentaDetalleInsert = WithOptional<VentaDetalle, 'id'>;

/** Cierre de jornada (Módulo 4) */
export interface CierreJornada {
  id: string;
  fecha: string;
  total_ventas: number;
  total_transacciones: number;
  resumen: Record<string, unknown> | null;
  enviado_whatsapp: boolean;
  enviado_email: boolean;
  created_at: string;
}

export type CierreJornadaInsert = WithOptional<
  CierreJornada,
  'id' | 'enviado_whatsapp' | 'enviado_email' | 'created_at'
>;

// ─── Database (tipo raíz para Supabase) ─────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      productos: {
        Row: Producto;
        Insert: ProductoInsert;
        Update: ProductoUpdate;
      };
      categorias: {
        Row: Categoria;
        Insert: CategoriaInsert;
        Update: CategoriaUpdate;
      };
      ventas: {
        Row: Venta;
        Insert: VentaInsert;
        Update: VentaUpdate;
      };
      venta_detalles: {
        Row: VentaDetalle;
        Insert: VentaDetalleInsert;
        Update: Partial<VentaDetalle>;
      };
      cierre_jornadas: {
        Row: CierreJornada;
        Insert: CierreJornadaInsert;
        Update: Partial<CierreJornada>;
      };
    };
  };
}
