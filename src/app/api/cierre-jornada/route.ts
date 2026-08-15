/**
 * API Route — Cierre de Jornada (Módulo 4).
 *
 * POST: Genera el resumen diario de ventas y lo envía por WhatsApp / Email.
 * GET:  Consulta el último cierre de jornada.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Venta, CierreJornadaInsert } from '@/types/database';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cierre_jornadas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
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
    const body = await request.json();
    const supabase = await createClient();

    // 1. Calcular resumen del día
    const hoy = new Date().toISOString().split('T')[0];

    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('*')
      .gte('created_at', `${hoy}T00:00:00`)
      .lte('created_at', `${hoy}T23:59:59`);

    if (ventasError) {
      return NextResponse.json({ error: ventasError.message }, { status: 500 });
    }

    const ventasList = (ventas ?? []) as Venta[];
    const totalVentas = ventasList.reduce((sum, v) => sum + v.total, 0);
    const totalTransacciones = ventasList.length;

    // Agrupar ventas por método de pago
    const porMetodo = ventasList.reduce<Record<string, number>>((acc, v) => {
      acc[v.metodo_pago] = (acc[v.metodo_pago] || 0) + v.total;
      return acc;
    }, {});

    // 2. Insertar cierre de jornada
    const cierre: CierreJornadaInsert = {
      fecha: hoy,
      total_ventas: totalVentas,
      total_transacciones: totalTransacciones,
      resumen: { por_metodo: porMetodo },
      enviado_whatsapp: body.enviarWhatsapp ?? false,
      enviado_email: body.enviarEmail ?? false,
    };

    const { data: cierreData, error: cierreError } = await supabase
      .from('cierre_jornadas')
      .insert(cierre as never)
      .select()
      .single();

    if (cierreError) {
      return NextResponse.json({ error: cierreError.message }, { status: 500 });
    }

    // TODO: Integrar envío de WhatsApp y Gmail según flags

    return NextResponse.json({ data: cierreData }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar cierre de jornada' },
      { status: 500 }
    );
  }
}
