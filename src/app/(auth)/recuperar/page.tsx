'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction, type AuthState } from '../actions';
import styles from '../auth.module.css';

export default function RecuperarPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    forgotPasswordAction,
    {}
  );

  return (
    <div className={styles.authCard}>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandMark}>MV</div>
        <h1 className={styles.brandTitle}>Recuperar Contraseña</h1>
        <p className={styles.brandSubtitle}>
          Ingresa tu correo y te enviaremos las instrucciones para restablecerla
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

      {state?.success && (
        <div className={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{state.success}</span>
        </div>
      )}

      {/* Form */}
      {!state?.success && (
        <form action={formAction} className={styles.authForm}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="email">
              Correo Electrónico Registrado
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

          <button
            type="submit"
            disabled={isPending}
            className={styles.submitButton}
          >
            {isPending ? <div className={styles.spinner} /> : 'Enviar Enlace de Recuperación'}
          </button>
        </form>
      )}

      {/* Footer Link to Login */}
      <div className={styles.authFooter}>
        ¿Recordaste tu contraseña?
        <Link href="/login">Regresar al inicio de sesión</Link>
      </div>
    </div>
  );
}
