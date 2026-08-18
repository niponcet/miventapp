import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

/**
 * Proxy / Middleware centralizado de Next.js.
 *
 * Intercepta todas las peticiones para refrescar tokens de sesión
 * y proteger rutas no autorizadas en MiVentApp.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

// Compatibilidad con middleware export
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono del navegador)
     * - manifest.json, sw.js (PWA assets)
     * - extensiones de imágenes/archivos públicos (svg, png, jpg, etc.)
     * - endpoints del proxy de supabase (/api/supabase/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
