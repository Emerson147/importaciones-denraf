---
tags: [angular, index, moc]
created: 2024-12-17
style: zen-minimal
---

# 🧘 Angular Overview

> _"La simplicidad es la máxima sofisticación"_ — Leonardo da Vinci

---

## ¿Qué es Angular?

Angular es como un **set de LEGO profesional** para construir aplicaciones web.

Imagina que quieres construir una casita:

- 🧱 **HTML** = Los bloques (estructura)
- 🎨 **CSS/Tailwind** = La pintura (colores y estilos)
- ⚡ **TypeScript** = La electricidad (hace que funcione)
- 🏗️ **Angular** = Las instrucciones que unen todo

---

## Filosofía Zen en Angular

```
┌─────────────────────────────────────────┐
│                                         │
│   Menos código  →  Menos errores        │
│   Más claridad  →  Más mantenible       │
│   Un propósito  →  Un componente        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🏠 La Casa Angular (Arquitectura)

```
📂 src/app/
│
├── 🧱 core/        ← Cimientos (esenciales, invisibles)
│   ├── auth/           Quién puede entrar
│   ├── models/         Cómo se ven las cosas
│   └── services/       Los trabajadores
│
├── 🎨 features/    ← Habitaciones (funcionalidades)
│   ├── dashboard/      La oficina
│   ├── pos/            La caja registradora
│   └── inventory/      El almacén
│
├── 🖼️ layout/      ← Paredes y techo (estructura)
│   └── main-layout     Sidebar + contenido
│
└── 🧰 shared/      ← Muebles (reutilizables)
    ├── ui/             Botones, inputs, dialogs
    └── directives/     Comportamientos especiales
```

---

## 🧪 La Receta de un Componente

```typescript
@Component({
  selector: 'app-mi-componente', // 📛 Mi nombre
  standalone: true, // 🎒 Soy independiente
  imports: [CommonModule], // 🧰 Mis herramientas
  template: `<h1>Hola</h1>`, // 👁️ Lo que se ve
})
export class MiComponente {
  // ⚡ La lógica va aquí
}
```

---

## 📡 Signals - El Corazón Reactivo

```typescript
// 📝 Crear una pizarra mágica
nombre = signal('Juan');

// 👀 Leer (con paréntesis)
console.log(this.nombre()); // "Juan"

// ✏️ Escribir
this.nombre.set('María');
```

---

## 🎨 Tailwind 4 - Estilo Minimalista

```html
<!-- ❌ Antes: CSS desordenado -->
<style>
  .btn {
    background: black;
    color: white;
    padding: 12px;
  }
</style>

<!-- ✅ Ahora: Tailwind inline, limpio -->
<button class="bg-stone-900 text-white px-4 py-3 rounded-xl">Guardar</button>
```

---

## 🗺️ Mapa de Navegación

### Arquitectura

- [[Core]] → Servicios, modelos, auth
- [[Features]] → Módulos funcionales
- [[Layout]] → Estructura visual
- [[Shared]] → Componentes reutilizables
- [[Routing]] → Navegación

### Signals

- [[Signal Básico]] → signal(), set(), update()
- [[Computed]] → Valores derivados
- [[Effect]] → Reacciones automáticas

### Patrones

- [[Facade Pattern]] → Simplificar lo complejo
- [[Singleton]] → Una sola instancia
- [[Dependency Injection]] → Pedir lo que necesitas

---

## 💡 Principios Zen

> [!important] Regla 1: Un componente, un propósito
> Si hace dos cosas, divídelo en dos componentes

> [!tip] Regla 2: Signals sobre RxJS
> Para estado simple, usa signals. RxJS es para flujos complejos.

> [!note] Regla 3: Standalone siempre
> Angular moderno usa componentes independientes

---

## 📎 Enlaces

- [Angular Docs](https://angular.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [[Proyecto DENRAF]]
