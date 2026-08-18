'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updatePasswordAction, type AuthState } from '../actions';
import styles from '../auth.module.css';

export default function ActualizarPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    updatePasswordAction,
    {}
  );

  return (
    <div className={styles.authCard}>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandMark}>MV</div>
        <h1 className={styles.brandTitle}>Nueva Contraseña</h1>
        <p className={styles.brandSubtitle}>
          Ingresa y confirma tu nueva contraseña de acceso
        </p>
      </div>

      {/* Alerts */}
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

      {/* Form */}
      <form action={formAction} className={styles.authForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="password">
            Nueva Contraseña (mínimo 6 caracteres) *
          </label>
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
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="confirm_password">
            Confirmar Nueva Contraseña *
          </label>
          <div className={styles.inputWrapper}>
            <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
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
          {isPending ? <div className={styles.spinner} /> : 'Guardar y Entrar'}
        </button>
      </form>

      {/* Footer Link */}
      <div className={styles.authFooter}>
        <Link href="/login">Cancelar y volver al inicio</Link>
      </div>
    </div>
  );
}
