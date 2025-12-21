---
tags: [angular, signals, estado]
created: 2024-12-17
---

# 📡 Signal Básico

> _"Una pizarra mágica que avisa cuando cambia"_

---

## 🎒 ¿Qué es un Signal?

Un Signal es una **caja que guarda un valor** y le dice a Angular cuando ese valor cambia.

```
📦 Signal = Caja con valor
   │
   ├── 👀 Puedes leer lo que hay dentro
   ├── ✏️ Puedes cambiar lo que hay dentro
   └── 📢 Avisa cuando algo cambia
```

---

## 🧪 Sintaxis Básica

### Crear un Signal

```typescript
import { signal } from '@angular/core';

// 📦 Crear caja con número
const contador = signal(0);

// 📦 Crear caja con texto
const nombre = signal('Juan');

// 📦 Crear caja con objeto
const usuario = signal({ name: 'Ana', age: 25 });

// 📦 Crear caja con lista (especificando tipo)
const productos = signal<Product[]>([]);
```

---

### Leer un Signal (con paréntesis)

```typescript
// ⚠️ SIEMPRE usa paréntesis para leer
console.log(contador()); // 0
console.log(nombre()); // "Juan"
```

En el template HTML:

```html
<p>{{ contador() }}</p>
<p>Hola, {{ nombre() }}</p>
```

> [!warning] Nunca olvides los paréntesis
> `contador` ← Esto es la caja
> `contador()` ← Esto es el valor dentro

---

### Escribir en un Signal

```typescript
// ✏️ Método 1: set() - Reemplazar completamente
contador.set(5); // Ahora es 5
nombre.set('María'); // Ahora es "María"

// ✏️ Método 2: update() - Basado en valor anterior
contador.update((val) => val + 1); // Si era 5, ahora es 6
contador.update((val) => val * 2); // Si era 6, ahora es 12

// Para objetos
usuario.update((u) => ({ ...u, age: 26 }));

// Para listas
productos.update((lista) => [...lista, nuevoProducto]);
```

---

## 🆚 set() vs update()

| Método     | Cuándo usar                | Ejemplo                     |
| ---------- | -------------------------- | --------------------------- |
| `set()`    | Nuevo valor independiente  | `nombre.set('Ana')`         |
| `update()` | Depende del valor anterior | `contador.update(v => v+1)` |

```typescript
// ❌ Mal: usar set cuando dependes del anterior
contador.set(contador() + 1); // Funciona pero no es ideal

// ✅ Bien: usar update
contador.update((val) => val + 1);
```

---

## 📋 Señales de Solo Lectura

```typescript
class ProductService {
  // 🔒 Privada: solo el servicio puede modificar
  private _productos = signal<Product[]>([]);

  // 👀 Pública: otros pueden leer, no escribir
  readonly products = this._productos.asReadonly();

  // ✅ Método para modificar (controlado)
  addProduct(product: Product) {
    this._productos.update((lista) => [...lista, product]);
  }
}
```

---

## 🎯 Ejemplo Práctico: Contador

```typescript
@Component({
  selector: 'app-contador',
  standalone: true,
  template: `
    <div class="flex items-center gap-4">
      <button (click)="decrementar()">-</button>
      <span class="text-2xl font-bold">{{ contador() }}</span>
      <button (click)="incrementar()">+</button>
    </div>
  `,
})
export class ContadorComponent {
  contador = signal(0);

  incrementar() {
    this.contador.update((val) => val + 1);
  }

  decrementar() {
    this.contador.update((val) => val - 1);
  }
}
```

---

## 🎯 Ejemplo Práctico: Lista de Productos

```typescript
@Component({
  selector: 'app-productos',
  standalone: true,
  template: `
    <ul>
      @for (producto of productos(); track producto.id) {
        <li>{{ producto.name }} - ${{ producto.price }}</li>
      }
    </ul>

    <button (click)="agregarProducto()">Agregar</button>
  `
})
export class ProductosComponent {

  productos = signal<Product[]>([
    { id: '1', name: 'Casaca', price: 150 },
    { id: '2', name: 'Jean', price: 90 }
  ]);

  agregarProducto() {
    const nuevo: Product = {
      id: Date.now().toString(),
      name: 'Nuevo Producto',
      price: 100
    };

    this.productos.update(lista => [...lista, nuevo]);
  }
}
```

---

## 💡 Reglas Zen de Signals

> [!important] Regla 1: Siempre paréntesis para leer
> `signal()` no `signal`

> [!tip] Regla 2: update() para depender del anterior
> Si necesitas el valor actual, usa `update()`

> [!note] Regla 3: asReadonly() para exponer
> Protege tus signals internos

---

## 📎 Relacionados

- [[Computed]]
- [[Effect]]
- [[Signals vs RxJS]]
