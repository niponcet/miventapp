import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route Handler para intercambio de tokens de Supabase Auth.
 * Procesa enlaces de verificación de correo, invitaciones y recuperación de contraseña.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const type = searchParams.get('type');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Si el tipo es recovery, redirigir a la pantalla de cambio de contraseña
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/actualizar-password`);
      }

      // Redirigir a la URL de destino solicitada
      const forwardUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/dashboard`;
      return NextResponse.redirect(forwardUrl);
    }
  }

  // Si hubo un error o no vino código válido, redirigir a login con mensaje
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
