'use client';

import { useState } from 'react';
import styles from '@/app/(admin)/dashboard/dashboard.module.css';

interface CloseRegisterButtonProps {
  date: string;
}

export function CloseRegisterButton({ date }: CloseRegisterButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<{
    whatsappUrl?: string;
    email: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleOpenModal = () => {
    setResultData(null);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (loading) return;
    setIsModalOpen(false);
  };

  const handleConfirmClose = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/cierre-jornada', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });

      const result = await response.json();

      if (response.ok) {
        setResultData({
          whatsappUrl: result.whatsappUrl,
          email: result.notifications?.email || 'enviado',
        });
      } else {
        throw new Error(result.error || 'Error al procesar el cierre de caja');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón en el panel de acciones rápidas */}
      <div
        onClick={handleOpenModal}
        className={`${styles.qaItem} ${styles.qaClose}`}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.qaIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M20.5 11.5a8.5 8.5 0 1 1-3.3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
        </div>
        <div>
          <div className={styles.qaTitle}>Cerrar caja del día</div>
          <div className={styles.qaDesc}>Genera y envía el resumen</div>
        </div>
      </div>

      {/* Modal flotante personalizado */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '16px',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: 'var(--surface, #121824)',
              border: '1px solid var(--border-soft, #263043)',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              color: 'var(--text, #F1F5F9)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Si ya se completó el cierre, mostramos la pantalla de éxito con estilo VentApp POS */}
            {resultData ? (
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Cierre de caja generado con éxito
                </h3>

                <p style={{ fontSize: '13.5px', color: 'var(--text-dim, #94A3B8)', lineHeight: '1.5', marginBottom: '16px' }}>
                  Se ha consolidado el balance de la jornada del <strong>{formattedDate}</strong> en la base de datos y respaldado por correo.
                </p>

                {/* Botón directo de WhatsApp estilo VentApp POS */}
                {resultData.whatsappUrl && (
                  <a
                    href={resultData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      background: '#10B981',
                      color: '#000000',
                      textDecoration: 'none',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      marginBottom: '10px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span>Enviar a WhatsApp</span>
                    <span style={{ fontSize: '15px' }}>↗</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    width: '100%',
                    background: 'var(--surface-3, #1F2C42)',
                    color: 'var(--text-dim, #94A3B8)',
                    border: '1px solid var(--border, #334155)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cerrar ventana
                </button>
              </div>
            ) : (
              /* Pantalla de Confirmación de Cierre */
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  Confirmar Cierre de Caja
                </h3>

                <p style={{ fontSize: '13.5px', color: 'var(--text-dim, #94A3B8)', lineHeight: '1.5', marginBottom: '14px' }}>
                  Estás a punto de cerrar la caja de la jornada:
                </p>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--surface-3, #1F2C42)',
                    border: '1px solid var(--border, #334155)',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    color: 'var(--text, #E7EBEF)',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '14px', height: '14px', color: 'var(--accent, #38BDF8)' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {formattedDate}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-faint, #64748B)', lineHeight: '1.4', marginBottom: '24px' }}>
                  Al confirmar, se consolidarán las ventas en Supabase y se generará el enlace directo para enviar el reporte de WhatsApp al número registrado en la cuenta.
                </p>

                {errorMessage && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#EF4444',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={loading}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border, #334155)',
                      color: 'var(--text-dim, #94A3B8)',
                      borderRadius: '8px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmClose}
                    disabled={loading}
                    style={{
                      background: 'var(--warn, #F59E0B)',
                      color: '#0B1220',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 18px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            border: '2px solid #0B1220',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }}
                        />
                        Procesando...
                      </>
                    ) : (
                      'Sí, cerrar caja'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
