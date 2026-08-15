/**
 * API Route — Cierre de Jornada (Módulo 4).
 *
 * POST: Genera el resumen diario de ventas.
 * GET:  Consulta el último resumen diario.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Venta } from '@/types/database';

export async function GET() {
  try {
    const supabase = await createClient();

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

    // 1. Calcular resumen del día
    const hoy = new Date().toISOString().split('T')[0];

    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_hora', `${hoy}T00:00:00`)
      .lte('fecha_hora', `${hoy}T23:59:59`);

    if (ventasError) {
      return NextResponse.json({ error: ventasError.message }, { status: 500 });
    }

    const ventasList = (ventas ?? []) as Venta[];
    const totalVentas = ventasList.reduce((sum, v) => sum + v.total_venta, 0);
    const gananciaNeta = ventasList.reduce((sum, v) => sum + v.ganancia_neta, 0);

    // 2. Insertar o actualizar resumen diario
    const { data: resumenData, error: resumenError } = await supabase
      .from('resumen_diario')
      .insert({
        fecha: hoy,
        total_ventas: totalVentas,
        ganancia_neta: gananciaNeta,
      })
      .select()
      .single();

    if (resumenError) {
      return NextResponse.json({ error: resumenError.message }, { status: 500 });
    }

    return NextResponse.json({ data: resumenData }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar cierre de jornada' },
      { status: 500 }
    );
  }
}
