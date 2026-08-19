/**
 * Página del Dashboard — Módulo 3: Analítica y Datepicker.
 *
 * Implementación fiel al diseño de referencia (dashboard.html).
 * Los datos están hardcodeados para validar el diseño,
 * listos para conectar a Supabase.
 */
import Link from 'next/link';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Analítica | MiVentApp',
  description: 'Analítica de ventas e inventario en tiempo real',
};

/* ─── Datos mock (se reemplazarán por queries a Supabase) ──────────────────── */

const kpis = [
  {
    label: 'Total vendido hoy',
    value: '$486.500',
    sub: <><span className={styles.deltaUp}>▲ 12,4%</span> vs. ayer</>,
    color: 'cAccent' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
      </svg>
    ),
  },
  {
    label: 'Ganancia neta',
    value: '$168.900',
    sub: 'Margen promedio 34,7%',
    color: 'cProfit' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Transacciones',
    value: '37',
    sub: 'Ticket promedio $13.148',
    color: 'cAccent' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    label: 'Productos en stock crítico',
    value: '4',
    sub: 'Revisar antes del cierre',
    color: 'cWarn' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  },
];

const productosVendidos = [
  { nombre: 'Aceite de motor 20W-50', categoria: 'Lubricantes', cantidad: 12, venta: '$96.000', ganancia: '$28.800', dotColor: 'var(--accent)' },
  { nombre: 'Filtro de aire universal', categoria: 'Repuestos', cantidad: 8, venta: '$64.000', ganancia: '$22.400', dotColor: 'var(--profit)' },
  { nombre: 'Pastillas de freno delanteras', categoria: 'Frenos', cantidad: 5, venta: '$125.000', ganancia: '$41.250', dotColor: 'var(--warn)' },
  { nombre: 'Bujía de encendido NGK', categoria: 'Encendido', cantidad: 20, venta: '$70.000', ganancia: '$24.000', dotColor: 'var(--accent)' },
  { nombre: 'Correa de distribución', categoria: 'Motor', cantidad: 3, venta: '$87.000', ganancia: '$26.100', dotColor: 'var(--danger)' },
  { nombre: 'Líquido refrigerante 1L', categoria: 'Fluidos', cantidad: 9, venta: '$44.500', ganancia: '$16.020', dotColor: 'var(--profit)' },
];

const stockCritico = [
  { nombre: 'Correa de distribución', categoria: 'Motor', stock: 2, nivel: 'critical' as const },
  { nombre: 'Pastillas de freno del.', categoria: 'Frenos', stock: 3, nivel: 'critical' as const },
  { nombre: 'Filtro de aceite', categoria: 'Lubricantes', stock: 6, nivel: 'low' as const },
];

