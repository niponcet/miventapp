'use client';

import { useEffect } from 'react';

/**
 * Registra el Service Worker en el navegador para habilitar la experiencia PWA offline.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registrado con éxito:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Error al registrar Service Worker:', error);
          });
      });
    }
  }, []);

  return null;
}
