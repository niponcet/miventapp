/**
 * Página del Dashboard — Módulo 3: Analítica y Datepicker.
 *
 * Muestra métricas clave, gráficos de ventas y filtros por fecha.
 */
import { Chart, DatePicker } from '@/components/admin';

export const metadata = {
  title: 'Dashboard | MiVentApp',
  description: 'Analítica de ventas e inventario en tiempo real',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
        <DatePicker />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Ventas Hoy', 'Transacciones', 'Ticket Promedio', 'Productos Activos'].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                —
              </p>
            </div>
          )
        )}
      </div>

      {/* Gráfico */}
      <Chart />
    </div>
  );
}
