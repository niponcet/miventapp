'use client';

import { useState } from 'react';
import type { ResumenDiario } from '@/types/database';
import { formatCLP } from '@/components/ventapp/productUtils';
import styles from '@/app/(admin)/dashboard/dashboard.module.css';

interface CierreCajaViewProps {
  totalVentas: number;
  gananciaNeta: number;
  transacciones: number;
  stockCritico: number;
  historialCierres: ResumenDiario[];
}

export function CierreCajaView({
  totalVentas,
  gananciaNeta,
  transacciones,
  stockCritico,
  historialCierres,
}: CierreCajaViewProps) {
  const [cierres, setCierres] = useState<ResumenDiario[]>(historialCierres);
  const [isClosing, setIsClosing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const margen = totalVentas > 0 ? ((gananciaNeta / totalVentas) * 100).toFixed(1) : '0';
  const todayFormatted = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleEjecutarCierre = async () => {
    setIsClosing(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/cierre-jornada', {
        method: 'POST',
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Error al procesar cierre');
      }

      if (json.data) {
        setCierres((prev) => [json.data, ...prev.filter((c) => c.id !== json.data.id)]);
      }

      setFeedback({
        type: 'success',
        message: '¡Cierre de jornada generado y registrado con éxito! Respaldo procesado.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al generar el cierre de jornada',
      });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto space-y-6">
      {/* ─── TOPBAR ─── */}
      <div className={styles.topbar}>
        <div>
          <h1>Módulo 4: Cierre de Caja y Jornada</h1>
          <div className={styles.dateLine}>Balance y cuadratura · {todayFormatted}</div>
        </div>
        <div className={styles.topbarActions}>
          <button
            onClick={handleEjecutarCierre}
            disabled={isClosing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isClosing ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generando Cierre...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-4 h-4">
                  <path d="M20.5 11.5a8.5 8.5 0 1 1-3.3-6.7" />
                  <path d="M21 4v5h-5" />
                </svg>
                Cerrar Caja del Día
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-current opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* ─── KPI CARDS ─── */}
      <div className={styles.kpiRow}>
        <div className={`${styles.kpiCard} ${styles.cAccent}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total vendido hoy</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
                <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>{formatCLP(totalVentas)}</div>
          <div className={styles.kpiSub}>{transacciones} transacciones registradas</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.cProfit}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Ganancia neta</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>{formatCLP(gananciaNeta)}</div>
          <div className={styles.kpiSub}>Margen neto del {margen}%</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.cAccent}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Canales de notificación</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>WhatsApp + Mail</div>
          <div className={styles.kpiSub}>Respaldo automático activado</div>
        </div>

        <div className={`${styles.kpiCard} ${stockCritico > 0 ? styles.cWarn : styles.cProfit}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Stock crítico</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>{stockCritico}</div>
          <div className={styles.kpiSub}>Alertas en el reporte de cierre</div>
        </div>
      </div>

      {/* ─── HISTORIAL DE CIERRES ─── */}
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <div className={styles.panelTitle}>
            Historial de cierres de caja <span className={styles.panelCount}>· {cierres.length} registros</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          {cierres.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No hay cierres de caja generados previamente. Haz click en &quot;Cerrar Caja del Día&quot; para registrar el primero.
            </div>
          ) : (
            <table className={styles.ledgerTable}>
              <thead>
                <tr>
                  <th>Fecha de Cierre</th>
                  <th className={styles.num}>Total Ventas</th>
                  <th className={styles.num}>Ganancia Neta</th>
                  <th className={styles.num}>Margen</th>
                  <th className={styles.num}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cierres.map((c) => {
                  const margenCierre = c.total_ventas > 0 ? Math.round((c.ganancia_neta / c.total_ventas) * 100) : 0;

                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                        {c.fecha}
                      </td>
                      <td className={styles.num} style={{ fontWeight: 600 }}>
                        {formatCLP(c.total_ventas)}
                      </td>
                      <td className={`${styles.num} ${styles.profitCell}`}>
                        {formatCLP(c.ganancia_neta)}
                      </td>
                      <td className={styles.num}>
                        <span className="font-mono text-zinc-400">{margenCierre}%</span>
                      </td>
                      <td className={styles.num}>
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                          Completado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
