export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      detalle_ventas: {
        Row: {
          cantidad: number
          id: string
          precio_unitario_neto: number
          precio_unitario_venta: number
          producto_id: string
          venta_id: string
        }
        Insert: {
          cantidad: number
          id?: string
          precio_unitario_neto: number
          precio_unitario_venta: number
          producto_id: string
          venta_id: string
        }
        Update: {
          cantidad?: number
          id?: string
          precio_unitario_neto?: number
          precio_unitario_venta?: number
          producto_id?: string
          venta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detalle_ventas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_ventas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_margen_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_ventas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_stock_critico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "detalle_ventas_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_stock: {
        Row: {
          cantidad: number
          created_at: string | null
          id: string
          producto_id: string
          tipo: Database["public"]["Enums"]["movimiento_tipo"]
          user_id: string
        }
        Insert: {
          cantidad: number
          created_at?: string | null
          id?: string
          producto_id: string
          tipo: Database["public"]["Enums"]["movimiento_tipo"]
          user_id?: string
        }
        Update: {
          cantidad?: number
          created_at?: string | null
          id?: string
          producto_id?: string
          tipo?: Database["public"]["Enums"]["movimiento_tipo"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_stock_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_stock_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_margen_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_stock_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_stock_critico"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          canal: Database["public"]["Enums"]["notificacion_canal"]
          created_at: string | null
          error_mensaje: string | null
          estado: Database["public"]["Enums"]["notificacion_estado"]
          id: string
          resumen_id: string
        }
        Insert: {
          canal: Database["public"]["Enums"]["notificacion_canal"]
          created_at?: string | null
          error_mensaje?: string | null
          estado?: Database["public"]["Enums"]["notificacion_estado"]
          id?: string
          resumen_id: string
        }
        Update: {
          canal?: Database["public"]["Enums"]["notificacion_canal"]
          created_at?: string | null
          error_mensaje?: string | null
          estado?: Database["public"]["Enums"]["notificacion_estado"]
          id?: string
          resumen_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_resumen_id_fkey"
            columns: ["resumen_id"]
            isOneToOne: false
            referencedRelation: "resumen_diario"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          precio_neto: number
          precio_venta: number
          stock_actual: number
          stock_minimo: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          precio_neto?: number
          precio_venta?: number
          stock_actual?: number
          stock_minimo?: number
          user_id?: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          precio_neto?: number
          precio_venta?: number
          stock_actual?: number
          stock_minimo?: number
          user_id?: string
        }
        Relationships: []
      }
      resumen_diario: {
        Row: {
          created_at: string | null
          fecha: string
          ganancia_neta: number
          id: string
          total_ventas: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fecha: string
          ganancia_neta?: number
          id?: string
          total_ventas?: number
          user_id?: string
        }
        Update: {
          created_at?: string | null
          fecha?: string
          ganancia_neta?: number
          id?: string
          total_ventas?: number
          user_id?: string
        }
        Relationships: []
      }
      ventas: {
        Row: {
          estado: Database["public"]["Enums"]["venta_estado"]
          fecha_hora: string | null
          ganancia_neta: number
          id: string
          total_venta: number
          user_id: string
        }
        Insert: {
          estado?: Database["public"]["Enums"]["venta_estado"]
          fecha_hora?: string | null
          ganancia_neta?: number
          id?: string
          total_venta?: number
          user_id?: string
        }
        Update: {
          estado?: Database["public"]["Enums"]["venta_estado"]
          fecha_hora?: string | null
          ganancia_neta?: number
          id?: string
          total_venta?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_margen_productos: {
        Row: {
          id: string | null
          margen_clp: number | null
          margen_porcentaje: number | null
          nombre: string | null
          precio_neto: number | null
          precio_venta: number | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          margen_clp?: never
          margen_porcentaje?: never
          nombre?: string | null
          precio_neto?: number | null
          precio_venta?: number | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          margen_clp?: never
          margen_porcentaje?: never
          nombre?: string | null
          precio_neto?: number | null
          precio_venta?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      v_stock_critico: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string | null
          nombre: string | null
          precio_neto: number | null
          precio_venta: number | null
          stock_actual: number | null
          stock_minimo: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string | null
          nombre?: string | null
          precio_neto?: number | null
          precio_venta?: number | null
          stock_actual?: number | null
          stock_minimo?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string | null
          nombre?: string | null
          precio_neto?: number | null
          precio_venta?: number | null
          stock_actual?: number | null
          stock_minimo?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      movimiento_tipo:
        | "inicial"
        | "venta"
        | "compra"
        | "ajuste_positivo"
        | "ajuste_negativo"
      notificacion_canal: "whatsapp" | "gmail"
      notificacion_estado: "pendiente" | "enviado" | "fallido"
      venta_estado: "completada" | "cancelada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Aliases de conveniencia para la aplicación ───────────────────────────────
export type Producto = Database["public"]["Tables"]["productos"]["Row"]
export type ProductoInsert = Database["public"]["Tables"]["productos"]["Insert"]
export type ProductoUpdate = Database["public"]["Tables"]["productos"]["Update"]

export type Venta = Database["public"]["Tables"]["ventas"]["Row"]
export type VentaInsert = Database["public"]["Tables"]["ventas"]["Insert"]
export type VentaUpdate = Database["public"]["Tables"]["ventas"]["Update"]

export type DetalleVenta = Database["public"]["Tables"]["detalle_ventas"]["Row"]
export type MovimientoStock = Database["public"]["Tables"]["movimientos_stock"]["Row"]
export type ResumenDiario = Database["public"]["Tables"]["resumen_diario"]["Row"]
export type Notificacion = Database["public"]["Tables"]["notificaciones"]["Row"]
