import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from './dashboard.module.css';
import { formatCLP, getProductCategory, formatDateFull, getProductIcon } from '@/components/ventapp/productUtils';
import { DatePicker, CloseRegisterButton } from '@/components/admin';

export const metadata = {
  title: 'Analítica | MiVentApp',
  description: 'Analítica de ventas e inventario en tiempo real',
};

// Revalidar en cada petición para reflejar ventas de inmediato
export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const selectedDate = searchParams.date || new Date().toISOString().split('T')[0];
  const supabase = await createClient();

  // Límites del día seleccionado
  const startOfDay = `${selectedDate}T00:00:00.000Z`;
  const endOfDay = `${selectedDate}T23:59:59.999Z`;

  // Obtener usuario autenticado para respetar el aislamiento Multi-tenant
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Consultar ventas y métricas del día seleccionado
  let ventasQuery = supabase
    .from('ventas')
    .select('id, total_venta, ganancia_neta, fecha_hora')
    .gte('fecha_hora', startOfDay)
    .lte('fecha_hora', endOfDay)
    .order('fecha_hora', { ascending: false });

  if (user?.id) {
    ventasQuery = ventasQuery.eq('user_id', user.id);
  }
  const { data: ventasData } = await ventasQuery;

  // 2. Consultar productos para stock crítico
  let prodQuery = supabase
    .from('productos')
    .select('*')
    .order('nombre', { ascending: true });

  if (user?.id) {
    prodQuery = prodQuery.eq('user_id', user.id);
  }
  const { data: productosData } = await prodQuery;

  const ventas = ventasData ?? [];
  const productos = productosData ?? [];
  const ventaIds = ventas.map((v) => v.id);

  // 3. Consultar detalle de ventas correspondiente a las ventas del día seleccionado
  const { data: detalleData } = ventaIds.length > 0
    ? await supabase
        .from('detalle_ventas')
        .select(`
          cantidad,
          precio_unitario_venta,
          precio_unitario_neto,
          producto_id,
          venta_id,
          productos (
            nombre,
            descripcion
          )
        `)
        .in('venta_id', ventaIds)
    : { data: [] };

  const detalles = detalleData ?? [];

  // Calcular KPIs del día seleccionado
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

  detalles.forEach((d) => {
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

  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  const dateFormatted = formatDateFull(selectedDateObj);

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
          {/* Selector de fecha interactivo (Módulo 3) */}
          <DatePicker initialDate={selectedDate} />

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
                Detalle de productos vendidos <span className={styles.panelCount}>· jornada {selectedDate}</span>
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
                  <p className="text-sm font-medium text-zinc-400">Aún no hay ventas registradas en esta jornada ({selectedDate})</p>
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
              {/* Cierre de caja modal interactivo con WhatsApp */}
              <CloseRegisterButton date={selectedDate} />
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

          {/* Cierre automático con valores reales de la fecha seleccionada */}
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