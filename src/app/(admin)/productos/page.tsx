/**
 * Página de Productos — Módulo 1: Catálogo e Inventario.
 *
 * Conectada directamente a la tabla `public.productos` en Supabase.
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

  // Consultar todos los productos ordenados alfabéticamente
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al cargar productos desde Supabase:', error.message);
  }

  const productos: Producto[] = data ?? [];

  return <ProductCatalog initialProductos={productos} />;
}
