---
tags: [angular, rutas, router, navegación]
created: 2024-12-20
---

# 🧭 app.routes.ts - El Mapa de tu App

> _"Cada URL lleva a un lugar diferente"_

---

## 🎒 ¿Qué es app.routes.ts?

Es el **mapa de navegación** de tu app:

- URL `/dashboard` → muestra Dashboard
- URL `/pos` → muestra Punto de Venta
- URL `/login` → muestra Login

---

## 📋 Tu Archivo de Rutas

```typescript
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // 🚪 RUTA PÚBLICA (sin login)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page/login-page.component')
      .then(m => m.LoginPageComponent)
  },

  // 🔒 RUTAS PRIVADAS (necesitan login)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => ... },
      { path: 'pos', loadComponent: () => ... },
      { path: 'inventario', loadComponent: () => ..., children: [...] },
      // ... más rutas
    ]
  },

  // 🔄 REDIRECCIONAMIENTOS
  { path: '**', redirectTo: 'login' }  // 404 → login
];
```

---

## 🗂️ Estructura de Rutas

```
/login                    → LoginPageComponent (SIN layout)
│
└── /                     → MainLayoutComponent (CON layout)
    ├── /dashboard           → DashboardPageComponent
    ├── /pos                 → PosPageComponent
    ├── /inventario
    │   ├── /productos          → ProductosPageComponent
    │   └── /analisis           → AnalisisPageComponent
    ├── /clients             → ClientsPageComponent
    ├── /reports             → ReportsPageComponent
    ├── /sales               → SalesHistoryComponent
    ├── /goals               → GoalsPageComponent
    └── /users               → UsersPageComponent
```

---

## 📦 Lazy Loading - Carga Perezosa

### ¿Qué es?

```typescript
// ❌ Sin lazy loading (carga TODO al inicio)
{ path: 'dashboard', component: DashboardComponent }

// ✅ Con lazy loading (carga SOLO cuando navegas)
{
  path: 'dashboard',
  loadComponent: () =>
    import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
}
```

### Analogía

```
Sin lazy loading:
  🏠 Entras a la casa → Prendes TODAS las luces
  💡💡💡💡💡💡💡💡 (desperdicio de energía)

Con lazy loading:
  🏠 Entras a la casa → Solo prendes la luz de la sala
  💡 (eficiente)
  🚶 Vas a la cocina → Prendes la luz de la cocina
  💡💡 (solo lo que necesitas)
```

---

## 🔒 Guards - Los Porteros

### authGuard

```typescript
// En app.routes.ts
{
  path: '',
  component: MainLayoutComponent,
  canActivate: [authGuard],  // 👈 El portero
  children: [...]
}
```

### ¿Cómo funciona?

```
Usuario navega a /dashboard
        ↓
authGuard pregunta: "¿Estás logueado?"
        ↓
  ┌─────┴─────┐
  │           │
  ▼           ▼
 ✅ Sí       ❌ No
  │           │
  ▼           ▼
Muestra     Redirige a
Dashboard    /login
```

---

## 🏗️ Rutas Anidadas (Children)

### Ejemplo: Inventario

```typescript
{
  path: 'inventario',
  loadComponent: () => import('./inventory-layout.component'),
  children: [
    { path: 'productos', loadComponent: () => ... },
    { path: 'analisis', loadComponent: () => ... },
    { path: '', redirectTo: 'productos', pathMatch: 'full' }
  ]
}
```

### Resultado

```
/inventario              → InventoryLayout (con <router-outlet>)
/inventario/productos    → ProductosPage (dentro del layout)
/inventario/analisis     → AnalisisPage (dentro del layout)
```

### El Layout Padre

```typescript
@Component({
  template: `
    <nav>
      <a routerLink="productos">Productos</a>
      <a routerLink="analisis">Análisis</a>
    </nav>
    <router-outlet></router-outlet>
    <!-- Hijos van aquí -->
  `,
})
export class InventoryLayoutComponent {}
```

---

## 🔄 Redirecciones

### Redirigir raíz a dashboard

```typescript
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
```

### Redirigir 404 a login

```typescript
{ path: '**', redirectTo: 'login' }  // ** = cualquier ruta no definida
```

### pathMatch: 'full' vs 'prefix'

```typescript
// 'full' = la URL debe ser EXACTAMENTE ''
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
// Solo redirige si la URL es exactamente "/"

// 'prefix' = la URL EMPIEZA con ''
{ path: '', redirectTo: 'dashboard', pathMatch: 'prefix' }
// TODAS las URLs empiezan con '', así que siempre redirige (malo)
```

---

## 🔗 RouterLink - Navegación en HTML

```html
<!-- Link simple -->
<a routerLink="/dashboard">Ir al Dashboard</a>

<!-- Link activo (clase CSS cuando estás en esa ruta) -->
<a routerLink="/dashboard" routerLinkActive="bg-stone-100"> Dashboard </a>

<!-- Link con parámetros -->
<a [routerLink]="['/producto', producto.id]">Ver Producto</a>
<!-- Genera: /producto/123 -->
```

---

## 🧭 Router - Navegación en TypeScript

```typescript
class MiComponent {
  private router = inject(Router);

  // Navegar simple
  irAlDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Navegar con parámetros
  verProducto(id: string) {
    this.router.navigate(['/producto', id]);
  }

  // Navegar con query params
  buscar(query: string) {
    this.router.navigate(['/buscar'], {
      queryParams: { q: query },
    });
  }
}
```

---

## 📊 Parámetros de Ruta

### Definir parámetro

```typescript
{ path: 'producto/:id', loadComponent: () => ... }
```

### Leer parámetro

```typescript
class ProductoComponent {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id'); // "123"
      this.cargarProducto(id);
    });
  }
}
```

---

## 💡 Reglas Zen de Rutas

> [!important] Regla 1: Lazy loading siempre
> `loadComponent` para todas las features

> [!tip] Regla 2: Un guard por responsabilidad
> `authGuard` para autenticación, `adminGuard` para roles

> [!note] Regla 3: Organiza por feature
> `/inventario/productos` no `/productos-inventario`

---

## 📎 Relacionados

- [[Layout]]
- [[Auth Guard]]
- [[Features]]
