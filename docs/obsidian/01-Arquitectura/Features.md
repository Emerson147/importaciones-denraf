---
tags: [angular, arquitectura, features]
created: 2024-12-17
---

# 🎨 Features - Las Habitaciones de tu Casa

> _"Cada habitación tiene su propósito"_

---

## 🎒 ¿Qué es una Feature?

Una feature es una **habitación de tu casa** donde pasa algo específico:

| Feature      | Habitación | Propósito          |
| ------------ | ---------- | ------------------ |
| `auth/`      | 🚪 Entrada | Login con PIN      |
| `dashboard/` | 📊 Oficina | Ver estadísticas   |
| `pos/`       | 🛒 Caja    | Vender productos   |
| `inventory/` | 📦 Almacén | Gestionar stock    |
| `clients/`   | 👥 Agenda  | Gestionar clientes |
| `sales/`     | 📜 Archivo | Ver historial      |

---

## 📁 Estructura de una Feature

```
features/
└── pos/                          ← La feature
    ├── pos-page/                     ← Página principal
    │   ├── pos-page.component.ts         Lógica
    │   ├── pos-page.component.html       Vista
    │   └── pos-page.component.css        Estilos
    │
    └── facades/                      ← Helpers (opcional)
        ├── pos-cart.facade.ts            Maneja el carrito
        └── pos-product.facade.ts         Maneja productos
```

---

## 🧪 Anatomía de un Componente

### El Decorador `@Component`

```typescript
@Component({
  // 📛 Nombre: cómo lo usas en HTML
  selector: 'app-dashboard-page',

  // 🎒 Soy independiente (no necesito módulo)
  standalone: true,

  // 🧰 Herramientas que uso
  imports: [
    CommonModule, // @if, @for, pipes
    UiButtonComponent, // Mis botones bonitos
  ],

  // 👁️ Cómo me veo
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  // ⚡ La lógica va aquí
}
```

---

## 🔌 Inyección de Servicios

### `inject()` - Pedir lo que necesitas

```typescript
export class DashboardPageComponent {
  // 🔌 "Hey Angular, dame el servicio de ventas"
  private salesService = inject(SalesService);

  // 🔌 "Y también el de productos"
  private productService = inject(ProductService);

  // 📊 Ahora puedo usarlos
  ventasHoy = this.salesService.todaySales;
  productos = this.productService.products;
}
```

### Analogía del Restaurante

```
👨‍🍳 Component: "Necesito ingredientes"
    │
    ▼
🏪 Angular: "Aquí tienes ProductService"
    │
    ▼
👨‍🍳 Component: "Ahora puedo cocinar"
```

---

## 🎯 Ejemplo: Login Page

### El Componente

```typescript
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  // 🔌 Servicios que necesito
  private authService = inject(AuthService);
  private router = inject(Router);

  // 📝 Estado local (signals)
  selectedUser = signal<User | null>(null);
  pin = signal('');
  error = signal('');

  // 👆 Usuario selecciona su perfil
  selectUser(userId: string) {
    const user = this.authService.getUsers().find((u) => u.id === userId);
    this.selectedUser.set(user || null);
    this.pin.set(''); // Limpiar PIN
    this.error.set(''); // Limpiar error
  }

  // 🔢 Usuario ingresa dígito del PIN
  onPinDigit(digit: string) {
    const newPin = this.pin() + digit;
    this.pin.set(newPin);

    // Si completó 4 dígitos, validar
    if (newPin.length === 4) {
      this.validatePin(newPin);
    }
  }

  // ✅ Validar PIN
  validatePin(pin: string) {
    const user = this.selectedUser();
    if (!user) return;

    if (this.authService.login(user.id, pin)) {
      this.router.navigate(['/dashboard']); // ✅ Entrar
    } else {
      this.error.set('PIN incorrecto'); // ❌ Error
      this.pin.set(''); // Limpiar
    }
  }
}
```

### La Vista (HTML)

```html
<!-- Selector de usuario -->
@if (!selectedUser()) {
<div class="grid grid-cols-3 gap-4">
  @for (user of users; track user.id) {
  <button (click)="selectUser(user.id)" class="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md">
    <span class="text-2xl">👤</span>
    <p class="mt-2 font-medium">{{ user.name }}</p>
  </button>
  }
</div>
}

<!-- Ingreso de PIN -->
@if (selectedUser()) {
<div class="text-center">
  <p class="text-lg mb-4">Hola, {{ selectedUser()!.name }}</p>

  <!-- 4 cuadritos para el PIN -->
  <div class="flex justify-center gap-3">
    @for (i of [0,1,2,3]; track i) {
    <div class="w-12 h-12 border-2 rounded-lg flex items-center justify-center">
      {{ pin()[i] ? '●' : '' }}
    </div>
    }
  </div>

  <!-- Mensaje de error -->
  @if (error()) {
  <p class="text-red-500 mt-4">{{ error() }}</p>
  }
</div>
}
```

---

## 🛒 Ejemplo: POS (Punto de Venta)

### Arquitectura con Facades

```
POS Component (orquestador)
    │
    ├── CartFacade        → Maneja el carrito
    │   ├── items
    │   ├── subtotal
    │   ├── total
    │   └── addItem()
    │
    ├── ProductFacade     → Maneja búsqueda
    │   ├── filteredProducts
    │   ├── categories
    │   └── search()
    │
    └── PaymentFacade     → Maneja pago
        ├── paymentMethod
        └── processPayment()
```

### El Componente (simplificado)

```typescript
@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PosCartFacade, PosProductFacade], // 👈 Facades locales
  templateUrl: './pos.component.html',
})
export class PosComponent {
  // 🔌 Facades (helpers especializados)
  cartFacade = inject(PosCartFacade);
  productFacade = inject(PosProductFacade);

  // 📊 Datos derivados de los facades
  productos = this.productFacade.filteredProducts;
  carrito = this.cartFacade.items;
  total = this.cartFacade.total;

  // 🛒 Agregar producto
  agregarProducto(product: Product) {
    this.cartFacade.addItem(product);
  }

  // 💳 Procesar venta
  procesarVenta() {
    // ... lógica de venta
  }
}
```

---

## 📦 Lazy Loading - Cargar Solo lo Necesario

### ¿Qué es?

Solo cargar la habitación cuando **entras a ella**.

### En las rutas

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    // 👇 No carga hasta que navegas a /dashboard
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'pos',
    // 👇 No carga hasta que navegas a /pos
    loadComponent: () => import('./features/pos/pos.component').then((m) => m.PosComponent),
  },
];
```

### Analogía

```
🏠 Casa con 10 habitaciones

❌ Sin lazy loading:
   → Enciendes TODAS las luces al entrar
   → 💡💡💡💡💡💡💡💡💡💡 (desperdicio)

✅ Con lazy loading:
   → Solo enciendes la luz de donde estás
   → 💡 (eficiente)
```

---

## 💡 Reglas Zen de Features

> [!important] Regla 1: Una feature, una funcionalidad
> POS = vender. Dashboard = estadísticas. No mezcles.

> [!tip] Regla 2: Componentes pequeños
> Si un componente tiene más de 200 líneas, divídelo.

> [!note] Regla 3: Facades para complejidad
> Si una feature es muy grande, usa facades.

---

## 📎 Relacionados

- [[Core]]
- [[Layout]]
- [[Shared]]
- [[Routing]]
- [[Facade Pattern]]
