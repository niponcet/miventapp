'use client';

import { useState, useMemo, useTransition } from 'react';
import type { Producto } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import styles from './ProductCatalog.module.css';

interface ProductCatalogProps {
  initialProductos: Producto[];
}

export function ProductCatalog({ initialProductos }: ProductCatalogProps) {
  const [productos, setProductos] = useState<Producto[]>(initialProductos);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'normal' | 'low' | 'critical'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario nuevo producto
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_neto: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '5',
  });

  const supabase = createClient();

  // Función para refrescar productos desde Supabase
  const refreshProducts = async () => {
    startTransition(async () => {
      const { data } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (data) {
        setProductos(data);
      }
    });
  };

  // Guardar nuevo producto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || null,
          precio_neto: parseInt(formData.precio_neto) || 0,
          precio_venta: parseInt(formData.precio_venta) || 0,
          stock_actual: parseInt(formData.stock_actual) || 0,
          stock_minimo: parseInt(formData.stock_minimo) || 5,
        })
        .select()
        .single();

      if (error) {
        alert('Error al crear el producto: ' + error.message);
      } else if (data) {
        setProductos((prev) => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setIsModalOpen(false);
        setFormData({
          nombre: '',
          descripcion: '',
          precio_neto: '',
          precio_venta: '',
          stock_actual: '',
          stock_minimo: '5',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Métricas calculadas para las Cards ──────────────────────────────────────
  const stats = useMemo(() => {
    const totalProductos = productos.length;
    const totalStock = productos.reduce((sum, p) => sum + p.stock_actual, 0);
    const valorInventario = productos.reduce((sum, p) => sum + p.precio_venta * p.stock_actual, 0);
    const stockCriticoCount = productos.filter((p) => p.stock_actual <= p.stock_minimo).length;
    const costoTotal = productos.reduce((sum, p) => sum + p.precio_neto * p.stock_actual, 0);
    const margenTotalPromedio = valorInventario > 0 
      ? Math.round(((valorInventario - costoTotal) / valorInventario) * 100) 
      : 0;

    return {
      totalProductos,
      totalStock,
      valorInventario,
      stockCriticoCount,
      margenTotalPromedio,
    };
  }, [productos]);

  // ─── Filtrado y Búsqueda ──────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterTab === 'critical') {
        return p.stock_actual <= p.stock_minimo;
      }
      if (filterTab === 'low') {
        return p.stock_actual > p.stock_minimo && p.stock_actual <= p.stock_minimo * 2;
      }
      if (filterTab === 'normal') {
        return p.stock_actual > p.stock_minimo * 2;
      }

      return true;
    });
  }, [productos, search, filterTab]);

  // Formato de moneda chilena
  const formatCLP = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={styles.container}>
      {/* ─── TOPBAR ─── */}
      <div className={styles.topbar}>
        <div>
          <h1>Catálogo e Inventario</h1>
          <div className={styles.dateLine}>
            Sincronizado con Supabase · {productos.length} productos registrados
          </div>
        </div>
        <div className={styles.topbarActions}>
          <button
            onClick={refreshProducts}
            className={styles.btnSecondary}
            title="Recargar productos desde la base de datos"
            disabled={isPending}
          >
            <svg
              className={isPending ? 'animate-spin' : ''}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
            Actualizar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className={styles.btnPrimary}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* ─── KPI CARDS ─── */}
      <div className={styles.kpiRow}>
        {/* Card 1: Total Productos */}
        <div className={`${styles.kpiCard} ${styles.cAccent}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Total productos</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 7l9-4 9 4-9 4-9-4z" />
                <path d="M3 7v10l9 4 9-4V7" />
                <path d="M12 11v10" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>{stats.totalProductos}</div>
          <div className={styles.kpiSub}>Ítems en catálogo activo</div>
        </div>

        {/* Card 2: Stock Total */}
        <div className={`${styles.kpiCard} ${styles.cProfit}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Unidades en stock</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <path d="M3 10h18" />
                <path d="M8 14h4" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>{stats.totalStock}</div>
          <div className={styles.kpiSub}>Existencias totales disponibles</div>
        </div>

        {/* Card 3: Valoración de Inventario */}
        <div className={`${styles.kpiCard} ${styles.cAccent}`}>
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Valor del inventario</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>{formatCLP(stats.valorInventario)}</div>
          <div className={styles.kpiSub}>Margen promedio {stats.margenTotalPromedio}%</div>
        </div>

        {/* Card 4: Stock Crítico */}
        <div
          className={`${styles.kpiCard} ${
            stats.stockCriticoCount > 0 ? styles.cDanger : styles.cWarn
          }`}
        >
          <div className={styles.kpiTop}>
            <span className={styles.kpiLabel}>Stock crítico</span>
            <div className={styles.kpiIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <path d="M12 9v4M12 17h.01" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>{stats.stockCriticoCount}</div>
          <div className={styles.kpiSub}>
            {stats.stockCriticoCount === 0
              ? 'Todos los niveles óptimos'
              : 'Requieren reabastecimiento'}
          </div>
        </div>
      </div>

      {/* ─── MAIN PANEL: TABLA CON BÚSQUEDA Y FILTROS ─── */}
      <div className={styles.mainPanel}>
        <div className={styles.controlsBar}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${filterTab === 'all' ? styles.activeTab : ''}`}
              onClick={() => setFilterTab('all')}
            >
              Todos ({productos.length})
            </button>
            <button
              className={`${styles.filterTab} ${filterTab === 'normal' ? styles.activeTab : ''}`}
              onClick={() => setFilterTab('normal')}
            >
              Óptimo
            </button>
            <button
              className={`${styles.filterTab} ${filterTab === 'low' ? styles.activeTab : ''}`}
              onClick={() => setFilterTab('low')}
            >
              Stock Medio
            </button>
            <button
              className={`${styles.filterTab} ${filterTab === 'critical' ? styles.activeTab : ''}`}
              onClick={() => setFilterTab('critical')}
            >
              Crítico ({stats.stockCriticoCount})
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className={styles.tableWrap}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <p>No se encontraron productos coincidentes</p>
            </div>
          ) : (
            <table className={styles.ledgerTable}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className={styles.num}>Stock Actual</th>
                  <th className={styles.num}>Mínimo</th>
                  <th className={styles.num}>P. Neto (Costo)</th>
                  <th className={styles.num}>P. Venta</th>
                  <th className={styles.num}>Ganancia Unit.</th>
                  <th className={styles.num}>Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const ganancia = p.precio_venta - p.precio_neto;
                  const margenPorc = p.precio_venta > 0 ? Math.round((ganancia / p.precio_venta) * 100) : 0;
                  const valorFila = p.precio_venta * p.stock_actual;

                  let stockStyle = styles.stockNormal;
                  let dotColor = 'var(--profit)';

                  if (p.stock_actual <= p.stock_minimo) {
                    stockStyle = styles.stockCritical;
                    dotColor = 'var(--danger)';
                  } else if (p.stock_actual <= p.stock_minimo * 2) {
                    stockStyle = styles.stockLow;
                    dotColor = 'var(--warn)';
                  }

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.prodCell}>
                          <span className={styles.prodDot} style={{ background: dotColor }} />
                          <div>
                            <div className={styles.prodName}>{p.nombre}</div>
                            {p.descripcion && <div className={styles.prodDesc}>{p.descripcion}</div>}
                          </div>
                        </div>
                      </td>
                      <td className={styles.num}>
                        <span className={`${styles.stockBadge} ${stockStyle}`}>
                          {p.stock_actual} UND.
                        </span>
                      </td>
                      <td className={styles.num}>
                        <span className="text-zinc-500 font-mono-num">{p.stock_minimo}</span>
                      </td>
                      <td className={styles.num}>{formatCLP(p.precio_neto)}</td>
                      <td className={styles.num} style={{ fontWeight: 600 }}>
                        {formatCLP(p.precio_venta)}
                      </td>
                      <td className={`${styles.num} ${styles.profitCell}`}>
                        {formatCLP(ganancia)}
                        <span className={styles.marginPill}>({margenPorc}%)</span>
                      </td>
                      <td className={styles.num} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        {formatCLP(valorFila)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── MODAL AGREGAR PRODUCTO ─── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            style={{ background: 'var(--surface)' }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <h2 className="text-lg font-bold font-heading text-zinc-100">
                Nuevo Producto
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cloro Gel 1L"
                    className={styles.formInput}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.formLabel}>Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej: Desinfectante multiuso aroma lavanda"
                    className={styles.formInput}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio Neto / Costo ($ CLP)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1500"
                    className={styles.formInput}
                    value={formData.precio_neto}
                    onChange={(e) => setFormData({ ...formData, precio_neto: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Precio de Venta ($ CLP) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="1990"
                    className={styles.formInput}
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock Inicial (Unidades)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="20"
                    className={styles.formInput}
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5"
                    className={styles.formInput}
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.btnSecondary}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.btnPrimary}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar en Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
