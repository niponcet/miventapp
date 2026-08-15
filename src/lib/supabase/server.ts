/**
 * Cliente de Supabase para el SERVIDOR (Server Components, Route Handlers, Server Actions).
 *
 * Usa `cookies()` de Next.js para mantener la sesión del usuario
 * en el contexto del servidor.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // `setAll` puede fallar en Server Components (read-only).
            // Esto es esperado si el middleware ya refresca la sesión.
          }
        },
      },
    }
  );
}
