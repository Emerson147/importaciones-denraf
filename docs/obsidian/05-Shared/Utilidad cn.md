---
tags: [angular, shared, utils, tailwind, cn]
created: 2024-12-20
---

# 🎨 Utilidad cn() - El Mezclador de Clases

> _"Combina clases de Tailwind sin conflictos"_

---

## 🎒 ¿Qué es cn()?

`cn()` es una función mágica que:

1. **Combina** clases CSS
2. **Acepta condiciones** (si esto, entonces aquello)
3. **Resuelve conflictos** de Tailwind automáticamente

---

## 📦 El Código

```typescript
// shared/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Son solo 3 líneas**, pero hacen magia. 🪄

---

## 🧩 Las Dos Piezas

### 1. `clsx` - El Combinador

Junta clases y acepta condiciones:

```typescript
import { clsx } from 'clsx';

// Combinar clases
clsx('px-4', 'py-2', 'bg-blue-500');
// → "px-4 py-2 bg-blue-500"

// Con condiciones
clsx('base', isActive && 'active', isDisabled && 'disabled');
// Si isActive=true, isDisabled=false
// → "base active"

// Ignora valores falsy
clsx('base', null, undefined, false, 0, '', 'final');
// → "base final"
```

### 2. `twMerge` - El Resolvedor de Conflictos

Cuando hay clases de Tailwind que chocan, gana la última:

```typescript
import { twMerge } from 'tailwind-merge';

// Sin twMerge (problema)
('px-4 px-6'); // Ambas aplican, ¿cuál gana? 🤷

// Con twMerge (solución)
twMerge('px-4 px-6');
// → "px-6"  ← Gana la última

twMerge('text-sm text-lg');
// → "text-lg"

twMerge('bg-red-500 bg-blue-500');
// → "bg-blue-500"
```

---

## 🎯 cn() = clsx + twMerge

Combina lo mejor de ambos:

```typescript
cn(
  'px-4 py-2 bg-blue-500', // Base
  isActive && 'bg-green-500', // Condicional
  'px-6' // Override
);
// Si isActive=true:
// → "py-2 px-6 bg-green-500"
//    └── px-4 fue reemplazado por px-6
//    └── bg-blue-500 fue reemplazado por bg-green-500
```

---

## 📝 Ejemplos Prácticos

### Botón con Variantes

```typescript
const buttonClasses = cn(
  // Base (siempre aplica)
  'px-4 py-2 rounded-lg font-medium',

  // Variante de color
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'danger' && 'bg-red-500 text-white',
  variant === 'ghost' && 'bg-transparent text-gray-700',

  // Tamaño
  size === 'sm' && 'text-sm px-3 py-1',
  size === 'lg' && 'text-lg px-6 py-3',

  // Estado
  disabled && 'opacity-50 cursor-not-allowed',

  // Clases extra del usuario
  className
);
```

**Resultado para `variant="danger"`, `size="sm"`, `disabled=true`:**

```
"rounded-lg font-medium bg-red-500 text-white text-sm px-3 py-1 opacity-50 cursor-not-allowed"
```

Nota cómo `px-4` fue reemplazado por `px-3` (del size sm).

---

### Input con Estados

```typescript
const inputClasses = cn(
  // Base
  'w-full px-4 py-2 border rounded-lg',
  'focus:outline-none focus:ring-2',

  // Estado normal vs error
  hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200',

  // Deshabilitado
  disabled && 'bg-gray-100 cursor-not-allowed'
);
```

---

### Card Dinámica

```typescript
const cardClasses = cn(
  // Base
  'p-6 rounded-2xl shadow-sm',

  // Variante visual
  variant === 'elevated' && 'shadow-lg',
  variant === 'outlined' && 'border border-gray-200 shadow-none',
  variant === 'filled' && 'bg-gray-100',

  // Interactivo
  clickable && 'cursor-pointer hover:shadow-md transition-shadow',

  // Clases del usuario
  className
);
```

---

## 👶 Analogía para 5 Años

```
cn() es como mezclar pinturas:

🎨 "Quiero azul"
   + "Quiero rojo"
   + "No, mejor solo azul"

   cn devuelve: Solo azul (el último gana)

🖌️ "Quiero líneas gruesas"
   + (si es importante) "Quiero amarillo"
   + "Quiero líneas finas"

   cn devuelve: Líneas finas + amarillo (si era importante)
```

---

## 📦 Instalación

```bash
npm install clsx tailwind-merge
```

```typescript
// shared/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 🔧 Uso en Componentes

```typescript
import { cn } from '../../utils/cn';

@Component({
  selector: 'ui-button',
  template: `
    <button [class]="classes()">
      <ng-content></ng-content>
    </button>
  `,
})
export class UiButtonComponent {
  variant = input<'primary' | 'danger'>('primary');
  size = input<'sm' | 'md'>('md');
  class = input('');
  disabled = input(false);

  // ✅ Computed para las clases
  classes = computed(() =>
    cn(
      // Base
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-colors focus:outline-none focus:ring-2',

      // Variantes
      this.variant() === 'primary' && 'bg-stone-900 text-white hover:bg-black',
      this.variant() === 'danger' && 'bg-red-500 text-white hover:bg-red-600',

      // Tamaños
      this.size() === 'sm' && 'h-9 px-3 text-sm',
      this.size() === 'md' && 'h-10 px-4 text-sm',

      // Estados
      this.disabled() && 'opacity-50 cursor-not-allowed',

      // Clases extra
      this.class()
    )
  );
}
```

---

## 💡 Reglas Zen de cn()

> [!important] Regla 1: Orden importa
> Las clases al final reemplazan las del principio

> [!tip] Regla 2: Condiciones limpias
> `condicion && 'clase'` es más limpio que if/else

> [!note] Regla 3: Siempre permite class extra
> `this.class()` al final para que el usuario pueda override

---

## 🆚 Sin cn() vs Con cn()

### Sin cn() (problemas)

```typescript
// ❌ Feo y propenso a errores
get classes() {
  let result = 'px-4 py-2 ';

  if (this.variant === 'primary') {
    result += 'bg-blue-500 ';
  } else if (this.variant === 'danger') {
    result += 'bg-red-500 ';
  }

  if (this.size === 'sm') {
    result += 'px-3 py-1 ';  // ⚠️ px-4 y px-3 ambos aplican!
  }

  return result.trim();
}
```

### Con cn() (limpio)

```typescript
// ✅ Limpio y sin conflictos
classes = computed(() =>
  cn(
    'px-4 py-2',
    this.variant() === 'primary' && 'bg-blue-500',
    this.variant() === 'danger' && 'bg-red-500',
    this.size() === 'sm' && 'px-3 py-1' // Reemplaza px-4 automáticamente
  )
);
```

---

## 📎 Relacionados

- [[Componentes UI]]
- [[Código Moderno]]
- [[Tailwind]]
