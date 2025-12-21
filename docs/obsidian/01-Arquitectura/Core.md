---
tags: [angular, arquitectura, core]
created: 2024-12-17
---

# 🧱 Core - Los Cimientos Invisibles

> _"Lo esencial es invisible a los ojos"_ — El Principito

---

## 🎒 ¿Qué es el Core?

Imagina una casa. El Core es lo que **no ves pero es vital**:

- 🔌 La electricidad
- 🚰 Las tuberías
- 🏗️ Los cimientos

Sin Core, nada funciona. Pero cuando está bien hecho, **ni lo notas**.

---

## 📁 Estructura

```
core/
├── 📂 auth/           🔐 Quién puede entrar
│   ├── auth.ts            El guardia
│   └── auth.guard.ts      El verificador de puertas
│
├── 📂 models/         📋 Los planos
│   └── index.ts           Product, Sale, User...
│
├── 📂 services/       🔧 Los trabajadores
│   ├── product.service.ts     Encargado de productos
│   ├── sales.service.ts       Encargado de ventas
│   └── toast.service.ts       El mensajero
│
└── 📂 theme/          🎨 El pintor
    └── theme.service.ts       Claro u oscuro
```

---

## 🔐 Auth - El Guardia de Seguridad

### ¿Qué hace?

Controla **quién puede entrar** a la aplicación.

### El Servicio (el cerebro)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // 📝 Lista de usuarios permitidos
  private usuarios = signal<User[]>([
    { id: '1', name: 'Yo', pin: '1234' },
    { id: '2', name: 'Mamá', pin: '5678' },
  ]);

  // 🚪 Usuario actual (quién está adentro)
  private usuarioActual = signal<User | null>(null);

  // ✅ ¿Está alguien adentro?
  isAuthenticated = computed(() => !!this.usuarioActual());

  // 🔑 Método para entrar
  login(userId: string, pin: string): boolean {
    const user = this.usuarios().find((u) => u.id === userId);

    if (user && user.pin === pin) {
      this.usuarioActual.set(user); // ✅ "Pasa!"
      return true;
    }
    return false; // ❌ "PIN incorrecto"
  }

  // 🚪 Método para salir
  logout() {
    this.usuarioActual.set(null);
  }
}
```

### El Guard (el verificador de puertas)

```typescript
// auth.guard.ts
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🚪 ¿Puede pasar?
  if (authService.isAuthenticated()) {
    return true; // ✅ "Adelante"
  }

  // 🚫 "No tienes permiso, ve al login"
  return router.parseUrl('/login');
};
```

### Uso en las rutas

```typescript
// app.routes.ts
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]  // 🛡️ "Solo usuarios autenticados"
}
```

---

## 📋 Models - Los Planos de Construcción

### ¿Qué son?

Son **plantillas** que dicen cómo debe verse cada cosa.

### Ejemplo: ¿Cómo es un Producto?

```typescript
interface Product {
  id: string; // 🏷️ Código único: "PROD-001"
  name: string; // 📛 Nombre: "Casaca Negra"
  price: number; // 💰 Precio: 150
  cost: number; // 💵 Costo: 80
  stock: number; // 📦 Cuántos hay: 10
  image: string | null; // 🖼️ Foto (opcional)
}
```

### ¿Por qué usar interfaces?

```typescript
// ❌ Sin interface (TypeScript no te ayuda)
const producto = {
  nombr: 'Casaca', // Error de tipeo, pero TS no lo detecta
  precio: '150', // String en vez de number, problema!
};

// ✅ Con interface (TypeScript te protege)
const producto: Product = {
  nombr: 'Casaca', // ❌ Error! "nombr" no existe en Product
  price: '150', // ❌ Error! Debe ser number, no string
};
```

> [!tip] Las interfaces son tu red de seguridad
> TypeScript te avisa antes de romper algo

---

## 🔧 Services - Los Trabajadores Especializados

### ¿Qué son?

Son **empleados expertos** que hacen trabajos específicos.

### Regla de Oro: `providedIn: 'root'`

```typescript
@Injectable({ providedIn: 'root' }) // 👈 "Uno solo para toda la tienda"
export class ProductService {}
```

Esto significa: **Solo hay UN ProductService** para toda la aplicación.

### Analogía del Almacén

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  // 📦 El almacén (fuente única de verdad)
  private productos = signal<Product[]>([
    { id: '1', name: 'Casaca', price: 150, stock: 10 },
    { id: '2', name: 'Jean', price: 90, stock: 20 },
  ]);

  // 👀 Ver todos los productos (solo lectura)
  readonly products = this.productos.asReadonly();

  // 🔍 Buscar un producto
  getById(id: string): Product | undefined {
    return this.productos().find((p) => p.id === id);
  }

  // ➖ Reducir stock (cuando vendes)
  reduceStock(id: string, cantidad: number): boolean {
    const producto = this.getById(id);

    if (!producto || producto.stock < cantidad) {
      return false; // ❌ "No hay suficiente"
    }

    // ✅ Actualizar stock
    this.productos.update((lista) =>
      lista.map((p) => (p.id === id ? { ...p, stock: p.stock - cantidad } : p))
    );

    return true;
  }
}
```

---

## 🔄 Cómo se Conectan

```
┌──────────────────────────────────────────────────────┐
│                     COMPONENTE                        │
│                     (Dashboard)                       │
├──────────────────────────────────────────────────────┤
│                          │                            │
│   inject(ProductService) │   inject(AuthService)     │
│            │             │          │                 │
│            ▼             │          ▼                 │
│  ┌─────────────────┐    │  ┌─────────────────┐       │
│  │ ProductService  │    │  │   AuthService   │       │
│  │   (Singleton)   │    │  │   (Singleton)   │       │
│  └─────────────────┘    │  └─────────────────┘       │
│            │             │          │                 │
│            ▼             │          ▼                 │
│      📦 productos        │    👤 usuarioActual       │
│       (signal)           │       (signal)            │
└──────────────────────────────────────────────────────┘
```

---

## 💡 Reglas Zen del Core

> [!important] Regla 1: Un servicio, una responsabilidad
> ProductService solo maneja productos
> SalesService solo maneja ventas

> [!tip] Regla 2: Nunca modifiques directamente
> Siempre usa métodos del servicio para cambiar datos

> [!note] Regla 3: Singleton = Una fuente de verdad
> Si hay dos "verdades", habrá conflictos

---

## 📎 Relacionados

- [[Features]]
- [[Signal Básico]]
- [[Singleton]]
- [[Dependency Injection]]
