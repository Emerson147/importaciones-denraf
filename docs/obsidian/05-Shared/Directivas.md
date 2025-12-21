---
tags: [angular, shared, directivas]
created: 2024-12-20
---

# 🎯 Directivas - Superpoderes para Elementos

> _"Añade comportamientos mágicos a cualquier cosa"_

---

## 🎒 ¿Qué es una Directiva?

Una directiva es como un **superpoder** que le das a un elemento HTML.

```
Elemento HTML normal:
<div>Hola</div>  ← No hace nada especial

Elemento HTML CON directiva:
<div clickOutside>Hola</div>  ← ¡Ahora detecta clicks afuera!
```

---

## 🆚 Directiva vs Componente

| Componente            | Directiva                   |
| --------------------- | --------------------------- |
| Tiene template (HTML) | NO tiene template           |
| Crea elemento nuevo   | Modifica elemento existente |
| `<app-boton>`         | `<div miDirectiva>`         |
| Piezas de LEGO        | Pintura para LEGO           |

### Analogía

```
Componente = Una pieza de LEGO nueva
Directiva  = Pintura mágica que le pones a cualquier pieza

El LEGO sigue siendo LEGO, pero ahora brilla en la oscuridad 🌟
```

---

## 🎯 Directiva: clickOutside

### ¿Qué hace?

Detecta cuando haces click **FUERA** del elemento.

### El Código

```typescript
import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: '[clickOutside]', // 👈 Se usa como atributo
  standalone: true, // 👈 Moderno
})
export class ClickOutsideDirective {
  // 📤 Evento que se dispara al hacer click afuera
  @Output() clickOutside = new EventEmitter<void>();

  // 📦 Referencia al elemento donde está la directiva
  constructor(private elementRef: ElementRef) {}

  // 👂 Escucha TODOS los clicks en el documento
  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    // ¿El click fue DENTRO de mi elemento?
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside) {
      // ¡Click fue AFUERA! Aviso al padre
      this.clickOutside.emit();
    }
  }
}
```

---

### Paso a Paso (como para 5 años)

```
1. Usuario hace click en la pantalla
   │
   ▼
2. La directiva escucha: "¡Alguien hizo click!"
   │
   ▼
3. Pregunta: "¿El click fue dentro de mi caja?"
   │
   ├── Sí → No hago nada 😴
   │
   └── No → ¡Aviso que clickearon afuera! 📢
```

---

### ¿Cómo usarla?

```html
<!-- Menú desplegable que se cierra al hacer click afuera -->
<div class="menu-container" (clickOutside)="cerrarMenu()">
  <button (click)="toggleMenu()">Abrir Menú</button>

  @if (menuAbierto()) {
  <div class="menu">
    <a>Opción 1</a>
    <a>Opción 2</a>
    <a>Opción 3</a>
  </div>
  }
</div>
```

```typescript
// En el componente
menuAbierto = signal(false);

toggleMenu() {
  this.menuAbierto.update(v => !v);
}

cerrarMenu() {
  this.menuAbierto.set(false);
}
```

---

### Casos de Uso Comunes

```
1. 🔽 Dropdown/Menú
   → Click afuera → Cierra el menú

2. 🪟 Modal (alternativa)
   → Click afuera → Cierra el modal

3. 📝 Editor inline
   → Click afuera → Guarda y cierra

4. 🔍 Búsqueda con sugerencias
   → Click afuera → Oculta sugerencias
```

---

## 🔧 Cómo Crear una Directiva

### Plantilla Base

```typescript
import { Directive, ElementRef, HostListener, Output, EventEmitter, input } from '@angular/core';

@Directive({
  selector: '[miDirectiva]', // 👈 Siempre entre corchetes []
  standalone: true,
})
export class MiDirectiva {
  // 📥 Configuración opcional
  miDirectiva = input<string>('default');

  // 📤 Eventos
  algo = new EventEmitter<void>();

  // 📦 El elemento donde estoy
  constructor(private el: ElementRef) {}

  // 👂 Escuchar eventos
  @HostListener('click')
  onClick() {
    console.log('Clickearon el elemento!');
    console.log('Valor config:', this.miDirectiva());
  }

  // 🎨 Modificar el elemento
  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
```

---

## 📝 Ejemplo: Directiva Highlight

```typescript
@Directive({
  selector: '[highlight]',
  standalone: true,
})
export class HighlightDirective {
  // Color del highlight
  highlight = input('yellow');

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = this.highlight();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '';
  }
}
```

**Uso:**

```html
<p highlight>Se pone amarillo al pasar el mouse</p>
<p highlight="pink">Se pone rosado al pasar el mouse</p>
```

---

## 🎨 Tipos de Directivas

### 1. Directivas de Atributo

Cambian apariencia o comportamiento.

```html
<p highlight="yellow">Texto resaltado</p>
<input mask="phone" />
<div draggable>Arrástrme</div>
```

### 2. Directivas Estructurales

Cambian la estructura del DOM. (Hechas por Angular)

```html
@if (condicion) { ... } ← Antes era *ngIf @for (item of lista) { ... } ← Antes era *ngFor @switch
(valor) { ... } ← Antes era *ngSwitch
```

---

## 💡 Reglas Zen de Directivas

> [!important] Regla 1: Una directiva, un comportamiento
> `clickOutside` solo detecta clicks afuera. No hace más.

> [!tip] Regla 2: Standalone siempre
> Las directivas modernas son `standalone: true`

> [!note] Regla 3: Selector entre corchetes
> `selector: '[miDirectiva]'` ← Los corchetes son obligatorios

---

## 🆚 ¿Cuándo Directiva vs Componente?

| Necesitas...                               | Usa        |
| ------------------------------------------ | ---------- |
| Crear elemento visual nuevo                | Componente |
| Añadir comportamiento a elemento existente | Directiva  |
| Template HTML propio                       | Componente |
| Solo lógica/eventos                        | Directiva  |

---

## 📎 Relacionados

- [[Componentes UI]]
- [[Utilidad cn]]
- [[Código Moderno]]
