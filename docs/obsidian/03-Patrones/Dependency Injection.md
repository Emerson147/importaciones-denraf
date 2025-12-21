---
tags: [angular, patrones, di, dependency-injection]
created: 2024-12-17
---

# 💉 Dependency Injection - Pedir lo que Necesitas

> _"No traigas tus herramientas, pídelas prestadas"_

---

## 🎒 ¿Qué es Dependency Injection?

Es un patrón donde tú **pides lo que necesitas** en vez de crearlo tú mismo.

```
❌ Sin DI:
   "Voy a construir mi propio martillo"
   → Mucho trabajo, resultado inconsistente

✅ Con DI:
   "Hey Angular, dame un martillo"
   → Angular te da el martillo correcto
```

---

## 🧰 Analogía: La Ferretería

```
❌ Sin DI (haces todo tú):
   Quieres un tornillo → Fabricas el tornillo
   Quieres un martillo → Fabricas el martillo
   Quieres un clavo    → Fabricas el clavo
   (Agotador y propenso a errores)

✅ Con DI (pides lo que necesitas):
   Quieres un tornillo → "Angular, dame un tornillo"
   Quieres un martillo → "Angular, dame un martillo"
   Angular tiene todo en su ferretería (inyector)
```

---

## 🧪 Sintaxis: inject()

### La Forma Moderna

```typescript
import { inject } from '@angular/core';

class DashboardComponent {
  // 🔌 "Dame el servicio de productos"
  private productService = inject(ProductService);

  // 🔌 "Dame el servicio de ventas"
  private salesService = inject(SalesService);

  // 🔌 "Dame el router"
  private router = inject(Router);

  // Ahora puedo usarlos
  productos = this.productService.products;
}
```

### La Forma Antigua (constructor)

```typescript
// ❌ Forma antigua (todavía funciona, pero más verbosa)
class DashboardComponent {
  constructor(
    private productService: ProductService,
    private salesService: SalesService,
    private router: Router
  ) {}
}

// ✅ Forma moderna (más limpia)
class DashboardComponent {
  private productService = inject(ProductService);
  private salesService = inject(SalesService);
  private router = inject(Router);
}
```

---

## 🎯 ¿Qué Puedes Inyectar?

### Servicios que tú creas

```typescript
// Tu servicio
@Injectable({ providedIn: 'root' })
export class ProductService { }

// Inyección
private productService = inject(ProductService);
```

### Servicios de Angular

```typescript
// Router (navegación)
private router = inject(Router);

// ActivatedRoute (parámetros de ruta)
private route = inject(ActivatedRoute);

// HttpClient (llamadas HTTP)
private http = inject(HttpClient);
```

### Tokens de Configuración

```typescript
// DOCUMENT (el documento HTML)
private document = inject(DOCUMENT);

// PLATFORM_ID (servidor o navegador)
private platformId = inject(PLATFORM_ID);
```

---

## 🔄 Flujo de la Inyección

```
1. Componente pide ProductService
   │
   ▼
2. Angular busca en su "ferretería" (inyector)
   │
   ▼
3. ¿Ya existe una instancia?
   │
   ├── Sí → Devuelve la existente
   │
   └── No → Crea una nueva y la guarda
   │
   ▼
4. Componente recibe el servicio
```

---

## 📊 Niveles de Inyección

### Nivel 1: Root (toda la app)

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {}
```

```
App
├── Dashboard  → ProductService (misma instancia)
├── POS        → ProductService (misma instancia)
└── Inventory  → ProductService (misma instancia)
```

### Nivel 2: Componente (solo ese componente)

```typescript
@Component({
  providers: [CartFacade], // Nueva instancia solo aquí
})
export class PosComponent {}
```

```
App
├── Dashboard  → (no tiene CartFacade)
├── POS        → CartFacade (instancia 1)
│   └── CartButton → CartFacade (misma instancia 1)
└── Otra página
    └── POS    → CartFacade (instancia 2, diferente!)
```

---

## 🎯 Ejemplo Completo

### El Servicio

```typescript
// product.service.ts
@Injectable({ providedIn: 'root' })
export class ProductService {
  private productos = signal<Product[]>([]);

  readonly products = this.productos.asReadonly();

  addProduct(product: Product) {
    this.productos.update((list) => [...list, product]);
  }
}
```

### El Componente que lo usa

```typescript
// dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  template: `
    <h1>Productos: {{ productos().length }}</h1>

    @for (producto of productos(); track producto.id) {
    <div>{{ producto.name }}</div>
    }

    <button (click)="agregar()">Agregar</button>
  `,
})
export class DashboardComponent {
  // 🔌 Pido el servicio
  private productService = inject(ProductService);

  // 👀 Uso sus datos
  productos = this.productService.products;

  // 🔧 Uso sus métodos
  agregar() {
    this.productService.addProduct({
      id: Date.now().toString(),
      name: 'Nuevo Producto',
      price: 100,
    });
  }
}
```

---

## 🆚 Por qué DI es Mejor

### ❌ Sin DI (crear manualmente)

```typescript
class DashboardComponent {
  // Problema: crea una nueva instancia cada vez
  private productService = new ProductService();

  // Problema: si ProductService necesita otras dependencias,
  // tú tienes que crearlas también
  // new ProductService(new HttpClient(), new StorageService(), ...)
}
```

### ✅ Con DI

```typescript
class DashboardComponent {
  // Angular maneja todo: instancias, dependencias, ciclo de vida
  private productService = inject(ProductService);
}
```

---

## 📋 Beneficios Clave

| Aspecto               | Sin DI         | Con DI              |
| --------------------- | -------------- | ------------------- |
| Crear servicios       | Tú lo haces    | Angular lo hace     |
| Dependencias anidadas | Tú las manejas | Angular las maneja  |
| Testing               | Difícil        | Fácil (puedes mock) |
| Singleton             | Manual         | Automático          |
| Mantenimiento         | Complejo       | Simple              |

---

## 🧪 DI para Testing

```typescript
// En tests, puedes reemplazar servicios reales
// con versiones fake (mocks)

// El servicio real
@Injectable({ providedIn: 'root' })
class ProductService {
  getProducts() {
    return this.http.get('/api/products'); // Llama al servidor
  }
}

// El mock para tests
class MockProductService {
  getProducts() {
    return of([{ id: '1', name: 'Test' }]); // Datos fake
  }
}

// En el test
TestBed.configureTestingModule({
  providers: [{ provide: ProductService, useClass: MockProductService }],
});
```

---

## 💡 Reglas Zen de DI

> [!important] Regla 1: Siempre usa inject()
> Nunca uses `new Service()`, siempre `inject(Service)`

> [!tip] Regla 2: Un servicio = una responsabilidad
> `ProductService` solo productos, `SalesService` solo ventas

> [!note] Regla 3: providedIn determina el scope
> `'root'` = global, sin providedIn = local

---

## 📎 Relacionados

- [[Core]]
- [[Singleton]]
- [[Facade Pattern]]
- [[Features]]
