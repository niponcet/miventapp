'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { logoutAction } from '@/app/(auth)/actions';

export function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string>('Vendedor');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('Operador POS');
  const [initials, setInitials] = useState<string>('MV');

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const metadata = user.user_metadata || {};
        const name = metadata.nombre_completo || user.email?.split('@')[0] || 'Vendedor';
        const role = metadata.rol || 'Vendedor en Terreno';
        setUserName(name);
        setUserEmail(user.email || '');
        setUserRole(role);

        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          setInitials((parts[0][0] + parts[1][0]).toUpperCase());
        } else if (parts[0]) {
          setInitials(parts[0].slice(0, 2).toUpperCase());
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      {/* Botón de perfil en el header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-[38px] h-[38px] rounded-[12px] bg-[#212A34] border border-[#2A333D] hover:border-[#5B8DEF]/50 flex items-center justify-center text-[#8B95A3] hover:text-white transition-all active:scale-95 cursor-pointer shrink-0 font-bold text-xs"
        title="Mi Perfil"
        aria-label="Mi Perfil"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px]"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {/* Modal / Drawer de Perfil */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-[#151C24] border-t sm:border border-[#232B34] rounded-t-[24px] sm:rounded-[24px] p-6 text-[#E7EBEF] shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#232B34]">
              <h2 className="text-base font-bold tracking-tight text-white">Mi Perfil</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#212A34] text-[#8B95A3] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Info de Usuario */}
            <div className="flex items-center gap-3.5 bg-[#1A2129] border border-[#232B34] p-3.5 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate" title={userName}>
                  {userName}
                </div>
                <div className="text-xs text-[#8B95A3] truncate" title={userEmail}>
                  {userEmail || 'usuario@miventapp.cl'}
                </div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#5B8DEF]/15 border border-[#5B8DEF]/30 text-[#5B8DEF] text-[10px] font-bold uppercase tracking-wider">
                  {userRole}
                </div>
              </div>
            </div>

            {/* Opciones Rápidas */}
            <div className="space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#1A2129] hover:bg-[#212A34] border border-[#232B34] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <rect x="3" y="3" width="7" height="9" rx="1.5" />
                      <rect x="14" y="3" width="7" height="5" rx="1.5" />
                      <rect x="14" y="12" width="7" height="9" rx="1.5" />
                      <rect x="3" y="16" width="7" height="5" rx="1.5" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Panel de Administración
                    </div>
                    <div className="text-[10.5px] text-[#8B95A3]">Gestión completa web</div>
                  </div>
                </div>
                <span className="text-[#8B95A3] text-sm font-semibold">→</span>
              </Link>
            </div>

            {/* Botón Cerrar Sesión */}
            <button
              type="button"
              onClick={() => logoutAction()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-98"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </>
  );
}
