---
tags: [angular, arquitectura, routing]
created: 2024-12-17
---

# 🧭 Routing - El GPS de tu App

> _"Cada puerta lleva a una habitación diferente"_

---

## 🎒 ¿Qué es el Routing?

El Router es el **GPS de tu aplicación**: sabe a qué página ir según la URL.

```
URL: /dashboard  →  DashboardComponent
URL: /pos        →  PosComponent
URL: /inventario →  InventoryComponent
```

---

## 📁 Archivo de Rutas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // 🚪 Login (SIN layout, SIN protección)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },

  // 🏠 Rutas privadas (CON layout, CON protección)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // 🛡️ Solo usuarios logueados
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'pos',
        loadComponent: () => import('./features/pos/pos.component').then((m) => m.PosComponent),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventory/inventory.component').then((m) => m.InventoryComponent),
      },
    ],
  },

  // 🔄 Redireccionamiento (rutas desconocidas → login)
  { path: '**', redirectTo: 'login' },
];
```

---

## 🔒 Guards - Los Porteros

### ¿Qué es un Guard?

Un Guard es un **portero** que decide si puedes pasar o no.

```typescript
// auth.guard.ts
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // ✅ Puede pasar
  }

  // ❌ No puede pasar, redirigir a login
  return router.parseUrl('/login');
};
```

### Tipos de Guards

| Guard           | ¿Cuándo se usa?            |
| --------------- | -------------------------- |
| `canActivate`   | ¿Puede entrar a esta ruta? |
| `canDeactivate` | ¿Puede salir de esta ruta? |
| `canMatch`      | ¿Esta ruta aplica?         |

---

## 🧭 Navegación

### En HTML (RouterLink)

```html
<!-- Navegación simple -->
<a routerLink="/dashboard">Ir al Dashboard</a>

<!-- Con parámetros -->
<a [routerLink]="['/producto', producto.id]">Ver Producto</a>

<!-- Clases activas -->
<a routerLink="/dashboard" routerLinkActive="bg-stone-100 font-bold"> Dashboard </a>
```

### En TypeScript (Router)

```typescript
class MiComponent {
  private router = inject(Router);

  irAlDashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAlProducto(id: string) {
    this.router.navigate(['/producto', id]);
  }

  irConQueryParams() {
    this.router.navigate(['/buscar'], {
      queryParams: { q: 'casaca', categoria: 'ropa' },
    });
  }
}
```

---

## 📦 Lazy Loading

### ¿Qué es?

Cargar componentes **solo cuando se necesitan**.

```typescript
// ❌ Sin lazy loading (carga todo al inicio)
{ path: 'dashboard', component: DashboardComponent }

// ✅ Con lazy loading (carga cuando navegas)
{
  path: 'dashboard',
  loadComponent: () =>
    import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
}
```

### Analogía

```
🏠 Casa con 10 habitaciones

Sin lazy loading:
  Abres la puerta → Enciendes TODAS las luces
  💡💡💡💡💡💡💡💡💡💡 (desperdicio)

Con lazy loading:
  Abres la puerta → Solo enciendes donde estás
  💡 (eficiente)
```

---

## 🎯 Rutas con Parámetros

### Parámetros de ruta

```typescript
// En routes
{ path: 'producto/:id', component: ProductoComponent }

// En el componente
class ProductoComponent {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Forma reactiva
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Producto:', id);
    });
  }
}
```

### Query params

```typescript
// URL: /buscar?q=casaca&categoria=ropa

class BuscarComponent {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const query = params.get('q');
      const categoria = params.get('categoria');
    });
  }
}
```

---

## 🏗️ Rutas Anidadas (Children)

```typescript
{
  path: 'inventario',
  component: InventoryLayoutComponent,
  children: [
    { path: 'productos', component: ProductosComponent },
    { path: 'analisis', component: AnalisisComponent },
    { path: '', redirectTo: 'productos', pathMatch: 'full' }
  ]
}
```

### El Layout padre

```typescript
@Component({
  template: `
    <div class="flex">
      <nav>
        <a routerLink="productos">Productos</a>
        <a routerLink="analisis">Análisis</a>
      </nav>

      <main>
        <router-outlet></router-outlet>
        <!-- Aquí van los hijos -->
      </main>
    </div>
  `,
})
export class InventoryLayoutComponent {}
```

---

## 💡 Reglas Zen del Routing

> [!important] Regla 1: Lazy loading siempre
> Usa `loadComponent` para todas las features

> [!tip] Regla 2: Guards para protección
> Nunca dejes rutas sensibles sin guard

> [!note] Regla 3: Una ruta = Un propósito
> `/productos` muestra productos, `/ventas` muestra ventas

---

## 📎 Relacionados

- [[Core]]
- [[Features]]
- [[Layout]]
- [[Auth Guard]]
