/**
 * Cliente de Supabase para el NAVEGADOR (Client Components).
 *
 * Usa la anon key pública — las Row Level Security policies
 * en Supabase se encargan de la autorización.
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
