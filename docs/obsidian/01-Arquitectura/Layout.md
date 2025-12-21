---
tags: [angular, arquitectura, layout]
created: 2024-12-17
---

# 🖼️ Layout - La Estructura Visible

> _"El marco que sostiene el cuadro"_

---

## 🎒 ¿Qué es el Layout?

El Layout es la **estructura que siempre ves**:

- 🧭 El sidebar (menú lateral)
- 📊 El topbar (barra superior)
- 📄 El área de contenido

```
┌─────────────────────────────────────────────────┐
│                   TOPBAR                         │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│          │                                       │
│  SIDEBAR │         CONTENIDO                     │
│          │        (Features)                     │
│          │                                       │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

---

## 📁 Estructura

```
layout/
├── main-layout.component.ts      ← Lógica
├── main-layout.component.html    ← Vista
└── main-layout.component.css     ← Estilos
```

---

## 🧪 El Componente Principal

```typescript
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, // 👈 Donde van las features
    RouterLink, // 👈 Para navegación
    RouterLinkActive, // 👈 Resaltar link activo
  ],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {
  authService = inject(AuthService);

  // 📊 Estado del sidebar
  sidebarCollapsed = signal(false);

  // 📱 Menú móvil
  mobileMenuOpen = signal(false);

  // 🔄 Toggle sidebar
  toggleSidebar() {
    this.sidebarCollapsed.update((val) => !val);
  }

  // 🚪 Cerrar sesión
  logout() {
    this.authService.logout();
  }
}
```

---

## 📄 La Vista (HTML)

```html
<div class="flex min-h-screen bg-stone-50">
  <!-- 🧭 SIDEBAR -->
  <aside class="w-64 bg-white border-r border-stone-100" [class.w-20]="sidebarCollapsed()">
    <!-- Logo -->
    <div class="p-4 border-b border-stone-100">
      <h1 class="text-xl font-bold">DENRAF</h1>
    </div>

    <!-- Navegación -->
    <nav class="p-4 space-y-2">
      <a
        routerLink="/dashboard"
        routerLinkActive="bg-stone-100"
        class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50"
      >
        <span class="material-icons">dashboard</span>
        @if (!sidebarCollapsed()) {
        <span>Dashboard</span>
        }
      </a>

      <a
        routerLink="/pos"
        routerLinkActive="bg-stone-100"
        class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50"
      >
        <span class="material-icons">point_of_sale</span>
        @if (!sidebarCollapsed()) {
        <span>Punto de Venta</span>
        }
      </a>

      <a
        routerLink="/inventario"
        routerLinkActive="bg-stone-100"
        class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50"
      >
        <span class="material-icons">inventory_2</span>
        @if (!sidebarCollapsed()) {
        <span>Inventario</span>
        }
      </a>
    </nav>

    <!-- Usuario actual -->
    <div class="absolute bottom-0 left-0 right-0 p-4 border-t">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
          {{ authService.currentUser()?.name?.charAt(0) }}
        </div>
        @if (!sidebarCollapsed()) {
        <div>
          <p class="font-medium">{{ authService.currentUser()?.name }}</p>
          <button (click)="logout()" class="text-sm text-stone-500">Cerrar sesión</button>
        </div>
        }
      </div>
    </div>
  </aside>

  <!-- 📄 CONTENIDO PRINCIPAL -->
  <main class="flex-1 p-6">
    <!-- 👇 Aquí van las features -->
    <router-outlet></router-outlet>
  </main>
</div>
```

---

## 🔑 El Mágico `<router-outlet>`

```html
<router-outlet></router-outlet>
```

Este es el **hueco mágico** donde Angular pone la feature según la URL:

| URL           | ¿Qué se muestra?     |
| ------------- | -------------------- |
| `/dashboard`  | `DashboardComponent` |
| `/pos`        | `PosComponent`       |
| `/inventario` | `InventoryComponent` |

### Analogía

```
📺 El <router-outlet> es como una TV

URL = El canal que seleccionas
Feature = El programa que aparece

Cambias de canal → Cambia el programa
El TV (layout) sigue siendo el mismo
```

---

## 📡 Router con Layout

```typescript
// app.routes.ts
export const routes: Routes = [
  // 🚪 Login (SIN layout)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component')
  },

  // 🏠 Rutas protegidas (CON layout)
  {
    path: '',
    component: MainLayoutComponent,  // 👈 El marco
    canActivate: [authGuard],        // 👈 Solo autenticados
    children: [
      { path: 'dashboard', loadComponent: () => ... },
      { path: 'pos', loadComponent: () => ... },
      { path: 'inventario', loadComponent: () => ... },
    ]
  }
];
```

---

## 🎨 Tailwind para Layout Zen

### Colores minimalistas

```html
<!-- Fondo suave -->
<div class="bg-stone-50">
  <!-- Sidebar blanco -->
  <aside class="bg-white border-r border-stone-100">
    <!-- Sombras sutiles -->
    <div class="shadow-sm hover:shadow-md"></div>
  </aside>
</div>
```

### Espaciado consistente

```html
<!-- Padding -->
<div class="p-4">
  <!-- 16px -->
  <div class="p-6">
    <!-- 24px -->

    <!-- Gap entre elementos -->
    <div class="space-y-2">
      <!-- 8px vertical -->
      <div class="gap-3"><!-- 12px en grid/flex --></div>
    </div>
  </div>
</div>
```

---

## 💡 Reglas Zen del Layout

> [!important] Regla 1: El layout no tiene lógica de negocio
> Solo estructura, navegación, y estado visual (sidebar open/closed)

> [!tip] Regla 2: Responsive primero
> Usa clases de Tailwind como `md:` y `lg:`

> [!note] Regla 3: Consistencia visual
> Mismos colores, espaciados y bordes en todo

---

## 📎 Relacionados

- [[Core]]
- [[Features]]
- [[Shared]]
- [[Routing]]
