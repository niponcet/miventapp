import { createClient } from '@/lib/supabase/server';
import { CierreCajaView } from '@/components/admin/CierreCajaView';
import type { ResumenDiario } from '@/types/database';

export const metadata = {
  title: 'Cierre de Caja | MiVentApp',
  description: 'Módulo 4: Cuadratura de caja, balance del día y notificaciones',
};

export const dynamic = 'force-dynamic';

export default async function CierrePage() {
  const supabase = await createClient();

  // 1. Consultar ventas
  const { data: ventasData } = await supabase
    .from('ventas')
    .select('total_venta, ganancia_neta');

  // 2. Consultar productos para alertas de stock
  const { data: productosData } = await supabase
    .from('productos')
    .select('stock_actual, stock_minimo');

  // 3. Consultar historial de cierres previos
  const { data: resumenData } = await supabase
    .from('resumen_diario')
    .select('*')
    .order('fecha', { ascending: false });

  const ventas = ventasData ?? [];
  const productos = productosData ?? [];
  const historialCierres: ResumenDiario[] = resumenData ?? [];

  const totalVentas = ventas.reduce((sum, v) => sum + (v.total_venta || 0), 0);
  const gananciaNeta = ventas.reduce((sum, v) => sum + (v.ganancia_neta || 0), 0);
  const transacciones = ventas.length;
  const stockCritico = productos.filter((p) => p.stock_actual <= p.stock_minimo).length;

  return (
    <CierreCajaView
      totalVentas={totalVentas}
      gananciaNeta={gananciaNeta}
      transacciones={transacciones}
      stockCritico={stockCritico}
      historialCierres={historialCierres}
    />
  );
}
