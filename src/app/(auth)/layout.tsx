import type { ReactNode } from 'react';
import styles from './auth.module.css';

export const metadata = {
  title: 'Acceso seguro | MiVentApp',
  description: 'Inicia sesión o regístrate en MiVentApp',
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.authWrapper}>
      {children}
    </div>
  );
}
