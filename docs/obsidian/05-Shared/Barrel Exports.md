---
tags: [angular, shared, imports, organizacion]
created: 2024-12-20
---

# 📦 Barrel Exports - El Catálogo de Componentes

> _"Una puerta de entrada a toda tu biblioteca"_

---

## 🎒 ¿Qué es un Barrel Export?

Es un archivo `index.ts` que **re-exporta** todo lo de una carpeta.

### Analogía

```
Sin barrel (comprar en tiendas diferentes):
🏪 Tienda 1 → Compro botón
🏪 Tienda 2 → Compro input
🏪 Tienda 3 → Compro badge
(3 viajes, 3 direcciones diferentes)

Con barrel (comprar en un supermercado):
🏬 Supermercado → Compro botón, input, badge
(1 viaje, 1 dirección)
```

---

## 📝 El Código

```typescript
// shared/ui/index.ts

// Core UI Components
export { UiButtonComponent } from './ui-button/ui-button.component';
export { UiInputComponent } from './ui-input/ui-input.component';
export { UiLabelComponent } from './ui-label/ui-label.component';
export { UiBadgeComponent } from './ui-badge/ui-badge.component';

// Interactive
export { UiAnimatedDialogComponent } from './ui-animated-dialog/ui-animated-dialog.component';
export { UiDropdownComponent } from './ui-dropdown/ui-dropdown.component';

// Feedback
export { UiToastComponent } from './ui-toast/ui-toast.component';

// ... más exports
```

---

## 🆚 Sin Barrel vs Con Barrel

### ❌ Sin Barrel (feo y largo)

```typescript
// En un componente cualquiera
import { UiButtonComponent } from '../../../shared/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../../shared/ui/ui-input/ui-input.component';
import { UiBadgeComponent } from '../../../shared/ui/ui-badge/ui-badge.component';
import { UiAnimatedDialogComponent } from '../../../shared/ui/ui-animated-dialog/ui-animated-dialog.component';
import { UiToastComponent } from '../../../shared/ui/ui-toast/ui-toast.component';
```

### ✅ Con Barrel (limpio y corto)

```typescript
// En un componente cualquiera
import {
  UiButtonComponent,
  UiInputComponent,
  UiBadgeComponent,
  UiAnimatedDialogComponent,
  UiToastComponent,
} from '../../../shared/ui';
```

---

## 📁 Estructura de Archivos

```
shared/
└── ui/
    ├── 📄 index.ts           ← El barrel (catálogo)
    ├── ui-button/
    │   └── ui-button.component.ts
    ├── ui-input/
    │   └── ui-input.component.ts
    ├── ui-badge/
    │   └── ui-badge.component.ts
    └── ...
```

---

## 🎯 Cómo Crear un Barrel

### Paso 1: Crear index.ts

```typescript
// shared/ui/index.ts

// Cada línea exporta un componente
export { UiButtonComponent } from './ui-button/ui-button.component';
export { UiInputComponent } from './ui-input/ui-input.component';
```

### Paso 2: Usar en otros archivos

```typescript
// dashboard.component.ts

// Importar desde el barrel (termina en /ui, no /ui/index.ts)
import { UiButtonComponent, UiInputComponent } from '../../shared/ui';

@Component({
  imports: [UiButtonComponent, UiInputComponent]
})
```

---

## 📋 Organización del Barrel

### Por Categorías

```typescript
// shared/ui/index.ts

/**
 * 🎨 Barrel Export - Shared UI Components
 */

// ══════════════════════════════════════════════
// Core Components (los más usados)
// ══════════════════════════════════════════════
export { UiButtonComponent } from './ui-button/ui-button.component';
export { UiInputComponent } from './ui-input/ui-input.component';
export { UiLabelComponent } from './ui-label/ui-label.component';

// ══════════════════════════════════════════════
// Layout & Structure
// ══════════════════════════════════════════════
export { UiCardComponent } from './ui-card/ui-card.component';
export { UiSheetComponent } from './ui-sheet/ui-sheet.component';

// ══════════════════════════════════════════════
// Data Display
// ══════════════════════════════════════════════
export { UiBadgeComponent } from './ui-badge/ui-badge.component';
export { UiKpiCardComponent } from './ui-kpi-card/ui-kpi-card.component';

// ══════════════════════════════════════════════
// Interactive
// ══════════════════════════════════════════════
export { UiAnimatedDialogComponent } from './ui-animated-dialog/ui-animated-dialog.component';
export { UiDropdownComponent } from './ui-dropdown/ui-dropdown.component';

// ══════════════════════════════════════════════
// Feedback
// ══════════════════════════════════════════════
export { UiToastComponent } from './ui-toast/ui-toast.component';
export { UiNotificationCenterComponent } from './ui-notification-center/ui-notification-center.component';
```

---

## 🔄 Agregar Nuevo Componente

### 1. Crea el componente

```bash
# En shared/ui/
mkdir ui-mi-componente
touch ui-mi-componente/ui-mi-componente.component.ts
```

### 2. Escribe el código

```typescript
// ui-mi-componente.component.ts
@Component({
  selector: 'ui-mi-componente',
  standalone: true,
  template: `...`,
})
export class UiMiComponenteComponent {}
```

### 3. Agrégalo al barrel

```typescript
// shared/ui/index.ts

// ... otros exports

// Mi nuevo componente
export { UiMiComponenteComponent } from './ui-mi-componente/ui-mi-componente.component';
```

### 4. Usar donde quieras

```typescript
import { UiMiComponenteComponent } from '../../shared/ui';
```

---

## 💡 Reglas Zen de Barrels

> [!important] Regla 1: Solo exports públicos
> No exportes helpers internos, solo lo que otros deben usar

> [!tip] Regla 2: Un barrel por carpeta
> `shared/ui/index.ts`, `shared/directives/index.ts`

> [!note] Regla 3: Mantén ordenado
> Agrupa por categoría para encontrar rápido

---

## 📎 Relacionados

- [[Componentes UI]]
- [[Shared]]
- [[Código Moderno]]
