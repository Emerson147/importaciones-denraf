---
tags: [angular, patrones, singleton]
created: 2024-12-17
---

# 🎯 Singleton - Una Sola Instancia

> _"Solo puede haber uno"_

---

## 🎒 ¿Qué es Singleton?

Singleton significa que **solo existe UNA instancia** de algo en toda la aplicación.

```
❌ Sin Singleton:
   Dashboard → ProductService (instancia 1)
   POS       → ProductService (instancia 2)
   Inventory → ProductService (instancia 3)
   (Cada uno tiene su propia lista de productos - desastre!)

✅ Con Singleton:
   Dashboard ─┐
   POS       ─┼→ ProductService (única instancia)
   Inventory ─┘
   (Todos comparten la misma lista de productos)
```

---

## 🏪 Analogía: La Tienda

```
❌ Sin Singleton:
   Vendedor 1 tiene su propio inventario
   Vendedor 2 tiene su propio inventario
   Vendedor 3 tiene su propio inventario
   → Caos! Nadie sabe cuánto hay realmente

✅ Con Singleton:
   Un solo almacén central
   Todos los vendedores consultan el mismo almacén
   → Todos ven la misma información
```

---

## 🧪 Cómo Crear un Singleton

### La Magia: `providedIn: 'root'`

```typescript
@Injectable({
  providedIn: 'root', // 👈 Esta línea hace el singleton
})
export class ProductService {
  // Esta clase solo tendrá UNA instancia
}
```

### ¿Qué significa `providedIn: 'root'`?

```
'root' = la raíz de tu app
       = disponible en TODAS partes
       = UNA sola instancia compartida
```

---

## 🎯 Ejemplo: ProductService

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  // 📦 Una sola fuente de verdad
  private _productos = signal<Product[]>([
    { id: '1', name: 'Casaca', price: 150, stock: 10 },
    { id: '2', name: 'Jean', price: 90, stock: 20 },
  ]);

  // 👀 Exposición pública
  readonly products = this._productos.asReadonly();

  // ✅ Métodos que todos usan
  addProduct(product: Product) {
    this._productos.update((list) => [...list, product]);
  }

  reduceStock(productId: string, quantity: number) {
    this._productos.update((list) =>
      list.map((p) => (p.id === productId ? { ...p, stock: p.stock - quantity } : p))
    );
  }
}
```

### Uso en Dashboard

```typescript
class DashboardComponent {
  private productService = inject(ProductService);

  // Mismo ProductService que todos los demás
  productos = this.productService.products;
}
```

### Uso en POS

```typescript
class PosComponent {
  private productService = inject(ProductService);

  // Mismo ProductService que Dashboard
  productos = this.productService.products;

  vender(product: Product) {
    this.productService.reduceStock(product.id, 1);
    // Dashboard también verá el stock reducido!
  }
}
```

---

## 🔄 Flujo de Datos Singleton

```
┌─────────────────────────────────────────────────┐
│                                                 │
│             ProductService (Singleton)          │
│                                                 │
│    productos = signal([casaca, jean, ...])      │
│                                                 │
└──────────┬──────────────────────┬───────────────┘
           │                      │
           ▼                      ▼
    ┌──────────────┐       ┌──────────────┐
    │  Dashboard   │       │     POS      │
    │              │       │              │
    │ Lee productos│       │ Lee y modifica│
    └──────────────┘       └──────────────┘

Cuando POS modifica el stock → Dashboard lo ve inmediatamente
```

---

## 🆚 Singleton vs No-Singleton

### Singleton (providedIn: 'root')

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {}
```

- ✅ Una instancia para toda la app
- ✅ Datos compartidos
- ✅ Fuente única de verdad
- 📍 Uso: Servicios globales (auth, products, sales)

### No-Singleton (sin providedIn)

```typescript
@Injectable()  // Sin providedIn
export class CartFacade { }

// Se provee en un componente específico
@Component({
  providers: [CartFacade]  // Nueva instancia aquí
})
```

- ✅ Nueva instancia por componente
- ✅ Estado aislado
- ✅ Se destruye con el componente
- 📍 Uso: Facades, estado temporal

---

## 🎯 Cuándo Usar Singleton

### ✅ Usa Singleton para:

```typescript
// Autenticación (quién está logueado)
@Injectable({ providedIn: 'root' })
export class AuthService {}

// Productos (inventario central)
@Injectable({ providedIn: 'root' })
export class ProductService {}

// Ventas (historial central)
@Injectable({ providedIn: 'root' })
export class SalesService {}

// Notificaciones (sistema global)
@Injectable({ providedIn: 'root' })
export class ToastService {}

// Configuración/Theme
@Injectable({ providedIn: 'root' })
export class ThemeService {}
```

### ❌ NO uses Singleton para:

```typescript
// Estado de un formulario específico
export class FormFacade {}

// Estado de un modal
export class DialogFacade {}

// Carrito de compras temporal
export class CartFacade {}
```

---

## ⚠️ Problemas Comunes

### Problema: Múltiples instancias accidentales

```typescript
// ❌ Mal: crear nueva instancia manualmente
class MiComponent {
  productService = new ProductService(); // NO!
}

// ✅ Bien: usar inyección de dependencias
class MiComponent {
  productService = inject(ProductService); // Singleton
}
```

### Problema: Estado que debería ser local

```typescript
// ❌ Mal: estado de UI en singleton
@Injectable({ providedIn: 'root' })
export class GlobalService {
  isModalOpen = signal(false); // NO! Esto es estado local
}

// ✅ Bien: estado de UI en el componente
class MiComponent {
  isModalOpen = signal(false); // Correcto
}
```

---

## 💡 Reglas Zen del Singleton

> [!important] Regla 1: Solo para datos compartidos
> Si todos necesitan ver lo mismo → Singleton

> [!tip] Regla 2: Usa inject(), nunca new
> `inject(Service)` mantiene el singleton, `new Service()` lo rompe

> [!note] Regla 3: Combinable con Signals
> Singleton + Signal = Estado reactivo global

---

## 📎 Relacionados

- [[Core]]
- [[Dependency Injection]]
- [[Facade Pattern]]
- [[Signal Básico]]
