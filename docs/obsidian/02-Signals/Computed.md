---
tags: [angular, signals, computed]
created: 2024-12-17
---

# 🧮 Computed - Valores Calculados Automáticos

> _"Una calculadora que siempre está actualizada"_

---

## 🎒 ¿Qué es Computed?

Un `computed` es un **valor que se calcula automáticamente** cuando cambian los signals de los que depende.

```
precio = signal(100)     ← Cambias esto
cantidad = signal(3)     ← O esto
                  ↓
total = computed(() =>   ← Y esto se actualiza SOLO
  precio() * cantidad()
)
```

---

## 🧪 Sintaxis Básica

```typescript
import { signal, computed } from '@angular/core';

// 📝 Signals base
precio = signal(100);
cantidad = signal(3);

// 🧮 Computed (se calcula automáticamente)
total = computed(() => this.precio() * this.cantidad());

// Uso
console.log(this.total()); // 300

// Cambias un signal
this.cantidad.set(5);

// El computed YA está actualizado
console.log(this.total()); // 500 (automático!)
```

---

## 🎯 Ejemplos Prácticos

### Carrito de Compras

```typescript
class CarritoComponent {
  items = signal<CartItem[]>([
    { name: 'Casaca', price: 150, quantity: 1 },
    { name: 'Jean', price: 90, quantity: 2 },
  ]);

  // 🧮 Subtotal (suma de todos los items)
  subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // 🧮 IGV (18% del subtotal)
  igv = computed(() => this.subtotal() * 0.18);

  // 🧮 Total (subtotal + IGV)
  total = computed(() => this.subtotal() + this.igv());

  // 🧮 Cantidad de items
  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  // 🧮 ¿Carrito vacío?
  isEmpty = computed(() => this.items().length === 0);
}
```

### En el template

```html
<div class="cart-summary">
  <p>Items: {{ itemCount() }}</p>
  <p>Subtotal: S/ {{ subtotal() | number:'1.2-2' }}</p>
  <p>IGV (18%): S/ {{ igv() | number:'1.2-2' }}</p>
  <p class="font-bold">Total: S/ {{ total() | number:'1.2-2' }}</p>

  @if (isEmpty()) {
  <p>El carrito está vacío</p>
  }
</div>
```

---

### Formulario con Validación

```typescript
class ProductoFormComponent {
  nombre = signal('');
  precio = signal(0);
  costo = signal(0);
  stock = signal(0);

  // 🧮 Ganancia por unidad
  ganancia = computed(() => this.precio() - this.costo());

  // 🧮 Margen de ganancia (%)
  margen = computed(() => {
    if (this.costo() === 0) return 0;
    return (this.ganancia() / this.costo()) * 100;
  });

  // 🧮 ¿Formulario válido?
  isValid = computed(
    () =>
      this.nombre().trim().length > 0 &&
      this.precio() > 0 &&
      this.costo() > 0 &&
      this.precio() > this.costo() &&
      this.stock() >= 0
  );

  // 🧮 Mensaje de error
  errorMessage = computed(() => {
    if (!this.nombre().trim()) return 'El nombre es requerido';
    if (this.precio() <= 0) return 'El precio debe ser mayor a 0';
    if (this.costo() <= 0) return 'El costo debe ser mayor a 0';
    if (this.precio() <= this.costo()) return 'El precio debe ser mayor al costo';
    return '';
  });
}
```

### En el template

```html
<form>
  <ui-input label="Nombre" [value]="nombre()" (valueChange)="nombre.set($event)" />
  <ui-input label="Precio" type="number" [value]="precio()" ... />
  <ui-input label="Costo" type="number" [value]="costo()" ... />

  <!-- Información calculada automáticamente -->
  <div class="mt-4 p-4 bg-stone-50 rounded-xl">
    <p>Ganancia: S/ {{ ganancia() | number:'1.2-2' }}</p>
    <p>Margen: {{ margen() | number:'1.1-1' }}%</p>
  </div>

  <!-- Mostrar error si existe -->
  @if (errorMessage()) {
  <p class="text-red-500">{{ errorMessage() }}</p>
  }

  <!-- Botón deshabilitado si no es válido -->
  <ui-button [disabled]="!isValid()">Guardar</ui-button>
</form>
```

---

### Filtrado de Lista

```typescript
class ProductosComponent {

  productos = signal<Product[]>([...]);
  busqueda = signal('');
  categoriaSeleccionada = signal<string | null>(null);

  // 🧮 Productos filtrados
  productosFiltrados = computed(() => {
    let resultado = this.productos();

    // Filtrar por categoría
    const cat = this.categoriaSeleccionada();
    if (cat) {
      resultado = resultado.filter(p => p.category === cat);
    }

    // Filtrar por búsqueda
    const query = this.busqueda().toLowerCase();
    if (query) {
      resultado = resultado.filter(p =>
        p.name.toLowerCase().includes(query)
      );
    }

    return resultado;
  });

  // 🧮 Categorías únicas
  categorias = computed(() => {
    const cats = new Set(this.productos().map(p => p.category));
    return Array.from(cats).sort();
  });

  // 🧮 Cantidad de resultados
  resultCount = computed(() => this.productosFiltrados().length);
}
```

---

## ⚠️ Reglas Importantes

### Solo Lectura

```typescript
// ❌ NO puedes hacer set en un computed
total.set(500); // ERROR!

// ✅ Cambia los signals base
precio.set(200); // El computed se recalcula solo
```

### Dependencias Automáticas

```typescript
// Angular detecta AUTOMÁTICAMENTE qué signals usas
total = computed(() => {
  return this.precio() * this.cantidad();
  //     ↑ Depende de precio
  //                    ↑ Depende de cantidad
});
```

### Evita Efectos Secundarios

```typescript
// ❌ Mal: efectos secundarios en computed
totalMalo = computed(() => {
  console.log('Calculando...');  // NO hagas esto
  localStorage.setItem(...);      // NI esto
  return this.precio() * this.cantidad();
});

// ✅ Bien: solo cálculos puros
totalBueno = computed(() => this.precio() * this.cantidad());
```

---

## 🆚 Computed vs Método

| Computed             | Método              |
| -------------------- | ------------------- |
| Se cachea (memoriza) | Se ejecuta cada vez |
| Reactivo             | No reactivo         |
| Solo lectura         | Puede modificar     |

```typescript
// ✅ Computed: se cachea, más eficiente
total = computed(() => this.precio() * this.cantidad());

// ❌ Método: se ejecuta en cada detección de cambios
getTotal() {
  return this.precio * this.cantidad;
}
```

---

## 💡 Reglas Zen de Computed

> [!important] Regla 1: Solo cálculos puros
> Sin console.log, sin localStorage, sin HTTP calls

> [!tip] Regla 2: Usa para derivar datos
> Si un valor depende de otros, usa computed

> [!note] Regla 3: No puedes escribir
> Computed es solo lectura, para escribir usa los signals base

---

## 📎 Relacionados

- [[Signal Básico]]
- [[Effect]]
- [[Signals vs RxJS]]
