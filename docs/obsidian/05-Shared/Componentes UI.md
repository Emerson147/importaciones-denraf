---
tags: [angular, shared, ui, componentes]
created: 2024-12-20
---

# 🧩 Componentes UI - Bloques de LEGO

> _"Construye una vez, usa en todas partes"_

---

## 🎒 ¿Qué son los Componentes UI?

Imagina que tienes una **caja de LEGO**. Cada pieza es diferente:

- 🔲 Bloques cuadrados (botones)
- 📝 Bloques rectangulares (inputs)
- 🏷️ Bloques pequeños (badges)
- 🪟 Puertas (modales)

Los **Componentes UI** son como esas piezas de LEGO. Los construyes UNA VEZ y los usas en MUCHOS lugares.

---

## 📁 Estructura de la Caja de LEGO

```
shared/ui/
├── 📄 index.ts               ← Lista de todas las piezas
│
├── 🔘 ui-button/             ← Botón
├── 📝 ui-input/              ← Campo de texto
├── 🏷️ ui-badge/              ← Etiqueta colorida
├── 🪟 ui-animated-dialog/    ← Ventana emergente
├── 📢 ui-toast/              ← Notificación flotante
├── 📊 ui-kpi-card/           ← Tarjeta de estadísticas
├── 🧾 ui-ticket/             ← Ticket de venta
└── ... (14 componentes más)
```

---

## 🔘 El Botón - ui-button

### ¿Qué es?

Un botón bonito que puedes personalizar.

### El Código Actual

```typescript
@Component({
  selector: 'app-ui-button',
  standalone: true, // 🎒 Soy independiente
  template: `
    <button [class]="classes" [disabled]="disabled">
      <ng-content></ng-content>
      <!-- Lo que pongas dentro -->
    </button>
  `,
})
export class UiButtonComponent {
  @Input() variant = 'default'; // Color del botón
  @Input() size = 'default'; // Tamaño
  @Input() disabled = false; // ¿Deshabilitado?

  @Output() onClick = new EventEmitter(); // Cuando hacen click
}
```

### ¿Cómo usarlo?

```html
<!-- Botón normal -->
<app-ui-button> Guardar </app-ui-button>

<!-- Botón rojo (destructivo) -->
<app-ui-button variant="destructive"> Eliminar </app-ui-button>

<!-- Botón pequeño -->
<app-ui-button size="sm"> Cancelar </app-ui-button>

<!-- Con acción -->
<app-ui-button (onClick)="guardarProducto()"> Guardar Producto </app-ui-button>
```

### Analogía

```
Botón = Una pieza de LEGO que puedes pintar

variant="default"      → 🔵 Azul
variant="destructive"  → 🔴 Rojo
variant="outline"      → ⬜ Solo borde
variant="ghost"        → 👻 Transparente
```

---

## 📝 El Input - ui-input

### ¿Qué es?

Un campo donde el usuario escribe texto.

### El Código

```typescript
@Component({
  selector: 'app-ui-input',
  template: `
    <input [type]="type" [placeholder]="placeholder" [value]="value" (input)="onInput($event)" />
  `,
})
export class UiInputComponent {
  @Input() type = 'text'; // text, number, email, password
  @Input() placeholder = ''; // Texto de ayuda
  @Input() value = ''; // Valor actual

  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.valueChange.emit(val); // Avisa que cambió
  }
}
```

### ¿Cómo usarlo?

```html
<!-- Input simple -->
<app-ui-input placeholder="Escribe tu nombre" (valueChange)="nombre = $event" />

<!-- Input de número -->
<app-ui-input
  type="number"
  placeholder="Precio"
  [value]="precio"
  (valueChange)="precio = +$event"
/>
```

### Analogía

```
Input = Una caja vacía donde metes cosas

type="text"     → 📝 Letras
type="number"   → 🔢 Números
type="password" → 🔒 Puntitos secretos
type="email"    → 📧 Correo
```

---

## 🏷️ El Badge - ui-badge

### ¿Qué es?

Una etiqueta pequeña y colorida para mostrar estados.

### El Código

```typescript
@Component({
  selector: 'app-ui-badge',
  template: `
    <div [class]="computedClass">
      <ng-content></ng-content>
    </div>
  `,
})
export class UiBadgeComponent {
  @Input() variant = 'default'; // Color
}
```

### ¿Cómo usarlo?

