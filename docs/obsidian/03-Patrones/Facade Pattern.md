---
tags: [angular, patrones, facade]
created: 2024-12-17
---

# 🎭 Facade Pattern - Simplificar lo Complejo

> _"Una recepción que hace todo por ti"_

---

## 🎒 ¿Qué es el Patrón Facade?

Un Facade es una **capa que simplifica** algo complejo.

```
❌ Sin Facade:
   Componente → Servicio A
            → Servicio B
            → Servicio C
            → Lógica compleja
   (El componente hace todo)

✅ Con Facade:
   Componente → Facade → Servicio A
                      → Servicio B
                      → Servicio C
   (El Facade hace el trabajo sucio)
```

---

## 🏨 Analogía: El Hotel

```
❌ Sin recepcionista (sin Facade):
   Tú → Cocina (pedir comida)
   Tú → Limpieza (pedir toallas)
   Tú → Mantenimiento (arreglar TV)
   Tú → Lavandería (lavar ropa)
   (Tú haces todo)

✅ Con recepcionista (con Facade):
   Tú → Recepción → Todo lo demás
   (La recepción coordina todo)
```

---

## 🧪 Ejemplo: POS sin Facade

```typescript
// ❌ Componente hace todo (1000+ líneas)
class PosComponent {
  // Estado del carrito
  private cartItems = signal<CartItem[]>([]);
  subtotal = computed(() => ...);
  tax = computed(() => ...);
  total = computed(() => ...);

  // Estado de productos
  private searchQuery = signal('');
  private selectedCategory = signal<string | null>(null);
  filteredProducts = computed(() => ...);
  categories = computed(() => ...);

  // Estado de pago
  paymentMethod = signal<string>('');
  amountPaid = signal(0);
  change = computed(() => ...);

  // 50+ métodos...
  addToCart() { ... }
  removeFromCart() { ... }
  updateQuantity() { ... }
  clearCart() { ... }
  searchProducts() { ... }
  filterByCategory() { ... }
  processPayment() { ... }
  // ... etc
}
```

---

## 🧪 Ejemplo: POS con Facades

### El Componente (limpio y simple)

```typescript
// ✅ Componente solo orquesta
@Component({
  selector: 'app-pos',
  standalone: true,
  providers: [PosCartFacade, PosProductFacade, PosPaymentFacade],
  template: `...`,
})
class PosComponent {
  // 🔌 Facades especializados
  cartFacade = inject(PosCartFacade);
  productFacade = inject(PosProductFacade);
  paymentFacade = inject(PosPaymentFacade);

  // Uso simple
  agregarProducto(producto: Product) {
    this.cartFacade.addItem(producto);
  }

  buscar(query: string) {
    this.productFacade.search(query);
  }

  pagar() {
    this.paymentFacade.processPayment(this.cartFacade.items());
  }
}
```

---

### Cart Facade

```typescript
@Injectable()
export class PosCartFacade {
  // 📦 Estado privado
  private cartItems = signal<CartItem[]>([]);

  // 👀 Exposición pública (solo lectura)
  readonly items = this.cartItems.asReadonly();

  // 🧮 Computeds
  readonly subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  readonly tax = computed(() => this.subtotal() * 0.18);

  readonly total = computed(() => this.subtotal() + this.tax());

  readonly isEmpty = computed(() => this.cartItems().length === 0);

  // ✅ Métodos públicos
  addItem(product: Product, variant?: ProductVariant) {
    const existing = this.cartItems().find((item) => item.product.id === product.id);

    if (existing) {
      this.updateQuantity(product.id, 1);
    } else {
      this.cartItems.update((items) => [
        ...items,
        {
          product,
          quantity: 1,
          variant,
        },
      ]);
    }
  }

  removeItem(productId: string) {
    this.cartItems.update((items) => items.filter((item) => item.product.id !== productId));
  }

  updateQuantity(productId: string, change: number) {
    this.cartItems.update((items) =>
      items.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  }

  clear() {
    this.cartItems.set([]);
  }
}
```

