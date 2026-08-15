/**
 * Página raíz — redirige a la ruta principal de la app.
 *
 * Puedes cambiar la redirección según el rol del usuario
 * (admin → /dashboard, vendedor → /ventapp).
 */
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirección por defecto al dashboard de administración
  redirect('/dashboard');
}
