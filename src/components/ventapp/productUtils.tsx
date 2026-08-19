import React from 'react';

/**
 * Formatea un número como moneda chilena (CLP).
 * Ejemplo: 12490 -> "$12.490"
 */
export function formatCLP(val: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Infiere una categoría amigable a partir del nombre o descripción del producto.
 */
export function getProductCategory(nombre: string, descripcion?: string | null): string {
  const text = `${nombre} ${descripcion || ''}`.toLowerCase();

  if (text.includes('cloro') || text.includes('desinfectante') || text.includes('lavalozas')) {
    return 'Desinfección & Limpieza';
  }
  if (text.includes('detergente') || text.includes('suavizante') || text.includes('quitamanchas')) {
    return 'Cuidado de Ropa';
  }
  if (text.includes('shampoo') || text.includes('acondicionador') || text.includes('jabón') || text.includes('crema')) {
    return 'Cuidado Personal';
  }
  if (text.includes('escoba') || text.includes('mopa') || text.includes('pala') || text.includes('trapero') || text.includes('esponja')) {
    return 'Herramientas de Aseo';
  }
  if (text.includes('papel') || text.includes('toalla') || text.includes('servilleta')) {
    return 'Papelería & Hogar';
  }
  if (text.includes('aceite') || text.includes('filtro') || text.includes('bujía') || text.includes('freno')) {
    return 'Automotriz';
  }

  return 'Abarrotes & General';
}

/**
 * Retorna un icono SVG temático según el tipo de producto.
 */
export function getProductIcon(nombre: string): React.ReactNode {
  const text = nombre.toLowerCase();

  // Líquidos / Botellas / Químicos / Cloros
  if (text.includes('cloro') || text.includes('detergente') || text.includes('suavizante') || text.includes('lavalozas') || text.includes('aceite') || text.includes('refrigerante')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
        <path d="M3 7l3-4h12l3 4" />
        <path d="M3 7h18v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
      </svg>
    );
  }

  // Cuidado personal / Botellas con dispensador
  if (text.includes('shampoo') || text.includes('acondicionador') || text.includes('crema') || text.includes('jabón')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
        <rect x="6" y="7" width="12" height="14" rx="3" />
        <path d="M12 7V4a2 2 0 0 1 2-2h1" />
      </svg>
    );
  }

  // Escobas / Herramientas
  if (text.includes('escoba') || text.includes('mopa') || text.includes('trapero') || text.includes('pala')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
        <path d="M12 2v14M8 16h8l2 6H6l2-6z" />
      </svg>
    );
  }

  // Cajas / Papel / Paquetes
  if (text.includes('papel') || text.includes('toalla') || text.includes('esponja') || text.includes('pastillas')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M8 6V4h8v2" />
      </svg>
    );
  }

  // Por defecto (Caja de producto / Mercadería)
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-[18px] h-[18px]">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}
