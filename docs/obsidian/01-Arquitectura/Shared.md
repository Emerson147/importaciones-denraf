---
tags: [angular, arquitectura, shared, ui]
created: 2024-12-17
---

# 🧰 Shared - Muebles Reutilizables

> _"Construye una vez, usa mil veces"_

---

## 🎒 ¿Qué es Shared?

Son **componentes que usas en muchos lugares**, como muebles que mueves por la casa:

- 🔘 Botones
- 📝 Campos de texto
- 📢 Notificaciones
- 🪟 Ventanas modales

---

## 📁 Estructura

```
shared/
├── 📂 ui/                    ← Componentes visuales
│   ├── ui-button/
│   ├── ui-input/
│   ├── ui-dialog/
│   ├── ui-toast/
│   ├── ui-badge/
│   └── ui-ticket/
│
├── 📂 directives/            ← Comportamientos
│   └── click-outside/
│
└── 📂 pipes/                 ← Transformadores
    └── currency.pipe.ts
```

---

## 🔘 Ejemplo: Botón Reutilizable

### El Componente

```typescript
// ui-button.component.ts
@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="getClasses()"
      (click)="handleClick()"
    >
      @if (loading()) {
      <span class="animate-spin">⟳</span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class UiButtonComponent {
  // 📥 Entradas (props que recibe)
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);
  loading = input(false);
  type = input<'button' | 'submit'>('button');

  // 📤 Salidas (eventos que emite)
  clicked = output<void>();

  // 🎨 Clases dinámicas
  getClasses(): string {
    const base = 'rounded-xl font-medium transition-all active:scale-95';

    const variants = {
      primary: 'bg-stone-900 text-white hover:bg-black',
      secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  }

  handleClick() {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
```

### Uso en cualquier lugar

```html
<!-- Botón primario -->
<ui-button variant="primary" (clicked)="guardar()"> Guardar </ui-button>

<!-- Botón secundario pequeño -->
<ui-button variant="secondary" size="sm"> Cancelar </ui-button>

<!-- Botón con loading -->
<ui-button [loading]="guardando()"> {{ guardando() ? 'Guardando...' : 'Guardar' }} </ui-button>

<!-- Botón peligroso -->
<ui-button variant="danger" (clicked)="eliminar()"> Eliminar </ui-button>
```

---

## 📝 Ejemplo: Input Reutilizable

```typescript
// ui-input.component.ts
@Component({
  selector: 'ui-input',
  standalone: true,
  template: `
    <div class="space-y-1.5">
      @if (label()) {
      <label class="block text-sm font-medium text-stone-700">
        {{ label() }}
      </label>
      }

      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        class="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl
               focus:outline-none focus:ring-2 focus:ring-stone-400
               disabled:bg-stone-50 disabled:cursor-not-allowed"
      />

      @if (error()) {
      <p class="text-sm text-red-500">{{ error() }}</p>
      }
    </div>
  `,
})
export class UiInputComponent {
  // 📥 Entradas
  label = input('');
  type = input<'text' | 'number' | 'email' | 'password'>('text');
  placeholder = input('');
  value = input('');
  disabled = input(false);
  error = input('');

  // 📤 Salidas
  valueChange = output<string>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }
}
```

### Uso

```html
<ui-input
  label="Nombre del producto"
  placeholder="Ej: Casaca Negra"
  [value]="nombre()"
  (valueChange)="nombre.set($event)"
/>

<ui-input
  type="number"
  label="Precio"
  [value]="precio().toString()"
  (valueChange)="precio.set(+$event)"
  [error]="precio() <= 0 ? 'El precio debe ser mayor a 0' : ''"
/>
```

---

## 🪟 Ejemplo: Dialog Modal

```typescript
// ui-dialog.component.ts
@Component({
  selector: 'ui-dialog',
  standalone: true,
  template: `
    @if (isOpen()) {
    <!-- Overlay oscuro -->
    <div class="fixed inset-0 bg-black/50 z-40" (click)="close()"></div>

    <!-- Modal -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">{{ title() }}</h2>
          <button (click)="close()" class="text-stone-400 hover:text-stone-600">✕</button>
        </div>

        <!-- Contenido -->
        <ng-content></ng-content>
      </div>
    </div>
    }
  `,
})
export class UiDialogComponent {
  isOpen = input(false);
  title = input('');

  isOpenChange = output<boolean>();

  close() {
    this.isOpenChange.emit(false);
  }
}
```

### Uso

```html
<ui-dialog [isOpen]="dialogOpen()" (isOpenChange)="dialogOpen.set($event)" title="Nuevo Producto">
  <form (submit)="guardar()">
    <ui-input label="Nombre" ... />
    <ui-input label="Precio" ... />
    <ui-button type="submit">Guardar</ui-button>
  </form>
</ui-dialog>
```

---

## 📢 Ejemplo: Toast Service

```typescript
// toast.service.ts
@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly activeToasts = this.toasts.asReadonly();

  success(message: string) {
    this.show({ type: 'success', message });
  }

  error(message: string) {
    this.show({ type: 'error', message });
  }

  private show(toast: Omit<Toast, 'id'>) {
    const id = Date.now().toString();
    this.toasts.update((t) => [...t, { ...toast, id }]);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
      this.toasts.update((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }
}
```

### Uso en cualquier componente

```typescript
class MiComponente {
  private toast = inject(ToastService);

  guardar() {
    try {
      // ... guardar
      this.toast.success('Producto guardado ✓');
    } catch (e) {
      this.toast.error('Error al guardar');
    }
  }
}
```

---

## 🧩 Patrón de Composición

Los componentes shared se **combinan** como LEGO:

```html
<ui-dialog [isOpen]="open()" title="Nuevo Cliente">
  <div class="space-y-4">
    <ui-input label="Nombre" ... />
    <ui-input label="Teléfono" ... />
    <ui-input label="Email" ... />
  </div>

  <div class="flex justify-end gap-2 mt-6">
    <ui-button variant="secondary" (clicked)="cancelar()"> Cancelar </ui-button>
    <ui-button variant="primary" (clicked)="guardar()"> Guardar </ui-button>
  </div>
</ui-dialog>
```

---

## 💡 Reglas Zen de Shared

> [!important] Regla 1: Sin lógica de negocio
> Un `ui-button` no sabe qué hace el click, solo lo propaga

> [!tip] Regla 2: Configurable pero con defaults
> `variant = input('primary')` ← Default sensible

> [!note] Regla 3: Composición sobre herencia
> Combina componentes pequeños, no hagas uno gigante

---

## 📎 Relacionados

- [[Core]]
- [[Features]]
- [[Layout]]
- [[Inputs y Outputs]]
