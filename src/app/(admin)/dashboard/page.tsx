import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from './dashboard.module.css';
import { formatCLP, getProductCategory } from '@/components/ventapp/productUtils';

export const metadata = {
  title: 'Analítica | MiVentApp',
  description: 'Analítica de ventas e inventario en tiempo real',
};

// Revalidar en cada petición para reflejar ventas de inmediato
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Consultar ventas y métricas
  const { data: ventasData } = await supabase
    .from('ventas')
    .select('id, total_venta, ganancia_neta, fecha_hora')
    .order('fecha_hora', { ascending: false });

  // 2. Consultar productos para stock crítico
  const { data: productosData } = await supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  // 3. Consultar detalle de ventas para la tabla de productos vendidos
  const { data: detalleData } = await supabase
    .from('detalle_ventas')
    .select(`
      cantidad,
      precio_unitario_venta,
      precio_unitario_neto,
      producto_id,
      productos (
        nombre,
        descripcion
      )
    `);

  const ventas = ventasData ?? [];
  const productos = productosData ?? [];
  const detalles = detalleData ?? [];

  // Calcular KPIs
  const totalVendido = ventas.reduce((sum, v) => sum + (v.total_venta || 0), 0);
  const gananciaNeta = ventas.reduce((sum, v) => sum + (v.ganancia_neta || 0), 0);
  const transacciones = ventas.length;
  const margenPromedio = totalVendido > 0 ? ((gananciaNeta / totalVendido) * 100).toFixed(1) : '0';
  const ticketPromedio = transacciones > 0 ? Math.round(totalVendido / transacciones) : 0;

  // Filtrar productos en stock crítico
  const productosCriticos = productos.filter((p) => p.stock_actual <= p.stock_minimo);

  // Agrupar ventas por producto para la tabla de productos vendidos
  const productosVendidosMap: {
    [key: string]: {
      nombre: string;
      categoria: string;
      cantidad: number;
      ventaTotal: number;
      gananciaTotal: number;
      dotColor: string;
    };
  } = {};

  const dotColors = ['var(--accent)', 'var(--profit)', 'var(--warn)', 'var(--danger)'];

  detalles.forEach((d, idx) => {
    const prodInfo = (d as any).productos;
    const nombre = prodInfo?.nombre || 'Producto';
    const categoria = getProductCategory(nombre, prodInfo?.descripcion);
    const cant = d.cantidad || 0;
    const venta = (d.precio_unitario_venta || 0) * cant;
    const ganancia = ((d.precio_unitario_venta || 0) - (d.precio_unitario_neto || 0)) * cant;

    if (!productosVendidosMap[nombre]) {
      productosVendidosMap[nombre] = {
        nombre,
        categoria,
        cantidad: 0,
        ventaTotal: 0,
        gananciaTotal: 0,
        dotColor: dotColors[Object.keys(productosVendidosMap).length % dotColors.length],
      };
    }

    productosVendidosMap[nombre].cantidad += cant;
    productosVendidosMap[nombre].ventaTotal += venta;
    productosVendidosMap[nombre].gananciaTotal += ganancia;
  });

  const productosVendidosList = Object.values(productosVendidosMap).sort(
    (a, b) => b.cantidad - a.cantidad
  );

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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
    const kpis = [
      {
        label: 'Total vendido hoy',
        value: formatCLP(totalVendido),
        sub: <><span className={styles.deltaUp}>● {transacciones}</span> ventas registradas</>,
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
        value: formatCLP(gananciaNeta),
        sub: `Margen promedio ${margenPromedio}%`,
        color: 'cProfit' as const,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },
      {
        label: 'Transacciones',
        value: `${transacciones}`,
        sub: `Ticket promedio ${formatCLP(ticketPromedio)}`,
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
        value: `${productosCriticos.length}`,
        sub: productosCriticos.length === 0 ? 'Niveles óptimos' : 'Revisar antes del cierre',
        color: productosCriticos.length > 0 ? ('cWarn' as const) : ('cProfit' as const),
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        ),
      },
    ];

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
          {/* LEFT: Tabla de productos vendidos conectada a detalle_ventas */}
          <div className={`${styles.col} ${styles.colLeft}`}>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div className={styles.panelTitle}>
                  Detalle de productos vendidos <span className={styles.panelCount}>· jornada actual</span>
                </div>
                <Link href="/productos" className={styles.panelLink}>
                  Ver catálogo
                </Link>
              </div>
              <div className={styles.tableWrap}>
                {productosVendidosList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                    <svg className="w-12 h-12 mb-3 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <circle cx="9" cy="20" r="1.4" />
                      <circle cx="17" cy="20" r="1.4" />
                      <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
                    </svg>
                    <p className="text-sm font-medium text-zinc-400">Aún no hay ventas registradas en esta jornada</p>
                    <p className="text-xs text-zinc-600 mt-1">Usa la aplicación móvil o el botón &quot;Nueva venta&quot; para registrar ventas</p>
                    <Link
                      href="/ventapp"
                      className="mt-4 px-4 py-2 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-semibold hover:bg-indigo-600/30"
                    >
                      Abrir VentApp POS →
                    </Link>
                  </div>
                ) : (
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
                      {productosVendidosList.map((p) => (
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
                          <td className={styles.num}>{formatCLP(p.ventaTotal)}</td>
                          <td className={`${styles.num} ${styles.profitCell}`}>{formatCLP(p.gananciaTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                <Link href="/productos" className={`${styles.qaItem} ${styles.qaProduct}`}>
                  <div className={styles.qaIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.qaTitle}>Catálogo de productos</div>
                    <div className={styles.qaDesc}>Gestionar precios y stock</div>
                  </div>
                </Link>
                <Link href="/cierre" className={`${styles.qaItem} ${styles.qaClose}`}>
                  <div className={styles.qaIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M20.5 11.5a8.5 8.5 0 1 1-3.3-6.7" />
                      <path d="M21 4v5h-5" />
                    </svg>
                  </div>
                  <div>
                    <div className={styles.qaTitle}>Cerrar caja del día</div>
                    <div className={styles.qaDesc}>Genera y envía el resumen diario</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Stock crítico conectado a Supabase */}
            <div className={styles.panel} style={{ flexShrink: 0, paddingBottom: 6 }}>
              <div className={styles.panelHead}>
                <div className={styles.panelTitle}>
                  Stock crítico <span className={styles.panelCount}>· {productosCriticos.length} productos</span>
                </div>
                <Link href="/productos" className={styles.panelLink}>
                  Ver todo
                </Link>
              </div>
              <div>
                {productosCriticos.length === 0 ? (
                  <div className="py-4 text-center text-xs text-zinc-500">
                    ✓ Todos los productos tienen existencias óptimas
                  </div>
                ) : (
                  productosCriticos.slice(0, 3).map((item) => (
                    <div key={item.id} className={styles.stockItem}>
                      <div>
                        <div className={styles.stockName}>{item.nombre}</div>
                        <div className={styles.stockCategory}>
                          {getProductCategory(item.nombre, item.descripcion)}
                        </div>
                      </div>
                      <span className={`${styles.stockPill} ${styles.critical}`}>
                        {item.stock_actual} UND.
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cierre automático con valores reales */}
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
                <span className={styles.closingVal}>{formatCLP(totalVendido)}</span>
              </div>
              <div className={styles.closingRow}>
                <span>Ganancia neta</span>
                <span className={styles.closingVal} style={{ color: 'var(--profit)' }}>{formatCLP(gananciaNeta)}</span>
              </div>
              <div className={styles.closingRow}>
                <span>Alertas de stock</span>
                <span className={styles.closingVal} style={{ color: 'var(--warn)' }}>{productosCriticos.length} productos</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
