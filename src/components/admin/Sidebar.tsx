/**
 * Sidebar de navegación del panel de administración.
 *
 * Fiel al diseño de referencia: brand mark con gradiente,
 * navegación con iconos SVG inline, sección de utilidades
 * y footer con avatar del usuario.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Analítica',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/productos',
    label: 'Catálogo',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 7l9-4 9 4-9 4-9-4z" />
        <path d="M3 7v10l9 4 9-4V7" />
        <path d="M12 11v10" />
      </svg>
    ),
  },
  {
    href: '/productos',
    label: 'Inventario',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 14h4" />
      </svg>
    ),
  },
  {
    href: '/ventapp',
    label: 'Ventas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Cierre de caja',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M20.5 11.5a8.5 8.5 0 1 1-3.3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
    ),
  },
];

const utilNavItems: NavItem[] = [
  {
    href: '#',
    label: 'Notificaciones',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 8.5a5 5 0 1 0-9.8 1.5L3 21l6.5-2a5 5 0 0 0 7.5-4.5" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Configuración',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandMark}>MV</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>MiVentAPP</span>
          <span className={styles.brandSub}>Panel de control</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className={styles.navLabel}>General</div>
      {mainNavItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}

      {/* Utility navigation */}
      <div className={styles.utilSection}>
        {utilNavItems.map((item) => (
          <Link key={item.label} href={item.href} className={styles.navItem}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>

      {/* User footer */}
      <div className={styles.footer}>
        <div className={styles.avatar}>JP</div>
        <div className={styles.userMeta}>
          <div className={styles.userName}>Juan Pérez</div>
          <div className={styles.userRole}>Administrador</div>
        </div>
      </div>
    </aside>
  );
}
