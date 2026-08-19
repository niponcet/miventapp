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
            backdropFilter: 'blur(4px)',
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
            {/* Si ya se completó el cierre, mostramos la pantalla de éxito con botón directo de WhatsApp */}
            {resultData ? (
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'var(--profit-soft, rgba(16, 185, 129, 0.15))',
                    color: 'var(--profit, #10B981)',
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

                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ¡Caja cerrada con éxito!
                </h3>

                <p style={{ fontSize: '13.5px', color: 'var(--text-dim, #94A3B8)', lineHeight: '1.5', marginBottom: '16px' }}>
                  Se ha consolidado el resumen de la jornada del <strong>{formattedDate}</strong> en la base de datos y respaldado por correo.
                </p>

                {/* Botón directo de WhatsApp (Opción 4: wa.me) */}
                {resultData.whatsappUrl && (
                  <a
                    href={resultData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      width: '100%',
                      background: '#25D366',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginBottom: '10px',
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    Enviar Resumen por WhatsApp
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
                    borderRadius: '8px',
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
                    background: 'var(--warn-soft, rgba(245, 158, 11, 0.15))',
                    color: 'var(--warn, #F59E0B)',
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

                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ¿Confirmar Cierre de Caja?
                </h3>

                <p style={{ fontSize: '13.5px', color: 'var(--text-dim, #94A3B8)', lineHeight: '1.5', marginBottom: '14px' }}>
                  Estás a punto de cerrar la caja de la jornada del:
                </p>

                <div
                  style={{
                    display: 'inline-block',
                    background: 'var(--surface-3, #1F2C42)',
                    border: '1px solid var(--border, #334155)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    marginBottom: '16px',
                  }}
                >
                  📅 {formattedDate}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-faint, #64748B)', lineHeight: '1.4', marginBottom: '24px' }}>
                  Al confirmar, se consolidarán las ventas en Supabase y se generará el enlace directo para enviar el reporte de WhatsApp al administrador (+56981680253).
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
                    }}
                  >
                    ⚠️ {errorMessage}
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
