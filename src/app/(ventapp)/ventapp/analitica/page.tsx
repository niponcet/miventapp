import { createClient } from '@/lib/supabase/server';
import { VentAppAnaliticaView, type VentaHistorialItem } from '@/components/ventapp/VentAppAnaliticaView';
import { formatDateChip } from '@/components/ventapp/productUtils';

export const metadata = {
  title: 'Analítica & Ventas | VentApp',
  description: 'Métricas de ventas y registro de transacciones en tiempo real',
};

export const dynamic = 'force-dynamic';

export default async function VentAppAnaliticaPage() {
  const supabase = await createClient();

  // 1. Consultar ventas con su detalle y productos asociados ordenadas cronológicamente (más recientes primero)
  const { data: ventasData } = await supabase
    .from('ventas')
    .select(`
      id,
      total_venta,
      ganancia_neta,
      fecha_hora,
      estado,
      detalle_ventas (
        id,
        cantidad,
        precio_unitario_venta,
        productos (
          nombre
        )
      )
    `)
    .order('fecha_hora', { ascending: false });

  // 2. Consultar productos para conteo de stock crítico
  const { data: productosData } = await supabase
    .from('productos')
    .select('stock_actual, stock_minimo');

  const ventas = ventasData ?? [];
  const productos = productosData ?? [];

  // Calcular métricas agregadas
  const totalVendido = ventas.reduce((sum, v) => sum + (v.total_venta || 0), 0);
  const gananciaNeta = ventas.reduce((sum, v) => sum + (v.ganancia_neta || 0), 0);
  const transacciones = ventas.length;
  const stockCritico = productos.filter((p) => p.stock_actual <= p.stock_minimo).length;

  // Fecha actual formateada de forma determinista
  const fechaFormateada = formatDateChip(new Date());

  // Mapear historial de ventas estructurado
  const historialVentas: VentaHistorialItem[] = ventas.map((v) => {
    const rawDetalles = (v as any).detalle_ventas || [];
    const items = rawDetalles.map((d: any) => ({
      nombre: d.productos?.nombre || 'Producto',
      cantidad: d.cantidad || 1,
      subtotal: (d.precio_unitario_venta || 0) * (d.cantidad || 1),
    }));

    return {
      id: v.id,
      total_venta: v.total_venta || 0,
      ganancia_neta: v.ganancia_neta || 0,
      fecha_hora: v.fecha_hora,
      estado: v.estado || 'completada',
      items,
    };
  });

  return (
    <VentAppAnaliticaView
      totalVendido={totalVendido}
      gananciaNeta={gananciaNeta}
      transacciones={transacciones}
      stockCritico={stockCritico}
      fechaFormateada={fechaFormateada}
      historialVentas={historialVentas}
    />
  );
}
