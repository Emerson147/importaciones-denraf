---
tags: [angular, inputs, outputs, comunicación]
created: 2024-12-20
---

# 🔌 Inputs y Outputs - Comunicación entre Componentes

> _"Cómo hablan los componentes entre sí"_

---

## 🎒 ¿Qué son Inputs y Outputs?

```
Padre → [Input] → Hijo    (pasar datos)
Padre ← (Output) ← Hijo   (emitir eventos)
```

- **Input**: El padre ENVÍA datos al hijo
- **Output**: El hijo AVISA al padre que algo pasó

---

## 📥 Inputs - Recibir Datos

### Sintaxis Moderna

```typescript
import { input } from '@angular/core';

@Component({
  selector: 'app-producto-card',
})
export class ProductoCardComponent {
  // Input opcional con valor por defecto
  producto = input<Producto | null>(null);

  // Input requerido
  titulo = input.required<string>();

  // Input con transformación
  precio = input(0, { transform: (v: string) => parseFloat(v) });
}
```

### Uso en el Padre

```html
<app-producto-card [producto]="productoSeleccionado()" titulo="Mi Producto"> </app-producto-card>
```

### Sintaxis Antigua (todavía válida)

```typescript
@Input() producto: Producto | null = null;
@Input({ required: true }) titulo!: string;
```

---

## 📤 Outputs - Emitir Eventos

### Sintaxis Moderna

```typescript
import { output } from '@angular/core';

@Component({
  selector: 'app-producto-card',
})
export class ProductoCardComponent {
  producto = input.required<Producto>();

  // Outputs
  seleccionado = output<Producto>();
  eliminado = output<string>(); // Emite el ID

  onSeleccionar() {
    this.seleccionado.emit(this.producto());
  }

  onEliminar() {
    this.eliminado.emit(this.producto().id);
  }
}
```

### En el Template del Hijo

```html
<div class="card" (click)="onSeleccionar()">
  <h3>{{ producto().nombre }}</h3>
  <button (click)="onEliminar(); $event.stopPropagation()">Eliminar</button>
</div>
```

### Uso en el Padre

```html
<app-producto-card
  [producto]="prod"
  (seleccionado)="abrirDetalle($event)"
  (eliminado)="confirmarEliminacion($event)"
>
</app-producto-card>
```

```typescript
// En el componente padre
abrirDetalle(producto: Producto) {
  console.log('Producto seleccionado:', producto);
}

confirmarEliminacion(id: string) {
  console.log('Eliminar producto:', id);
}
```

---

## 🔄 Two-Way Binding con model()

### El Componente Hijo

```typescript
import { model } from '@angular/core';

@Component({
  selector: 'app-toggle',
})
export class ToggleComponent {
  // model() = input() + output() combinados
  checked = model(false);

  toggle() {
    this.checked.update((v) => !v);
  }
}
```

### Uso en el Padre

```html
<!-- Two-way binding con [( )] -->
<app-toggle [(checked)]="miValor" />

<!-- Es equivalente a: -->
<app-toggle [checked]="miValor()" (checkedChange)="miValor.set($event)" />
```

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────┐
│                    PADRE                         │
│                                                  │
│   productos = signal([...])                      │
│   productoSeleccionado = signal<Producto|null>() │
│                                                  │
│   seleccionar(p: Producto) {                     │
│     this.productoSeleccionado.set(p);            │
│   }                                              │
│                                                  │
│   ┌─────────────────────────────────────────┐   │
│   │           Template del Padre             │   │
│   │                                          │   │
│   │  @for (p of productos(); track p.id) {   │   │
│   │    <app-producto-card                    │   │
│   │      [producto]="p"          ←── INPUT   │   │
│   │      (seleccionado)="seleccionar($event)"│   │
│   │    />                        ←── OUTPUT  │   │
│   │  }                                       │   │
│   └─────────────────────────────────────────┘   │
│                         │                        │
└─────────────────────────┼────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────┐
│                     HIJO                         │
│            (ProductoCardComponent)               │
│                                                  │
│   producto = input.required<Producto>();         │
│   seleccionado = output<Producto>();             │
│                                                  │
│   onClick() {                                    │
│     this.seleccionado.emit(this.producto());     │
│   }                                              │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Ejemplo Completo: Lista de Productos

### Componente Padre (ProductosPage)

```typescript
@Component({
  selector: 'app-productos-page',
  imports: [ProductoCardComponent],
  template: `
    <h1>Productos</h1>

    @for (producto of productos(); track producto.id) {
    <app-producto-card
      [producto]="producto"
      [destacado]="producto.id === seleccionadoId()"
      (seleccionado)="onSeleccionar($event)"
      (eliminar)="onEliminar($event)"
    />
    } @if (seleccionado()) {
    <div class="detalle">Seleccionado: {{ seleccionado()!.nombre }}</div>
    }
  `,
})
export class ProductosPageComponent {
  private productService = inject(ProductService);

  productos = this.productService.products;
  seleccionado = signal<Producto | null>(null);
  seleccionadoId = computed(() => this.seleccionado()?.id);

  onSeleccionar(producto: Producto) {
    this.seleccionado.set(producto);
  }

  onEliminar(id: string) {
    this.productService.delete(id);
    if (this.seleccionadoId() === id) {
      this.seleccionado.set(null);
    }
  }
}
```

### Componente Hijo (ProductoCard)

```typescript
@Component({
  selector: 'app-producto-card',
  template: `
    <div class="card" [class.destacado]="destacado()" (click)="seleccionar()">
      <h3>{{ producto().nombre }}</h3>
      <p>S/ {{ producto().precio }}</p>
      <button (click)="eliminarClick($event)">🗑️</button>
    </div>
  `,
})
export class ProductoCardComponent {
  // Inputs
  producto = input.required<Producto>();
  destacado = input(false);

  // Outputs
  seleccionado = output<Producto>();
  eliminar = output<string>();

  seleccionar() {
    this.seleccionado.emit(this.producto());
  }

  eliminarClick(event: MouseEvent) {
    event.stopPropagation(); // No trigger el click del card
    this.eliminar.emit(this.producto().id);
  }
}
```

---

## 💡 Reglas Zen de Inputs/Outputs

> [!important] Regla 1: Datos bajan, eventos suben
> `[input]` para pasar datos, `(output)` para eventos

> [!tip] Regla 2: input.required para obligatorios
> TypeScript te avisa si olvidaste pasar el input

> [!note] Regla 3: Outputs emiten, no modifican
> El hijo avisa, el padre decide qué hacer

---

## 📎 Relacionados

- [[Componentes UI]]
- [[Signal Básico]]
- [[Código Moderno]]
