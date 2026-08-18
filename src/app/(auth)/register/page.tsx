'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, type AuthState } from '../actions';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    registerAction,
    {}
  );

  return (
    <div className={styles.authCard}>
      {/* Brand Header */}
      <div className={styles.brandHeader}>
        <div className={styles.brandMark}>MV</div>
        <h1 className={styles.brandTitle}>Crear Nueva Cuenta</h1>
        <p className={styles.brandSubtitle}>
          Registra tu negocio para comenzar a gestionar ventas e inventario
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

      {/* Register Form */}
      <form action={formAction} className={styles.authForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="nombre">
            Nombre Completo *
          </label>
          <div className={styles.inputWrapper}>
            <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              placeholder="Ej: Juan Pérez"
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="nombre_negocio">
            Nombre del Comercio / Negocio
          </label>
          <div className={styles.inputWrapper}>
            <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <input
              id="nombre_negocio"
              name="nombre_negocio"
              type="text"
              placeholder="Ej: Minimarket Los Laureles"
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="email">
            Correo Electrónico *
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
          <label className={styles.fieldLabel} htmlFor="password">
            Contraseña (mínimo 6 caracteres) *
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
            Confirmar Contraseña *
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
          {isPending ? <div className={styles.spinner} /> : 'Registrar Negocio'}
        </button>
      </form>

      {/* Footer Link to Login */}
      <div className={styles.authFooter}>
        ¿Ya tienes una cuenta?
        <Link href="/login">Iniciar sesión</Link>
      </div>
    </div>
  );
}