/* ─── Componente ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      {/* ─── TOPBAR ─── */}
      <div className={styles.topbar}>
        <div>
          <h1>Analítica de desempeño</h1>
          <div className={styles.dateLine}>Jornada del {dateFormatted}</div>
        </div>
        <div className={styles.topbarActions}>
          <div className={styles.datepicker}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {today.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <Link href="/ventapp" className={styles.btnPrimary}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nueva venta
          </Link>
        </div>
      </div>

      {/* ─── KPI ROW ─── */}
      <div className={styles.kpiRow}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${styles.kpiCard} ${styles[kpi.color]}`}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <div className={styles.kpiIcon}>{kpi.icon}</div>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiSub}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── CONTENT GRID ─── */}
      <div className={styles.contentGrid}>
        {/* LEFT: Tabla de productos vendidos */}
        <div className={`${styles.col} ${styles.colLeft}`}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <div className={styles.panelTitle}>
                Detalle de productos vendidos <span className={styles.panelCount}>· jornada actual</span>
              </div>
              <span className={styles.panelLink}>Ver todo</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.ledgerTable}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className={styles.num}>Cant.</th>
                    <th className={styles.num}>P. venta</th>
                    <th className={styles.num}>Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {productosVendidos.map((p) => (
                    <tr key={p.nombre}>
                      <td>
                        <div className={styles.prodCell}>
                          <span className={styles.prodDot} style={{ background: p.dotColor }} />
                          <div>
                            <div className={styles.prodName}>{p.nombre}</div>
                            <div className={styles.prodCat}>{p.categoria}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.num}>
                        <span className={styles.qtyBadge}>{p.cantidad}</span>
                      </td>
                      <td className={styles.num}>{p.venta}</td>
                      <td className={`${styles.num} ${styles.profitCell}`}>{p.ganancia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Quick actions + Stock crítico + Cierre */}
        <div className={styles.col}>
          {/* Quick Actions */}
          <div className={styles.panel} style={{ paddingBottom: 14 }}>
            <div className={styles.panelHead}>
              <div className={styles.panelTitle}>Acción rápida</div>
            </div>
            <div className={styles.quickActions}>
              <Link href="/ventapp" className={`${styles.qaItem} ${styles.qaSale}`}>
                <div className={styles.qaIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M6 10h4M6 14h2" />
                  </svg>
                </div>
                <div>
                  <div className={styles.qaTitle}>Registrar venta</div>
                  <div className={styles.qaDesc}>Abrir punto de venta</div>
                </div>
              </Link>
              <Link href="/productos?crear=true" className={`${styles.qaItem} ${styles.qaProduct}`}>
                <div className={styles.qaIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div>
                  <div className={styles.qaTitle}>Registrar producto</div>
                  <div className={styles.qaDesc}>Agregar al catálogo e inventario</div>
                </div>
              </Link>
              <Link href="/productos" className={`${styles.qaItem} ${styles.qaStock}`}>
                <div className={styles.qaIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 7l9-4 9 4-9 4-9-4z" />
                    <path d="M3 7v10l9 4 9-4V7" />
                  </svg>
                </div>
                <div>
                  <div className={styles.qaTitle}>Ajustar inventario</div>
                  <div className={styles.qaDesc}>Editar stock de productos</div>
                </div>
              </Link>
              <div className={`${styles.qaItem} ${styles.qaClose}`}>
                <div className={styles.qaIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20.5 11.5a8.5 8.5 0 1 1-3.3-6.7" />
                    <path d="M21 4v5h-5" />
                  </svg>
                </div>
                <div>
                  <div className={styles.qaTitle}>Cerrar caja del día</div>
                  <div className={styles.qaDesc}>Genera y envía el resumen</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stock crítico */}
          <div className={styles.panel} style={{ flexShrink: 0, paddingBottom: 6 }}>
            <div className={styles.panelHead}>
              <div className={styles.panelTitle}>
                Stock crítico <span className={styles.panelCount}>· {stockCritico.length} productos</span>
              </div>
              <span className={styles.panelLink}>Ver todo</span>
            </div>
            <div>
              {stockCritico.map((item) => (
                <div key={item.nombre} className={styles.stockItem}>
                  <div>
                    <div className={styles.stockName}>{item.nombre}</div>
                    <div className={styles.stockCategory}>{item.categoria}</div>
                  </div>
                  <span className={`${styles.stockPill} ${styles[item.nivel]}`}>
                    {item.stock} UND.
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cierre automático */}
          <div className={styles.closingPanel}>
            <div className={styles.closingHead}>
              <span className={styles.closingDot} />
              <span className={styles.closingTitle}>Cierre automático · WhatsApp</span>
            </div>
            <div className={styles.closingDesc}>
              Al finalizar la jornada se enviará un resumen a WhatsApp con respaldo por Gmail.
            </div>
            <div className={styles.closingRow}>
              <span>Total del día</span>
              <span className={styles.closingVal}>$486.500</span>
            </div>
            <div className={styles.closingRow}>
              <span>Ganancia neta</span>
              <span className={styles.closingVal} style={{ color: 'var(--profit)' }}>$168.900</span>
            </div>
            <div className={styles.closingRow}>
              <span>Alertas de stock</span>
              <span className={styles.closingVal} style={{ color: 'var(--warn)' }}>4 productos</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
