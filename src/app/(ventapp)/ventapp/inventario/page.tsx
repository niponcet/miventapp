import { createClient } from '@/lib/supabase/server';
import { VentAppInventarioView } from '@/components/ventapp/VentAppInventarioView';
import type { Producto } from '@/types/database';

export const metadata = {
  title: 'Inventario | VentApp',
  description: 'Consulta de stock y catálogo de productos en tiempo real',
};

export const dynamic = 'force-dynamic';

export default async function VentAppInventarioPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('[VentApp Inventario] Error al cargar productos:', error.message);
  }

  const productos: Producto[] = data ?? [];

  return <VentAppInventarioView initialProductos={productos} />;
}
