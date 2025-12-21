---
tags: [angular, signals, effect]
created: 2024-12-17
---

# ⚡ Effect - Reaccionar a Cambios

> _"Una alarma que suena cuando algo cambia"_

---

## 🎒 ¿Qué es un Effect?

Un `effect` es código que se **ejecuta automáticamente** cuando cambian los signals que usa.

```
productos = signal([...])
      │
      ↓ cambia
      │
effect(() => {              ← Se ejecuta automáticamente
  localStorage.setItem(
    'products',
    JSON.stringify(productos())
  )
})
```

---

## 🧪 Sintaxis Básica

```typescript
import { signal, effect } from '@angular/core';

class ProductService {
  productos = signal<Product[]>([]);

  constructor() {
    // 🔔 Se ejecuta cada vez que productos cambia
    effect(() => {
      const lista = this.productos();
      console.log('Productos actualizados:', lista.length);
    });
  }
}
```

---

## 🎯 Ejemplos Prácticos

### Auto-guardar en LocalStorage

```typescript
@Injectable({ providedIn: 'root' })
class ProductService {
  private storage = inject(StorageService);

  private _productos = signal<Product[]>(this.loadFromStorage());

  readonly products = this._productos.asReadonly();

  constructor() {
    // 💾 Guardar automáticamente cuando cambia
    effect(() => {
      const productos = this._productos();
      this.storage.set('products', productos);
      console.log('✅ Productos guardados en localStorage');
    });
  }

  private loadFromStorage(): Product[] {
    return this.storage.get<Product[]>('products') || [];
  }
}
```

---

### Logging/Analytics

```typescript
class DashboardComponent {
  ventas = signal<Sale[]>([]);

  constructor() {
    // 📊 Log cuando cambian las ventas
    effect(() => {
      const total = this.ventas().length;
      console.log(`📈 Total ventas: ${total}`);

      // Enviar a analytics
      // analytics.track('ventas_actualizadas', { total });
    });
  }
}
```

---

### Sincronización con DOM

```typescript
class ChartComponent {
  datos = signal<number[]>([]);

  constructor() {
    // 📊 Actualizar gráfico cuando cambian los datos
    effect(() => {
      const data = this.datos();
      this.actualizarGrafico(data);
    });
  }

  private actualizarGrafico(data: number[]) {
    // Lógica para actualizar ApexCharts, Chart.js, etc.
  }
}
```

---

### Notificaciones

```typescript
class CartService {
  items = signal<CartItem[]>([]);
  private toast = inject(ToastService);

  constructor() {
    // 🔔 Notificar cuando el carrito cambia
    effect(() => {
      const count = this.items().length;

      if (count > 0) {
        this.toast.info(`🛒 ${count} items en el carrito`);
      }
    });
  }
}
```

---

## ⚠️ Cuándo Usar Effect

### ✅ Usa Effect Para:

```typescript
// 💾 Persistencia
effect(() => localStorage.setItem('data', JSON.stringify(this.data())));

// 📊 Analytics/Logging
effect(() => console.log('Valor cambió:', this.valor()));

// 🔄 Sincronización con APIs externas
effect(() => this.chart.update(this.datos()));

// 🔔 Notificaciones
effect(() => {
  if (this.stock() < 5) {
    this.notificar('Stock bajo');
  }
});
```

### ❌ NO Uses Effect Para:

```typescript
// ❌ Cálculos derivados → Usa computed
effect(() => {
  this.total = this.precio() * this.cantidad(); // MAL
});

// ✅ Correcto
total = computed(() => this.precio() * this.cantidad()); // BIEN
```

---

## 🧹 Limpieza con onCleanup

```typescript
class TimerComponent {
  segundos = signal(0);

  constructor() {
    effect((onCleanup) => {
      // Iniciar intervalo
      const interval = setInterval(() => {
        this.segundos.update((s) => s + 1);
      }, 1000);

      // 🧹 Limpiar cuando el effect se destruye
      onCleanup(() => {
        clearInterval(interval);
        console.log('Timer limpiado');
      });
    });
  }
}
```

---

## 📋 Effect con allowSignalWrites

Por defecto, no puedes modificar signals dentro de un effect. Si necesitas hacerlo:

```typescript
// ⚠️ Usa con cuidado
effect(
  () => {
    if (this.items().length === 0) {
      this.isEmpty.set(true);
    }
  },
  { allowSignalWrites: true }
);
```

> [!warning] Cuidado con allowSignalWrites
> Puede causar bucles infinitos si no tienes cuidado

---

## 🔄 Ciclo de Vida del Effect

```
1. Se crea el effect en el constructor
   ↓
2. Se ejecuta inmediatamente
   ↓
3. Angular detecta qué signals usó
   ↓
4. Cuando esos signals cambian → se re-ejecuta
   ↓
5. Cuando el componente se destruye → se limpia
```

---

## 🆚 Effect vs Computed

| Effect                    | Computed        |
| ------------------------- | --------------- |
| Efectos secundarios       | Cálculos puros  |
| console.log, localStorage | Derivar valores |
| Se ejecuta                | Retorna valor   |
| No retorna                | Siempre retorna |

```typescript
// Effect: para efectos secundarios
effect(() => {
  localStorage.setItem('count', this.contador().toString());
});

// Computed: para derivar valores
doble = computed(() => this.contador() * 2);
```

---

## 💡 Reglas Zen de Effect

> [!important] Regla 1: Solo para efectos secundarios
> localStorage, console.log, APIs externas

> [!tip] Regla 2: Evita modificar signals
> Si necesitas, usa `allowSignalWrites` con cuidado

> [!note] Regla 3: Usa onCleanup para limpiar
> Intervalos, subscripciones, event listeners

---

## 📎 Relacionados

- [[Signal Básico]]
- [[Computed]]
- [[Signals vs RxJS]]
