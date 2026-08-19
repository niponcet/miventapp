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
 * Valida stock, descuenta existencias, registra la venta y su detalle en Supabase.
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

  // 2. Obtener productos de la base de datos para validar stock y precios
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

  // 4. Calcular totales
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

  // 5. Crear registro de venta
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

  // 6. Insertar detalle de venta
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
    console.error('[Checkout] Error en detalle_ventas:', detalleError);
  }

  // 7. Actualizar stock de cada producto y registrar movimiento
  for (const item of items) {
    const product = dbProducts.find((p) => p.id === item.productoId)!;
    const nuevoStock = product.stock_actual - item.cantidad;

    // Actualizar stock
    await supabase
      .from('productos')
      .update({ stock_actual: nuevoStock })
      .eq('id', item.productoId);

    // Registrar movimiento de stock
    await supabase.from('movimientos_stock').insert({
      producto_id: item.productoId,
      user_id: userId,
      cantidad: item.cantidad,
      tipo: 'venta',
    });
  }

  // 8. Revalidar rutas para actualizar el dashboard, inventario y catálogo
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
