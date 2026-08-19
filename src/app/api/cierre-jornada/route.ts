/**
 * API Route — Cierre de Jornada (Módulo 4).
 *
 * Sincronizado con arquitectura Multi-tenant, RLS y foreign key a usuarios.id.
 * POST: Genera el resumen diario de ventas, dispara notificaciones (WhatsApp/Gmail) y guarda auditoría.
 * GET:  Consulta el último resumen diario del usuario autenticado.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { formatDateFull } from '@/components/ventapp/productUtils';
import type { Venta } from '@/types/database';

export async function GET() {
  try {
    const supabase = await createClient();

    // Consultar el último resumen diario (filtrado por RLS según el usuario autenticado)
    const { data, error } = await supabase
      .from('resumen_diario')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: 'Error al consultar cierre de jornada' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Obtener usuario autenticado para respetar la integridad referencial y RLS
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id;

    // 2. Extraer fecha objetivo (o usar hoy por defecto)
    let targetDate = new Date().toISOString().split('T')[0];
    try {
      const body = await request.json();
      if (body?.date) {
        targetDate = body.date;
      }
    } catch {
      // Si no se envía body o es vacío, se mantiene targetDate como hoy
    }

    // 3. Consultar ventas de la jornada
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_hora', `${targetDate}T00:00:00.000Z`)
      .lte('fecha_hora', `${targetDate}T23:59:59.999Z`);

    if (ventasError) {
      return NextResponse.json({ error: ventasError.message }, { status: 500 });
    }

    const ventasList = (ventas ?? []) as Venta[];
    const totalVentas = ventasList.reduce((sum, v) => sum + (v.total_venta || 0), 0);
    const gananciaNeta = ventasList.reduce((sum, v) => sum + (v.ganancia_neta || 0), 0);

    // 4. Consultar stock crítico
    const { data: productos } = await supabase
      .from('productos')
      .select('stock_actual, stock_minimo');

    const stockCriticoList = (productos ?? []).filter((p) => p.stock_actual <= p.stock_minimo);

    // 5. Insertar o actualizar resumen diario en Supabase (Multi-tenant)
    let query = supabase.from('resumen_diario').select('id').eq('fecha', targetDate);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data: existingSummary } = await query.maybeSingle();

    let resumenData;
    let resumenError;

    if (existingSummary) {
      const { data, error } = await supabase
        .from('resumen_diario')
        .update({
          total_ventas: totalVentas,
          ganancia_neta: gananciaNeta,
        })
        .eq('id', existingSummary.id)
        .select()
        .single();
      resumenData = data;
      resumenError = error;
    } else {
      const insertPayload: any = {
        fecha: targetDate,
        total_ventas: totalVentas,
        ganancia_neta: gananciaNeta,
      };
      if (userId) {
        insertPayload.user_id = userId;
      }

      const { data, error } = await supabase
        .from('resumen_diario')
        .insert(insertPayload)
        .select()
        .single();
      resumenData = data;
      resumenError = error;
    }

    if (resumenError || !resumenData) {
      return NextResponse.json({ error: resumenError?.message || 'Error al guardar resumen diario' }, { status: 500 });
    }

    // 6. Formatear fecha determinista
    const selectedDateObj = new Date(targetDate + 'T12:00:00');
    const formattedDate = formatDateFull(selectedDateObj);

    // 7. Preparar cuerpo y enlace oficial de WhatsApp (wa.me) usando el teléfono del usuario
    const waBody = `📊 *Cierre de Caja - MiVentAPP*
📅 Jornada: ${formattedDate}
💰 Total Vendido: $${totalVentas.toLocaleString('es-CL')}
📈 Ganancia Neta: $${gananciaNeta.toLocaleString('es-CL')}
🏷️ Transacciones: ${ventasList.length}
⚠️ Alertas de Stock: ${stockCriticoList.length} productos

Resumen de ventas generado y respaldado automáticamente en Supabase.`;

    // Consultar el teléfono del usuario desde la tabla 'usuarios' o desde auth metadata
    let userPhone: string | null = null;
    if (userId) {
      const { data: userData } = await (supabase.from('usuarios' as any) as any)
        .select('telefono')
        .eq('id', userId)
        .maybeSingle();

      userPhone = userData?.telefono || (user?.user_metadata as any)?.telefono || null;
    }

    const rawPhone = userPhone || process.env.ADMIN_WHATSAPP_NUMBER || '56981680253';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waBody)}`;

    // 8. Preparar y Enviar Notificación de Gmail (Opción A: Al usuario de la sesión)
    const targetEmail = user?.email || process.env.ADMIN_EMAIL || 'javo161669@gmail.com';
    const userMetadata = (user?.user_metadata as any) || {};
    const businessOrUserName = userMetadata.nombre_completo || user?.email?.split('@')[0] || 'Administrador';

    const emailSubject = `📊 Resumen de Cierre de Caja - ${formattedDate}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">📊 Cierre de Caja — MiVentAPP</h2>
          <span style="color: #64748b; font-size: 13px;">Resumen diario de tu negocio</span>
        </div>

        <p style="font-size: 15px; color: #334155; line-height: 1.5;">
          Hola <strong>${businessOrUserName}</strong>, se ha consolidado exitosamente el cierre de caja de tu jornada del <strong>${formattedDate}</strong>.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Total Vendido</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 700; font-size: 16px; color: #0f172a;">$${totalVentas.toLocaleString('es-CL')}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #10b981;">Ganancia Neta</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 700; font-size: 16px; color: #10b981;">$${gananciaNeta.toLocaleString('es-CL')}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Transacciones Registradas</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${ventasList.length} ventas</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; font-weight: 600; color: #f59e0b;">Productos en Stock Crítico</td>
            <td style="padding: 12px 16px; text-align: right; font-family: monospace; font-weight: 600; color: #f59e0b;">${stockCriticoList.length} productos</td>
          </tr>
        </table>

        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 12.5px; color: #64748b;">
          📌 Este balance fue enviado automáticamente a tu cuenta (<strong>${targetEmail}</strong>) al ejecutar el cierre de jornada.
        </div>
      </div>
    `;

    const emailResult = await sendEmail({ to: targetEmail, subject: emailSubject, html: emailHtml });

    // 9. Registrar auditoría en la tabla 'notificaciones'
    try {
      await supabase.from('notificaciones').insert([
        {
          resumen_id: resumenData.id,
          canal: 'whatsapp',
          estado: 'enviado',
        },
        {
          resumen_id: resumenData.id,
          canal: 'gmail',
          estado: emailResult.success ? 'enviado' : 'fallido',
          error_mensaje: emailResult.success ? (emailResult.simulated ? 'Simulado exitosamente' : null) : emailResult.error,
        },
      ]);
    } catch (auditErr) {
      console.warn('Advertencia al registrar auditoría en tabla notificaciones:', auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: resumenData,
        whatsappUrl,
        notifications: {
          whatsapp: 'sent',
          email: emailResult.simulated ? 'simulated' : (emailResult.success ? 'sent' : 'failed'),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al procesar cierre de caja:', error);
    return NextResponse.json(
      { error: 'Error al procesar cierre de jornada: ' + error.message },
      { status: 500 }
    );
  }
}
