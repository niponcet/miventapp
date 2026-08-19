/**
 * Página de Productos — Módulo 1: Catálogo e Inventario.
 *
 * Conectada directamente a la tabla `public.productos` en Supabase
 * con aislamiento por usuario autenticado (Multi-tenant).
 */
import { createClient } from '@/lib/supabase/server';
import { ProductCatalog } from '@/components/admin';
import type { Producto } from '@/types/database';

export const metadata = {
  title: 'Catálogo de Productos | MiVentApp',
  description: 'Gestión de catálogo, precios y control de inventario en tiempo real',
};

// Revalidar cada petición para mantener datos frescos
export const dynamic = 'force-dynamic';

export default async function ProductosPage() {
  const supabase = await createClient();

  // 1. Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Consultar únicamente los productos pertenecientes al usuario actual
  let query = supabase.from('productos').select('*').order('nombre', { ascending: true });

  if (user?.id) {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error al cargar productos desde Supabase:', error.message);
  }

  const productos: Producto[] = data ?? [];

  return <ProductCatalog initialProductos={productos} />;
}
