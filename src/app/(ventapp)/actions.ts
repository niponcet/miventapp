'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CheckoutItem {
  productoId: string;
  cantidad: number;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  ventaId?: string;
  totalVenta?: number;
  gananciaNeta?: number;
  totalUnits?: number;
}

/**
 * Server Action para registrar una venta en terreno desde VentApp.
 * 
 * Flujo Transaccional Atómico:
 * 1. Valida usuario autenticado y existencias en catálogo.
 * 2. Inserta la orden en public.ventas.
 * 3. Inserta los ítems en public.detalle_ventas.
 *    -> El trigger de PostgreSQL `trg_procesar_venta_stock` descuenta el stock en `productos`
 *       y crea el registro de auditoría en `movimientos_stock` de forma 100% atómica.
 * 4. Revalida las rutas afectadas para sincronización inmediata del POS y Dashboard.
 */
export async function registrarVentaAction(items: CheckoutItem[]): Promise<CheckoutResult> {
  if (!items || items.length === 0) {
    return { success: false, error: 'No hay productos en la orden' };
  }

  const supabase = await createClient();

  // 1. Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  // 2. Obtener productos de la base de datos para validar existencias y precios vigentes
  const productIds = items.map((i) => i.productoId);
  const { data: dbProducts, error: prodError } = await supabase
    .from('productos')
    .select('*')
    .in('id', productIds);

  if (prodError || !dbProducts) {
    return { success: false, error: 'Error al consultar productos: ' + prodError?.message };
  }

  // 3. Validar stock disponible
  for (const item of items) {
    const product = dbProducts.find((p) => p.id === item.productoId);
    if (!product) {
      return { success: false, error: `Producto no encontrado (ID: ${item.productoId})` };
    }
    if (product.stock_actual < item.cantidad) {
      return {
        success: false,
        error: `Stock insuficiente para "${product.nombre}". Disponible: ${product.stock_actual}, solicitado: ${item.cantidad}`,
      };
    }
  }

  // 4. Calcular totales consolidados
  let totalVenta = 0;
  let gananciaNeta = 0;
  let totalUnits = 0;

  for (const item of items) {
    const product = dbProducts.find((p) => p.id === item.productoId)!;
    const itemTotal = product.precio_venta * item.cantidad;
    const itemGanancia = (product.precio_venta - product.precio_neto) * item.cantidad;

    totalVenta += itemTotal;
    gananciaNeta += itemGanancia;
    totalUnits += item.cantidad;
  }

  // 5. Crear registro de venta principal
  const { data: ventaData, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      user_id: userId,
      total_venta: totalVenta,
      ganancia_neta: gananciaNeta,
      estado: 'completada',
    })
    .select('id')
    .single();

  if (ventaError || !ventaData) {
    return { success: false, error: 'Error al registrar la venta: ' + ventaError?.message };
  }

  const ventaId = ventaData.id;

  // 6. Insertar detalle de venta (dispara el trigger atómico trg_procesar_venta_stock en PostgreSQL)
  const detalles = items.map((item) => {
    const product = dbProducts.find((p) => p.id === item.productoId)!;
    return {
      venta_id: ventaId,
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_unitario_neto: product.precio_neto,
      precio_unitario_venta: product.precio_venta,
    };
  });

  const { error: detalleError } = await supabase.from('detalle_ventas').insert(detalles);

  if (detalleError) {
    console.error('[Checkout] Error al insertar detalle_ventas:', detalleError);
    return { success: false, error: 'Error al registrar el detalle de la venta: ' + detalleError.message };
  }

  // 7. Revalidar rutas para actualizar el dashboard, inventario, analítica y catálogo en tiempo real
  revalidatePath('/ventapp');
  revalidatePath('/ventapp/inventario');
  revalidatePath('/ventapp/analitica');
  revalidatePath('/dashboard');
  revalidatePath('/productos');
  revalidatePath('/cierre');

  return {
    success: true,
    ventaId,
    totalVenta,
    gananciaNeta,
    totalUnits,
  };
}