---

### Product Facade

```typescript
@Injectable()
export class PosProductFacade {
  private productService = inject(ProductService);

  // 📦 Estado local del facade
  private searchQuery = signal('');
  private selectedCategory = signal<string | null>(null);
  private loading = signal(false);

  // 👀 Exposición
  readonly query = this.searchQuery.asReadonly();
  readonly category = this.selectedCategory.asReadonly();
  readonly isLoading = this.loading.asReadonly();

  // 🧮 Productos filtrados
  readonly filteredProducts = computed(() => {
    let products = this.productService.products();

    const cat = this.selectedCategory();
    if (cat) {
      products = products.filter((p) => p.category === cat);
    }

    const query = this.searchQuery().toLowerCase();
    if (query) {
      products = products.filter((p) => p.name.toLowerCase().includes(query));
    }

    return products;
  });

  // 🧮 Categorías únicas
  readonly categories = computed(() => {
    const cats = new Set(this.productService.products().map((p) => p.category));
    return Array.from(cats).sort();
  });

  // ✅ Métodos públicos
  search(query: string) {
    this.searchQuery.set(query);
  }

  filterByCategory(category: string | null) {
    this.selectedCategory.set(category);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
  }
}
```

---

## 📊 Beneficios del Facade

| Sin Facade                 | Con Facade                  |
| -------------------------- | --------------------------- |
| Componente de 1000+ líneas | Componente de ~100 líneas   |
| Difícil de mantener        | Fácil de mantener           |
| Difícil de testear         | Fácil de testear            |
| Lógica mezclada            | Separación clara            |
| Un archivo gigante         | Múltiples archivos pequeños |

---

## 🎯 Cuándo Usar Facade

### ✅ Usa Facade cuando:

- El componente tiene **más de 200 líneas** de lógica
- Hay **múltiples áreas de responsabilidad**
- Necesitas **reutilizar lógica** en varios componentes
- El componente es **difícil de entender**

### ❌ No uses Facade cuando:

- El componente es **simple** (< 100 líneas)
- Solo hay **una responsabilidad**
- No hay **lógica de negocio** significativa

---

## 🔧 Estructura de Carpetas

```
features/
└── pos/
    ├── pos-page/
    │   ├── pos-page.component.ts      ← Componente (orquestador)
    │   ├── pos-page.component.html
    │   └── pos-page.component.css
    │
    └── facades/                        ← Facades
        ├── index.ts                       Exportaciones
        ├── pos-cart.facade.ts             🛒 Carrito
        ├── pos-product.facade.ts          📦 Productos
        └── pos-payment.facade.ts          💳 Pagos
```

---

## ⚠️ Facade vs Service

| Facade                   | Service              |
| ------------------------ | -------------------- |
| Scope local (componente) | Scope global (app)   |
| `providers: [Facade]`    | `providedIn: 'root'` |
| Estado temporal          | Estado persistente   |
| Combina servicios        | Es independiente     |

```typescript
// 🏠 Service: uno para toda la app
@Injectable({ providedIn: 'root' })
export class ProductService { }

// 🎭 Facade: uno por componente
@Injectable()  // Sin providedIn
export class PosCartFacade { }

// Uso en componente
@Component({
  providers: [PosCartFacade]  // Nueva instancia para este componente
})
```

---

## 💡 Reglas Zen del Facade

> [!important] Regla 1: Un facade, una responsabilidad
> CartFacade = solo carrito. ProductFacade = solo productos.

> [!tip] Regla 2: El componente solo orquesta
> El componente conecta facades, no implementa lógica

> [!note] Regla 3: Facades son desechables
> Cuando el componente se destruye, el facade también

---

## 📎 Relacionados

- [[Core]]
- [[Features]]
- [[Singleton]]
- [[Dependency Injection]]
