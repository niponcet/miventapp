'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { logoutAction } from '@/app/(auth)/actions';
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
    href: '/ventapp',
    label: 'Ventas (POS)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
        <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
      </svg>
    ),
  },
  {
    href: '/cierre',
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
  const [userName, setUserName] = useState<string>('Usuario');
  const [userRole, setUserRole] = useState<string>('Administrador');
  const [initials, setInitials] = useState<string>('MV');

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata || {};
        const name = metadata.nombre_completo || user.email?.split('@')[0] || 'Administrador';
        const role = metadata.rol || 'Administrador';
        setUserName(name);
        setUserRole(role);

        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          setInitials((parts[0][0] + parts[1][0]).toUpperCase());
        } else if (parts[0]) {
          setInitials(parts[0].slice(0, 2).toUpperCase());
        }
      }
    };

    fetchUser();
  }, []);

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
      {mainNavItems.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}

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
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userMeta}>
            <div className={styles.userName} title={userName}>
              {userName}
            </div>
            <div className={styles.userRole}>{userRole}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logoutAction()}
          className={styles.logoutButton}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
