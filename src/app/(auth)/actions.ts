'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface AuthState {
  error?: string | null;
  success?: string | null;
}

/**
 * Iniciar sesión con email y contraseña.
 */
export async function loginAction(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();
  const next = (formData.get('next') as string)?.trim() || '/dashboard';

  if (!email || !password) {
    return { error: 'Por favor, ingresa tu correo electrónico y contraseña.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Debes confirmar tu correo electrónico antes de iniciar sesión.' };
    }
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(next.startsWith('/') ? next : '/dashboard');
}

/**
 * Registrar un nuevo usuario o administrador.
 */
export async function registerAction(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const nombre = (formData.get('nombre') as string)?.trim();
  const nombreNegocio = (formData.get('nombre_negocio') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();

  if (!email || !password || !nombre) {
    return { error: 'Por favor, completa todos los campos requeridos.' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_completo: nombre,
        nombre_negocio: nombreNegocio || 'Mi Negocio',
        rol: 'ADMIN',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Si Supabase no requiere confirmación de email y devolvió sesión activa
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  return {
    success:
      '¡Cuenta creada con éxito! Si tu cuenta requiere confirmación, hemos enviado un enlace a tu correo.',
  };
}

/**
 * Solicitar enlace de recuperación de contraseña.
 */
export async function forgotPasswordAction(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim();

  if (!email) {
    return { error: 'Por favor, ingresa tu correo electrónico.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      'Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.',
  };
}

/**
 * Actualizar contraseña una vez autenticado desde el callback de recuperación.
 */
export async function updatePasswordAction(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const password = (formData.get('password') as string)?.trim();
  const confirmPassword = (formData.get('confirm_password') as string)?.trim();

  if (!password || password.length < 6) {
    return { error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

/**
 * Cerrar sesión en el servidor y redirigir a /login.
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
