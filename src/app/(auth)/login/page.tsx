'use client';

import { useActionState, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginAction, type AuthState } from '../actions';
import styles from '../auth.module.css';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const errorParam = searchParams.get('error');

  const [targetApp, setTargetApp] = useState<'admin' | 'ventapp'>(
    nextParam?.includes('ventapp') ? 'ventapp' : 'admin'
  );

  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    errorParam ? { error: 'La sesión expiró o el enlace no es válido. Ingresa de nuevo.' } : {}
  );

  const destination = nextParam || (targetApp === 'ventapp' ? '/ventapp' : '/dashboard');

  return (
    <div className={styles.authCard}>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandMark}>MV</div>
        <h1 className={styles.brandTitle}>Bienvenido a MiVentAPP</h1>
        <p className={styles.brandSubtitle}>
          Ingresa tus credenciales para acceder a tu plataforma
        </p>
      </div>

      {/* Target Module Selector (ERP vs POS) */}
      <div className={styles.modeSelector}>
        <button
          type="button"
          className={`${styles.modeButton} ${targetApp === 'admin' ? styles.activeMode : ''}`}
          onClick={() => setTargetApp('admin')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
          Panel ERP
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${targetApp === 'ventapp' ? styles.activeMode : ''}`}
          onClick={() => setTargetApp('ventapp')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="17" cy="20" r="1.4" />
            <path d="M2 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6" />
          </svg>
          Punto de Venta
        </button>
      </div>

      {/* Error Alert */}
      {state?.error && (
        <div className={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{state.error}</span>
        </div>
      )}

      {/* Login Form */}
      <form action={formAction} className={styles.authForm}>
        <input type="hidden" name="next" value={destination} />

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="email">
            Correo Electrónico
          </label>
          <div className={styles.inputWrapper}>
            <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.fieldLabel} htmlFor="password">
              Contraseña
            </label>
            <Link href="/recuperar" className={styles.fieldLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className={styles.inputWrapper}>
            <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={styles.inputField}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={styles.submitButton}
        >
          {isPending ? <div className={styles.spinner} /> : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Footer Switch to Register */}
      <div className={styles.authFooter}>
        ¿Aún no tienes cuenta?
        <Link href="/register">Crear cuenta</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.authCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div className={styles.spinner} style={{ width: 24, height: 24 }} />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
