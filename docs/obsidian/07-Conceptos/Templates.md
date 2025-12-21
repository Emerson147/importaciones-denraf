---
tags: [angular, templates, html, control-flow]
created: 2024-12-20
---

# 📝 Templates - El HTML de Angular

> _"HTML con superpoderes"_

---

## 🎒 ¿Qué es un Template?

Es el **HTML de tu componente** con poderes especiales:

- 🔗 Binding de datos
- 🔁 Loops y condicionales
- 📤 Eventos
- 📥 Propiedades

---

## 🔗 Interpolación - Mostrar Datos

### Sintaxis: `{{ expresion }}`

```html
<!-- Variable simple -->
<h1>{{ titulo }}</h1>

<!-- Con signals (paréntesis) -->
<p>Hola, {{ nombre() }}</p>

<!-- Expresiones -->
<p>Total: {{ precio() * cantidad() }}</p>

<!-- Métodos -->
<p>{{ getFormattedDate() }}</p>
```

---

## 📥 Property Binding - Pasar Datos

### Sintaxis: `[propiedad]="valor"`

```html
<!-- Atributo HTML -->
<img [src]="producto.imagen" [alt]="producto.nombre" />

<!-- Deshabilitar botón -->
<button [disabled]="!isValid()">Guardar</button>

<!-- Clase condicional -->
<div [class.active]="isActive()">...</div>

<!-- Estilo condicional -->
<div [style.color]="error() ? 'red' : 'black'">...</div>

<!-- Pasar a componente hijo -->
<app-producto [producto]="productoSeleccionado()"></app-producto>
```

---

## 📤 Event Binding - Escuchar Eventos

### Sintaxis: `(evento)="handler()"`

```html
<!-- Click -->
<button (click)="guardar()">Guardar</button>

<!-- Con $event -->
<input (input)="onInput($event)" />

<!-- Teclado -->
<input (keyup.enter)="buscar()" />
<input (keydown.escape)="cancelar()" />

<!-- Mouse -->
<div (mouseenter)="mostrarTooltip()">
  <div (mouseleave)="ocultarTooltip()">
    <!-- Eventos de componente hijo -->
    <app-producto (seleccionado)="onProductoSeleccionado($event)"></app-producto>
  </div>
</div>
```

---

## 🔄 Two-Way Binding - Ida y Vuelta

### Sintaxis: `[(ngModel)]="valor"`

```html
<!-- Necesita FormsModule -->
<input [(ngModel)]="nombre" />

<!-- Es equivalente a: -->
<input [value]="nombre" (input)="nombre = $event.target.value" />
```

### Con Signals

```html
<input [value]="nombre()" (input)="nombre.set($event.target.value)" />
```

---

## 🔁 Control Flow Moderno (@if, @for, @switch)

### @if - Condicionales

```html
<!-- Simple -->
@if (isLoading()) {
<div>Cargando...</div>
}

<!-- Con else -->
@if (isLoading()) {
<div>Cargando...</div>
} @else {
<div>Contenido listo</div>
}

<!-- Con else if -->
@if (estado() === 'cargando') {
<div>Cargando...</div>
} @else if (estado() === 'error') {
<div>Error!</div>
} @else {
<div>Listo</div>
}
```

### @for - Loops

```html
<!-- Loop básico -->
@for (producto of productos(); track producto.id) {
<div>{{ producto.nombre }}</div>
}

<!-- Con índice -->
@for (producto of productos(); track producto.id; let i = $index) {
<div>{{ i + 1 }}. {{ producto.nombre }}</div>
}

<!-- Con empty (cuando está vacío) -->
@for (producto of productos(); track producto.id) {
<div>{{ producto.nombre }}</div>
} @empty {
<div>No hay productos</div>
}
```

### @switch - Múltiples Casos

```html
@switch (estado()) { @case ('pendiente') {
<span class="badge yellow">Pendiente</span>
} @case ('completado') {
<span class="badge green">Completado</span>
} @case ('cancelado') {
<span class="badge red">Cancelado</span>
} @default {
<span class="badge gray">Desconocido</span>
} }
```

---

## 🆚 Control Flow: Moderno vs Antiguo

| Antiguo                   | Moderno                         | Beneficio         |
| ------------------------- | ------------------------------- | ----------------- |
| `*ngIf="x"`               | `@if (x) {}`                    | Más claro         |
| `*ngFor="let i of items"` | `@for (i of items; track i.id)` | Track obligatorio |
| `[ngSwitch]`              | `@switch`                       | Más limpio        |

### ¿Por qué track?

```html
<!-- ❌ Sin track (puede causar bugs) -->
@for (item of items()) {

<!-- ✅ Con track (Angular sabe qué cambió) -->
@for (item of items(); track item.id) {
```

`track` le dice a Angular cómo identificar cada elemento.
Esto optimiza el rendimiento y evita bugs.

---

## 🎭 ng-content - Proyección de Contenido

### En el componente padre

```html
<app-card>
  <h2>Título</h2>
  <p>Contenido que quiero proyectar</p>
</app-card>
```

### En app-card.component.html

```html
<div class="card">
  <ng-content></ng-content>
  <!-- Aquí aparece el contenido -->
</div>
```

### Resultado renderizado

```html
<div class="card">
  <h2>Título</h2>
  <p>Contenido que quiero proyectar</p>
</div>
```

---

## 🏷️ Template Reference Variables

### Sintaxis: `#variable`

```html
<!-- Referencia a elemento -->
<input #miInput type="text" />
<button (click)="log(miInput.value)">Log</button>

<!-- Referencia a componente -->
<app-formulario #form></app-formulario>
<button (click)="form.submit()">Submit</button>
```

---

## 🛠️ Pipes - Transformadores

```html
<!-- Formato de moneda -->
<p>{{ precio | currency:'PEN' }}</p>
<!-- Resultado: S/ 150.00 -->

<!-- Formato de fecha -->
<p>{{ fecha | date:'short' }}</p>
<!-- Resultado: 20/12/24 5:30 PM -->

<!-- Mayúsculas -->
<p>{{ nombre | uppercase }}</p>
<!-- Resultado: JUAN -->

<!-- Encadenar pipes -->
<p>{{ texto | lowercase | titlecase }}</p>
```

### Pipes Comunes

| Pipe        | Uso       | Ejemplo                 |
| ----------- | --------- | ----------------------- |
| `currency`  | Dinero    | `150 → S/ 150.00`       |
| `date`      | Fechas    | `2024-12-20 → 20/12/24` |
| `uppercase` | MAYÚSCULA | `hola → HOLA`           |
| `lowercase` | minúscula | `HOLA → hola`           |
| `number`    | Números   | `1234.5 → 1,234.50`     |
| `json`      | Debug     | `{a:1} → {"a": 1}`      |

---

## 💡 Reglas Zen de Templates

> [!important] Regla 1: Mínima lógica en templates
> Cálculos complejos van en computed(), no en el HTML

> [!tip] Regla 2: Siempre usa track en @for
> Mejora rendimiento y evita bugs

> [!note] Regla 3: Pipes para formatear
> No formatees en el componente, usa pipes

---

## 📎 Relacionados

- [[Componentes UI]]
- [[Código Moderno]]
- [[Signal Básico]]
