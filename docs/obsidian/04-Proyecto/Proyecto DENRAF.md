---
tags: [angular, proyecto, denraf]
created: 2024-12-17
---

# 🏪 Proyecto DENRAF - Sistema POS

> _"Tu sistema de punto de venta familiar"_

---

## 📋 Descripción

Sistema de **Punto de Venta (POS) + Gestión de Inventario** desarrollado en Angular 18+ con arquitectura Standalone Components.

Pensado para un **negocio familiar de ropa**.

---

## 🏗️ Arquitectura

```
src/app/
├── core/           🧱 Servicios, modelos, auth
├── features/       🎨 Módulos funcionales
├── layout/         🖼️ Estructura visual
└── shared/         🧰 Componentes reutilizables
```

---

## 🎨 Features del Sistema

| Feature        | Ruta          | Descripción                |
| -------------- | ------------- | -------------------------- |
| **Auth**       | `/login`      | Login con PIN de 4 dígitos |
| **Dashboard**  | `/dashboard`  | KPIs y métricas de ventas  |
| **POS**        | `/pos`        | Punto de venta con carrito |
| **Inventario** | `/inventario` | Gestión de productos       |
| **Clientes**   | `/clients`    | CRM con tiers VIP          |
| **Ventas**     | `/sales`      | Historial de ventas        |
| **Usuarios**   | `/users`      | Gestión de vendedores      |

---

## 👥 Usuarios Predefinidos

| Usuario | PIN  | Rol      |
| ------- | ---- | -------- |
| Yo      | 1234 | Admin    |
| Mamá    | 5678 | Vendedor |
| Hermano | 9012 | Vendedor |

---

## 🔧 Servicios Principales

### ProductService

- Fuente única de verdad para productos
- CRUD de productos
- Gestión de stock

### SalesService

- Registro de ventas
- Reducción automática de stock
- KPIs y estadísticas

### AuthService

- Multi-usuario
- Login con PIN
- Gestión de sesión

---

## 🛒 Flujo de una Venta

```
1. Usuario selecciona productos (POS)
   ↓
2. Agrega al carrito (con variante talla/color)
   ↓
3. Selecciona método de pago
   ↓
4. Procesa la venta
   ├── SalesService.createSale()
   └── ProductService.reduceStock()
   ↓
5. Muestra ticket de venta
```

---

## 🎭 Patrones Usados

- **Standalone Components** → Componentes independientes
- **Signals** → Estado reactivo
- **Facade Pattern** → POS Cart/Product/Payment Facades
- **Singleton** → Servicios globales
- **Lazy Loading** → Carga bajo demanda

---

## 🎨 Stack Tecnológico

- **Angular 18+** (Standalone Components)
- **TypeScript**
- **Tailwind CSS** (estilo minimalista)
- **Signals** (estado reactivo)
- **LocalStorage** (persistencia offline)

---

## 📁 Estructura de Carpetas

```
features/
├── auth/
│   └── login-page/
├── dashboard/
│   └── dashboard-page.component.ts
├── pos/
│   ├── pos-page/
│   └── facades/
│       ├── pos-cart.facade.ts
│       └── pos-product.facade.ts
├── inventory/
│   ├── productos-page/
│   └── analisis-page/
├── clients/
├── sales/
└── users/
```

---

## 💡 Características Clave

- ✅ Login con PIN (simple para familia)
- ✅ Trabajo offline (localStorage)
- ✅ Variantes de productos (talla/color)
- ✅ Multi-usuario con tracking de vendedor
- ✅ Reportes y exportación
- ✅ Responsive (móvil y desktop)

---

## 📎 Relacionados

- [[00 - Angular Overview]]
- [[Core]]
- [[Features]]
- [[Facade Pattern]]
