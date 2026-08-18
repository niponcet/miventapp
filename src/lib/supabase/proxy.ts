import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Helper de sesión para el Proxy / Middleware de Next.js.
 *
 * Se encarga de:
 * 1. Refrescar tokens expirados en cada petición HTTP mediante cookies.
 * 2. Verificar si el usuario tiene una sesión activa mediante `supabase.auth.getUser()`.
 * 3. Proteger rutas administrativas / ventas o redirigir usuarios autenticados fuera de las páginas de login.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: Usar getUser() en lugar de getSession() para validar el token contra el servidor de Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  // Rutas públicas de autenticación
  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/recuperar' ||
    pathname === '/actualizar-password';

  const isAuthCallback = pathname.startsWith('/auth/callback');

  // Rutas protegidas que requieren sesión activa (Panel Admin y Punto de Venta VentApp)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/productos') ||
    pathname.startsWith('/ventapp') ||
    pathname === '/';

  // 1. Si no hay usuario y trata de acceder a una ruta protegida -> Redirigir a /login guardando la ruta de retorno
  if (!user && isProtectedRoute && !isAuthRoute && !isAuthCallback) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    if (pathname !== '/') {
      redirectUrl.searchParams.set('next', pathname + (request.nextUrl.search || ''));
    }
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Si ya hay usuario autenticado y visita una ruta de login/registro -> Redirigir al dashboard o al destino guardado
  if (user && isAuthRoute) {
    const nextPath = searchParams.get('next') || '/dashboard';
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = nextPath.startsWith('/') ? nextPath : '/dashboard';
    redirectUrl.searchParams.delete('next');
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
