---
tags: [angular, moderno, signals, best-practices]
created: 2024-12-20
---

# 🚀 Código Moderno - Angular 18+

> _"El viejo código funciona, el nuevo código brilla"_

---

## 🎒 ¿Por qué Modernizar?

```
Código Antiguo (funciona pero...)
├── Más líneas
├── Más errores posibles
├── Más difícil de mantener
└── Menos performante

Código Moderno (mejor en todo)
├── Menos líneas
├── TypeScript te ayuda más
├── Más fácil de leer
└── Más rápido
```

---

## 🔄 Comparación: Antiguo vs Moderno

### 1️⃣ Inputs (Recibir datos del padre)

**❌ Antiguo:**

```typescript
import { Input } from '@angular/core';

@Input() variant: string = 'default';
@Input() size: 'sm' | 'md' = 'md';
@Input() disabled: boolean = false;
```

**✅ Moderno:**

```typescript
import { input } from '@angular/core';

variant = input('default'); // Tipo inferido
size = input<'sm' | 'md'>('md'); // Tipo explícito
disabled = input(false); // Boolean
required = input.required<string>(); // Obligatorio
```

**Diferencias:**
| Antiguo | Moderno |
|---------|---------|
| `@Input()` decorador | `input()` función |
| `this.variant` | `this.variant()` |
| Puede ser undefined | Type-safe |

---

### 2️⃣ Outputs (Enviar datos al padre)

**❌ Antiguo:**

```typescript
import { Output, EventEmitter } from '@angular/core';

@Output() onClick = new EventEmitter<MouseEvent>();
@Output() valueChange = new EventEmitter<string>();

// Emitir
this.onClick.emit(event);
```

**✅ Moderno:**

```typescript
import { output } from '@angular/core';

clicked = output<MouseEvent>();
valueChange = output<string>();

// Emitir
this.clicked.emit(event);
```

---

### 3️⃣ Computed (Valores Derivados)

**❌ Antiguo:**

```typescript
// Getter - se ejecuta en cada detección de cambios
get classes(): string {
  return cn(
    'base',
    this.variant === 'primary' && 'bg-blue-500'
  );
}
```

**✅ Moderno:**

```typescript
import { computed } from '@angular/core';

// Computed - se cachea, solo recalcula cuando cambia
classes = computed(() => cn('base', this.variant() === 'primary' && 'bg-blue-500'));
```

---

### 4️⃣ Control Flow en Templates

**❌ Antiguo:**

```html
<div *ngIf="isLoading; else content">Cargando...</div>
<ng-template #content>
  <p *ngFor="let item of items; trackBy: trackById">{{ item.name }}</p>
</ng-template>
```

**✅ Moderno:**

```html
@if (isLoading()) {
<div>Cargando...</div>
} @else { @for (item of items(); track item.id) {
<p>{{ item.name }}</p>
} }
```

---

### 5️⃣ Inyección de Dependencias

**❌ Antiguo:**

```typescript
constructor(
  private productService: ProductService,
  private router: Router,
  private http: HttpClient
) {}
```

**✅ Moderno:**

```typescript
private productService = inject(ProductService);
private router = inject(Router);
private http = inject(HttpClient);
```

---

## 📝 Ejemplo Completo: Botón Moderno

### Código Antiguo

```typescript
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [class]="classes" [disabled]="disabled" (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
})
export class UiButtonComponent {
  @Input() variant: 'default' | 'destructive' | 'outline' = 'default';
  @Input() size: 'default' | 'sm' | 'lg' = 'default';
  @Input() class = '';
  @Input() disabled = false;

  @Output() onClick = new EventEmitter<Event>();

  get classes() {
    return cn(
      'inline-flex items-center justify-center rounded-md font-medium',
      this.variant === 'default' && 'bg-stone-900 text-white',
      this.variant === 'destructive' && 'bg-red-500 text-white',
      this.size === 'sm' && 'h-9 px-3',
      this.size === 'default' && 'h-10 px-4',
      this.disabled && 'opacity-50',
      this.class
    );
  }
}
```

### Código Moderno ✨

```typescript
import { Component, computed, input, output, ChangeDetectionStrategy } from '@angular/core';
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [class]="classes()" [disabled]="disabled()" (click)="clicked.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
})
export class UiButtonComponent {
  // ✅ Inputs modernos
  variant = input<'default' | 'destructive' | 'outline'>('default');
  size = input<'default' | 'sm' | 'lg'>('default');
  class = input('');
  disabled = input(false);

  // ✅ Output moderno
  clicked = output<Event>();

  // ✅ Computed para clases
  classes = computed(() =>
    cn(
      'inline-flex items-center justify-center rounded-md font-medium',
      this.variant() === 'default' && 'bg-stone-900 text-white',
      this.variant() === 'destructive' && 'bg-red-500 text-white',
      this.size() === 'sm' && 'h-9 px-3',
      this.size() === 'default' && 'h-10 px-4',
      this.disabled() && 'opacity-50',
      this.class()
    )
  );
}
```

---

## 📊 Tabla de Migración

| Característica      | Antiguo                          | Moderno      |
| ------------------- | -------------------------------- | ------------ |
| **Inputs**          | `@Input()`                       | `input()`    |
| **Outputs**         | `@Output() = new EventEmitter()` | `output()`   |
| **Two-way binding** | `@Input() + @Output()`           | `model()`    |
| **Computed**        | `get property()`                 | `computed()` |
| **Estado**          | Variables                        | `signal()`   |
| **Inyección**       | `constructor()`                  | `inject()`   |
| **If**              | `*ngIf`                          | `@if`        |
| **For**             | `*ngFor`                         | `@for`       |
| **Switch**          | `*ngSwitch`                      | `@switch`    |

---

## 🎯 Checklist de Modernización

### Para cada componente:

- [ ] Cambiar `@Input()` → `input()`
- [ ] Cambiar `@Output()` → `output()`
- [ ] Cambiar `get` → `computed()`
- [ ] Cambiar `*ngIf` → `@if`
- [ ] Cambiar `*ngFor` → `@for`
- [ ] Cambiar `constructor(private ...)` → `inject()`
- [ ] Agregar `ChangeDetectionStrategy.OnPush`

---

## 💡 Reglas Zen del Código Moderno

> [!important] Regla 1: Paréntesis para leer signals
> `variant()` no `variant`

> [!tip] Regla 2: Computed para lógica derivada
> Si depende de otros valores, usa `computed()`

> [!note] Regla 3: inject() sobre constructor
> Más limpio y funciona en más lugares

---

## 📎 Relacionados

- [[Signal Básico]]
- [[Computed]]
- [[Componentes UI]]
- [[Core]]