```html
<!-- Estado de producto -->
<app-ui-badge variant="success">En Stock</app-ui-badge>
<app-ui-badge variant="destructive">Agotado</app-ui-badge>
<app-ui-badge variant="secondary">Nuevo</app-ui-badge>

<!-- En una tabla -->
<td>
  <app-ui-badge [variant]="producto.stock > 0 ? 'success' : 'destructive'">
    {{ producto.stock > 0 ? 'Disponible' : 'Agotado' }}
  </app-ui-badge>
</td>
```

### Analogía

```
Badge = Un sticker que pegas en las cosas

🟢 success     → "¡Todo bien!"
🔴 destructive → "¡Cuidado!"
🔵 default     → "Normal"
⚪ secondary   → "Info extra"
```

---

## 🪟 El Dialog - ui-animated-dialog

### ¿Qué es?

Una ventana emergente con animación bonita.

### Lo Especial

```typescript
export class UiAnimatedDialogComponent {
  // ✨ Usa SIGNALS (moderno)
  showModal = signal(false);
  animateIn = signal(false);
  transformOrigin = signal('center center');

  @Input() set isOpen(value: boolean) {
    if (value) {
      // 1. Aparece en el DOM
      this.showModal.set(true);
      // 2. Después de 10ms, inicia animación
      setTimeout(() => this.animateIn.set(true), 10);
    } else {
      // 1. Inicia animación de salida
      this.animateIn.set(false);
      // 2. Después de 400ms, desaparece del DOM
      setTimeout(() => this.showModal.set(false), 400);
    }
  }
}
```

### ¿Cómo usarlo?

```typescript
// En el componente
dialogOpen = signal(false);

abrirDialog() {
  this.dialogOpen.set(true);
}
```

```html
<!-- El botón que abre -->
<app-ui-button (onClick)="abrirDialog()"> Nuevo Producto </app-ui-button>

<!-- El dialog -->
<app-ui-animated-dialog [isOpen]="dialogOpen()" (isOpenChange)="dialogOpen.set($event)">
  <h2>Nuevo Producto</h2>
  <app-ui-input placeholder="Nombre" />
  <app-ui-button (onClick)="guardar()">Guardar</app-ui-button>
</app-ui-animated-dialog>
```

### Analogía

```
Dialog = Una ventana que aparece mágicamente

1. Abres  → Aparece con animación suave
2. Cierras → Desaparece con animación suave
3. Click afuera → Se cierra solito
```

---

## 🛠️ Patrón de Creación

### Receta para Crear un Componente UI

```typescript
// 1. Importaciones
import { Component, input, output, computed } from '@angular/core';
import { cn } from '../../utils/cn';

// 2. El Componente
@Component({
  selector: 'ui-mi-componente',
  standalone: true,
  template: `
    <div [class]="classes()">
      <ng-content></ng-content>
    </div>
  `,
})
export class UiMiComponente {
  // 3. Entradas (configuración)
  variant = input<'a' | 'b'>('a');
  size = input<'sm' | 'md'>('md');
  class = input('');

  // 4. Salidas (eventos)
  clicked = output<void>();

  // 5. Clases computadas
  classes = computed(() =>
    cn(
      'clases-base',
      this.variant() === 'a' && 'clases-variante-a',
      this.size() === 'sm' && 'text-sm',
      this.class()
    )
  );
}
```

---

## 📦 El Barrel Export - index.ts

### ¿Qué es?

Una lista que dice "aquí están todas mis piezas de LEGO".

```typescript
// shared/ui/index.ts

// En vez de importar así (largo y feo):
import { UiButtonComponent } from './ui-button/ui-button.component';
import { UiInputComponent } from './ui-input/ui-input.component';
import { UiBadgeComponent } from './ui-badge/ui-badge.component';

// Importas así (corto y bonito):
import { UiButtonComponent, UiInputComponent, UiBadgeComponent } from '../../shared/ui';
```

### Analogía

```
Barrel Export = El catálogo de la caja de LEGO

"¿Qué piezas tienes?"
→ Botones, Inputs, Badges, Dialogs, Cards...
→ Todo en una sola página del catálogo
```

---

## 💡 Reglas Zen de Componentes UI

> [!important] Regla 1: Sin lógica de negocio
> El botón NO sabe que guarda productos. Solo sabe hacer click.

> [!tip] Regla 2: Configurable con defaults
> `variant = input('default')` ← Si no dices nada, usa 'default'

> [!note] Regla 3: Composición es la clave
> Combina piezas pequeñas para hacer cosas grandes

---

## 📎 Relacionados

- [[Utilidad cn]]
- [[Directivas]]
- [[Código Moderno]]
- [[Shared]]
