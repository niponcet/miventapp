import { createClient } from '@/lib/supabase/server';
import { VentAppAnaliticaView } from '@/components/ventapp/VentAppAnaliticaView';

export const metadata = {
  title: 'Analítica | VentApp',
  description: 'Métricas de ventas y rendimiento en tiempo real',
};

export const dynamic = 'force-dynamic';

export default async function VentAppAnaliticaPage() {
  const supabase = await createClient();

  // 1. Consultar ventas
  const { data: ventasData } = await supabase
    .from('ventas')
    .select('total_venta, ganancia_neta');

  // 2. Consultar productos para stock crítico y top destacados
  const { data: productosData } = await supabase
    .from('productos')
    .select('nombre, precio_venta, precio_neto, stock_actual, stock_minimo')
    .order('stock_actual', { ascending: false });

  const ventas = ventasData ?? [];
  const productos = productosData ?? [];

  // Calcular métricas
  const totalVendido = ventas.reduce((sum, v) => sum + (v.total_venta || 0), 0);
  const gananciaNeta = ventas.reduce((sum, v) => sum + (v.ganancia_neta || 0), 0);
  const transacciones = ventas.length;
  const stockCritico = productos.filter((p) => p.stock_actual <= p.stock_minimo).length;

  // Fecha actual formateada en español
  const fechaFormateada = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  // Top 4 productos con mayor stock / margen potencial
  const topProductos = productos.slice(0, 4).map((p) => ({
    nombre: p.nombre,
    unidades: p.stock_actual,
    ganancia: (p.precio_venta - p.precio_neto) * p.stock_actual,
  }));

  return (
    <VentAppAnaliticaView
      totalVendido={totalVendido}
      gananciaNeta={gananciaNeta}
      transacciones={transacciones}
      stockCritico={stockCritico}
      fechaFormateada={fechaFormateada}
      topProductos={topProductos}
    />
  );
}
