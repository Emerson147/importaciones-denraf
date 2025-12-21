---
tags: [angular, signals, rxjs, comparacion]
created: 2024-12-17
---

# 🆚 Signals vs RxJS

> _"Elige la herramienta correcta para el trabajo correcto"_

---

## 🎒 Resumen Rápido

| Característica       | Signals        | RxJS                   |
| -------------------- | -------------- | ---------------------- |
| Complejidad          | 😊 Simple      | 😰 Complejo            |
| Curva de aprendizaje | Fácil          | Difícil                |
| Para estado local    | ✅ Perfecto    | ⚠️ Overkill            |
| Para flujos de datos | ⚠️ Limitado    | ✅ Perfecto            |
| Suscripciones        | No necesita    | Necesita desuscribirse |
| Memory leaks         | Casi imposible | Común si olvidas       |

---

## 📊 Analogía Simple

```
🎯 Signals = Una pizarra
   - Escribes un valor
   - Todos ven el valor actual
   - Simple

📺 RxJS = Un canal de TV
   - Emite valores en el tiempo
   - Tienes que sintonizarte (subscribe)
   - Tienes que desconectarte (unsubscribe)
   - Más poderoso pero más complejo
```

---

## 🧪 Comparación de Código

### Estado Simple (Contador)

**Con RxJS (el viejo):**

```typescript
import { BehaviorSubject } from 'rxjs';

class ContadorComponent implements OnDestroy {
  private contador$ = new BehaviorSubject<number>(0);
  private subscription!: Subscription;

  valor = 0;

  ngOnInit() {
    // 🔗 Tengo que suscribirme
    this.subscription = this.contador$.subscribe((val) => {
      this.valor = val;
    });
  }

  incrementar() {
    this.contador$.next(this.contador$.getValue() + 1);
  }

  ngOnDestroy() {
    // ⚠️ Si olvido esto = memory leak
    this.subscription.unsubscribe();
  }
}
```

**Con Signals (el nuevo):**

```typescript
import { signal } from '@angular/core';

class ContadorComponent {
  contador = signal(0);

  incrementar() {
    this.contador.update((val) => val + 1);
  }

  // ✅ No necesito ngOnDestroy
  // ✅ No necesito suscribirme
  // ✅ No hay memory leaks
}
```

---

### Lista de Productos

**Con RxJS:**

```typescript
class ProductosComponent implements OnDestroy {
  private productos$ = new BehaviorSubject<Product[]>([]);
  private destroy$ = new Subject<void>();

  productosFiltrados: Product[] = [];
  busqueda = '';

  ngOnInit() {
    combineLatest([this.productos$, this.busqueda$])
      .pipe(
        takeUntil(this.destroy$),
        map(([productos, busqueda]) => productos.filter((p) => p.name.includes(busqueda)))
      )
      .subscribe((filtrados) => {
        this.productosFiltrados = filtrados;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Con Signals:**

```typescript
class ProductosComponent {
  productos = signal<Product[]>([]);
  busqueda = signal('');

  // ✅ Se actualiza automáticamente
  productosFiltrados = computed(() =>
    this.productos().filter((p) => p.name.includes(this.busqueda()))
  );

  // No hay ngOnDestroy, no hay memory leaks
}
```

---

## 🎯 Cuándo Usar Cada Uno

### ✅ Usa Signals Para:

```typescript
// Estado local del componente
isOpen = signal(false);
contador = signal(0);
usuario = signal<User | null>(null);

// Valores derivados
total = computed(() => this.precio() * this.cantidad());
isValid = computed(() => this.nombre().length > 0);

// Estado de servicios
private _productos = signal<Product[]>([]);
readonly products = this._productos.asReadonly();
```

### ✅ Usa RxJS Para:

```typescript
// HTTP calls
this.http.get<Product[]>('/api/products').subscribe(...);

// WebSockets (datos en tiempo real)
this.socket.messages$.subscribe(...);

// Eventos complejos con debounce
this.busqueda$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.http.get(`/search?q=${query}`))
).subscribe(...);

// Múltiples fuentes que necesitan combinarse
combineLatest([
  this.usuario$,
  this.permisos$,
  this.configuracion$
]).subscribe(...);
```

---

## 🔄 Conversión entre Signals y RxJS

### Signal → Observable

```typescript
import { toObservable } from '@angular/core/rxjs-interop';

contador = signal(0);

// Convertir a Observable
contador$ = toObservable(this.contador);

// Ahora puedo usar operadores RxJS
this.contador$.pipe(
  debounceTime(300),
  map(val => val * 2)
).subscribe(...);
```

### Observable → Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// Tengo un Observable
productos$ = this.http.get<Product[]>('/api/products');

// Convertir a Signal
productos = toSignal(this.productos$, { initialValue: [] });

// Ahora puedo usarlo como signal
console.log(this.productos());
```

---

## 📊 Tabla de Decisión

| Necesitas...                               | Usa             |
| ------------------------------------------ | --------------- |
| Estado simple (true/false, número, objeto) | Signal          |
| Valor derivado de otros                    | Computed        |
| Reaccionar a cambios (localStorage, log)   | Effect          |
| HTTP calls                                 | RxJS + toSignal |
| WebSockets                                 | RxJS            |
| Debounce, throttle, retry                  | RxJS            |
| Combinar múltiples fuentes async           | RxJS            |

---

## 🧠 Regla de Oro

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   🎯 REGLA DE ORO                               │
│                                                 │
│   Empieza con Signals.                          │
│   Si necesitas operadores complejos,            │
│   convierte a RxJS.                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔥 Ejemplo Completo: Servicio de Productos

```typescript
@Injectable({ providedIn: 'root' })
class ProductService {
  private http = inject(HttpClient);

  // 📦 Estado local con Signal
  private _productos = signal<Product[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // 👀 Exposición pública
  readonly products = this._productos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // 🧮 Computeds
  readonly activeProducts = computed(() => this._productos().filter((p) => p.stock > 0));

  readonly totalValue = computed(() =>
    this._productos().reduce((sum, p) => sum + p.price * p.stock, 0)
  );

  // 🌐 HTTP con RxJS, resultado a Signal
  loadProducts() {
    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<Product[]>('/api/products')
      .pipe(
        catchError((err) => {
          this._error.set('Error al cargar productos');
          return of([]);
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe((products) => {
        this._productos.set(products);
      });
  }

  // ➕ Operación local
  addProduct(product: Product) {
    this._productos.update((list) => [...list, product]);
  }
}
```

---

## 💡 Reglas Zen

> [!important] Regla 1: Signals por defecto
> Empieza con signals, migra a RxJS solo si es necesario

> [!tip] Regla 2: toSignal para HTTP
> Convierte Observables HTTP a Signals para consistencia

> [!note] Regla 3: RxJS para flujos complejos
> WebSockets, debounce, retry, race conditions → RxJS

---

## 📎 Relacionados

- [[Signal Básico]]
- [[Computed]]
- [[Effect]]
- [[Core]]
