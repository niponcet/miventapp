import type { NextConfig } from "next";

/**
 * Configuración de Next.js para MiVentApp.
 *
 * El proxy (rewrites) redirige las peticiones de `/api/supabase/:path*`
 * al servidor de Supabase. Esto permite:
 *   - Ocultar la URL real de Supabase al cliente
 *   - Evitar problemas de CORS en desarrollo
 *   - Centralizar las peticiones a través del dominio propio
 */
const nextConfig: NextConfig = {
  // ─── Proxy a Supabase ───────────────────────────────────────────────────────
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    return [
      {
        source: '/api/supabase/:path*',
        destination: `${supabaseUrl}/rest/v1/:path*`,
      },
      {
        source: '/api/supabase-storage/:path*',
        destination: `${supabaseUrl}/storage/v1/:path*`,
      },
      {
        source: '/api/supabase-auth/:path*',
        destination: `${supabaseUrl}/auth/v1/:path*`,
      },
    ];
  },

  // ─── Imágenes externas (Supabase Storage) ───────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
