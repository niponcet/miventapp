/**
 * Página de Productos — Módulo 1: CRUD de Catálogo e Inventario.
 *
 * Lista de productos con acciones de crear, editar, eliminar
 * y gestión de stock.
 */
import { DataTable } from '@/components/admin';

export const metadata = {
  title: 'Productos | MiVentApp',
  description: 'Gestión de catálogo e inventario de productos',
};

export default function ProductosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Productos
        </h1>
        <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          + Nuevo Producto
        </button>
      </div>

      <DataTable />
    </div>
  );
}
