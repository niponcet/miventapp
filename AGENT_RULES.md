# AGENT RULES — MiVentApp

Este documento define los estándares arquitectónicos, convenciones de código, reglas de negocio y directrices de diseño para el desarrollo y mantenimiento de **MiVentApp**.

---

## 1. Arquitectura General del Proyecto

- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS.
- **Base de Datos & Auth**: Supabase (PostgreSQL + Auth + Storage).
- **Estructura Híbrida (Web ERP / CRM + Mobile PWA POS)**:
  - `(auth)`: Flujo centralizado de autenticación (`/login`, `/register`, `/recuperar`, `/actualizar-password`).
  - `(admin)`: Panel de gestión administrativo en escritorio (`/dashboard`, `/productos`, `/cierre`).
  - `(ventapp)`: Aplicación Web Progresiva móvil para vendedores en terreno (`/ventapp`, `/ventapp/inventario`, `/ventapp/analitica`).

---

## 2. Convenciones de Next.js & TypeScript

1. **Proxy / Middleware**:
   - En Next.js 16+, el archivo de control de acceso y refresco de sesión se ubica exclusivamente en `src/proxy.ts` (nunca `middleware.ts`).
2. **Server Components vs Client Components**:
   - Las páginas (`page.tsx`) deben actuar como Server Components para consultar datos directamente con `createClient()` de `@/lib/supabase/server`.
   - Utilizar `'use client'` únicamente en componentes que requieran interactividad (formularios, modales, carritos, estados locales).
3. **Server Actions**:
   - Todas las mutaciones transaccionales deben implementarse en Server Actions (`actions.ts`) con validación de sesión de usuario y revalidación de rutas mediante `revalidatePath()`.
4. **Layouts Modulares Anidados**:
   - Cada módulo administrativo (`dashboard/`, `productos/`, `cierre/`) debe tener su propio `layout.tsx` anidado.

---

## 3. Reglas de Estilos y UI

1. **Tailwind CSS Puro**:
   - **No crear nuevos archivos `.module.css`**. Usar clases utilitarias de Tailwind CSS directamente en el JSX.
2. **Paleta de Colores Corporativa (Dark Mode)**:
   - Fondo principal: `#0F1419`
   - Superficies / Tarjetas: `#151C24` / `#1A2129`
   - Bordes: `#232B34` / `#2A333D`
   - Acento Principal (Brand): `#5B8DEF`
   - Ganancia / Éxito: `#4F9E82` / `emerald`
   - Peligro / Alerta Crítica: `#C0526B` / `rose`
   - Advertencia / Stock Bajo: `#D98B4F` / `amber`
   - Texto principal: `#E7EBEF`
   - Texto secundario / Muted: `#8B95A3` / `#5B6472`
3. **PWA & Mobile-First**:
   - Soporte obligatorio de Safe-Area: `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`.
   - Áreas táctiles mínimas de 44px de alto para todos los botones e inputs en pantallas móviles.

---

## 4. Reglas de Negocio y Datos (Supabase)

1. **Control Estricto de Stock**:
   - Nunca permitir agregar a una venta o carrito más unidades de las disponibles en `productos.stock_actual`.
   - Deshabilitar y marcar visualmente como `Agotado` los productos con `stock_actual <= 0`.
2. **Transacciones de Venta**:
   - Toda venta confirmada debe descontar el inventario en `public.productos`, insertar el registro principal en `public.ventas`, el desglose en `public.detalle_ventas` y registrar la trazabilidad en `public.movimientos_stock`.
3. **Formateo de Moneda**:
   - Usar siempre `formatCLP()` de `productUtils.tsx` para moneda chilena (`$12.490`, sin decimales).
4. **Prevención de Errores de Hidratación SSR**:
   - Para fechas y horas, utilizar siempre los formateadores deterministas de `src/components/ventapp/productUtils.tsx` (`formatTime24`, `formatDateShort`, `formatDateFull`, `formatDateChip`) para evitar discrepancias de ICU / locales entre el servidor Node.js y el navegador del cliente.

---

## 5. Esquema de Base de Datos Principal

```sql
-- Tablas principales:
public.productos (id, user_id, nombre, descripcion, precio_neto, precio_venta, stock_actual, stock_minimo)
public.ventas (id, user_id, total_venta, ganancia_neta, estado, fecha_hora)
public.detalle_ventas (id, venta_id, producto_id, cantidad, precio_unitario_neto, precio_unitario_venta)
public.movimientos_stock (id, producto_id, user_id, cantidad, tipo, created_at)
public.resumen_diario (id, user_id, fecha, total_ventas, ganancia_neta, created_at)
```

---

## 6. Validación de Calidad

- Todo cambio debe compilar limpiamente ejecutando `npx next build` con **0 errores** de TypeScript y Turbopack.
