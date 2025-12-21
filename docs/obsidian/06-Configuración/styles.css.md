---
tags: [angular, tailwind, css, estilos]
created: 2024-12-20
---

# 🎨 styles.css - Tu Sistema de Diseño

> _"Los colores, fuentes y estilos de toda tu app"_

---

## 🎒 ¿Qué es styles.css?

Es el **libro de estilos** que aplica a TODA tu app:

- 🎨 Colores del tema
- 🔤 Fuentes
- 🌙 Modo oscuro
- ✨ Animaciones

---

## 📦 Estructura del Archivo

```css
/* 1. IMPORTS DE TAILWIND */
@import 'tailwindcss/theme.css';
@import 'tailwindcss/preflight.css';
@import 'tailwindcss/utilities.css';

/* 2. TEMA PERSONALIZADO */
@theme {
  ...;
}

/* 3. VARIABLES LIGHT MODE */
:root {
  ...;
}

/* 4. VARIABLES DARK MODE */
:root.dark {
  ...;
}

/* 5. ESTILOS BASE */
@layer base {
  ...;
}

/* 6. UTILIDADES PERSONALIZADAS */
@layer utilities {
  ...;
}
```

---

## 🎨 Sistema de Colores

### Variables CSS (Light Mode)

```css
:root {
  --background: hsl(0 0% 99%); /* Fondo casi blanco */
  --foreground: hsl(240 10% 3.9%); /* Texto casi negro */
  --primary: hsl(240 5.9% 10%); /* Color principal */
  --destructive: hsl(0 84.2% 60.2%); /* Rojo para errores */
  --border: hsl(240 5.9% 90%); /* Bordes sutiles */
}
```

### Variables CSS (Dark Mode)

```css
:root.dark {
  --background: hsl(20 14.3% 4.1%); /* Fondo oscuro */
  --foreground: hsl(60 9.1% 97.8%); /* Texto claro */
  --primary: hsl(60 9.1% 97.8%); /* Principal invertido */
}
```

---

## 🆚 Light vs Dark Mode

```
Light Mode ☀️
├── Fondo claro (#FCFCFC)
├── Texto oscuro
├── Botones oscuros
└── Bordes sutiles

Dark Mode 🌙
├── Fondo oscuro (carbón)
├── Texto claro
├── Botones claros
└── Bordes oscuros
```

### Cómo Activar Dark Mode

```javascript
// Agregar clase 'dark' al html
document.documentElement.classList.add('dark');

// O removerla
document.documentElement.classList.remove('dark');
```

---

## 🎯 Mapeo Tailwind ↔ Variables

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... */
}
```

### Uso en clases Tailwind

```html
<!-- Estas clases USAN las variables -->
<div class="bg-background text-foreground">
  <button class="bg-primary text-primary-foreground">Click</button>
</div>
```

---

## 🔤 Fuentes

```css
@theme {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: 'Inter', sans-serif;
}
```

### La Fuente Inter

```
Inter = Fuente moderna, limpia, legible
├── Diseñada para pantallas
├── Muy popular en apps modernas
└── Gratuita (Google Fonts)
```

---

## ✨ Animaciones Personalizadas

### Ease Spring (rebote suave)

```css
@theme {
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.1);
  --duration-400: 400ms;
}
```

```
cubic-bezier(0.175, 0.885, 0.32, 1.1)
       │       │       │      │
       │       │       │      └── Sobrepasa un poco (rebote)
       │       │       └── Velocidad final
       │       └── Velocidad media
       └── Velocidad inicial lenta
```

### View Transitions (cambio de tema)

```css
::view-transition-old(root) {
  animation: fade-out 0.2s;
}

::view-transition-new(root) {
  animation: fade-in 0.2s;
}
```

---

## 🛠️ Utilidades Personalizadas

### No Scrollbar

```css
@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

**Uso:**

```html
<div class="overflow-y-auto no-scrollbar">
  <!-- Scroll sin barra visible -->
</div>
```

---

## 📊 Capas de CSS (@layer)

```css
@layer theme, base, components, utilities;
```

### Orden de Prioridad

```
1. theme      → Variables y configuración (menos prioridad)
2. base       → Reset y estilos HTML base
3. components → Estilos de componentes
4. utilities  → Clases de utilidad Tailwind (más prioridad)
```

### ¿Por qué importa?

```css
/* base */
body { color: black; }

/* utilities */
.text-white { color: white; }

<!-- utilities GANA porque está después -->
<body class="text-white">  <!-- Texto blanco -->
```

---

## 🎨 Paleta de Colores

### Tu Paleta Actual

| Variable      | Light       | Dark        | Uso               |
| ------------- | ----------- | ----------- | ----------------- |
| `background`  | Casi blanco | Carbón      | Fondo de página   |
| `foreground`  | Negro       | Crema       | Texto principal   |
| `primary`     | Negro       | Crema       | Botones, links    |
| `secondary`   | Gris claro  | Gris oscuro | Fondos suaves     |
| `destructive` | Rojo        | Rojo oscuro | Errores, eliminar |
| `muted`       | Gris        | Gris        | Texto secundario  |

---

## 💡 Reglas Zen de Estilos

> [!important] Regla 1: Variables para colores
> Nunca uses `bg-red-500` directo, usa `bg-destructive`

> [!tip] Regla 2: Consistencia ante todo
> Usa las mismas variables en toda la app

> [!note] Regla 3: Mobile first
> Diseña para móvil primero, luego desktop

---

## 📎 Relacionados

- [[Tailwind]]
- [[Componentes UI]]
- [[Tema Oscuro]]
