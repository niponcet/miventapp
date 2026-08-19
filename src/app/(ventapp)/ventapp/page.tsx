import { createClient } from '@/lib/supabase/server';
import { VentAppVentaView } from '@/components/ventapp/VentAppVentaView';
import type { Producto } from '@/types/database';

export const metadata = {
  title: 'Punto de Venta | VentApp',
  description: 'Terminal de venta rápida en terreno',
};

export const dynamic = 'force-dynamic';

export default async function VentAppVentaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from('productos').select('*').order('nombre', { ascending: true });

  if (user?.id) {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[VentApp Venta] Error al cargar productos:', error.message);
  }

  const productos: Producto[] = data ?? [];

  return <VentAppVentaView initialProductos={productos} />;
}
