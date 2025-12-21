---
tags: [angular, proyecto, estructura]
created: 2024-12-20
---

# 📁 Estructura del Proyecto - Mapa Completo

> _"Conoce cada rincón de tu casa"_

---

## 🏠 Vista General

```
sistema-master/
│
├── 📄 Configuración (raíz)
│   ├── package.json         → Lista de paquetes
│   ├── angular.json         → Config de Angular
│   ├── tsconfig.json        → Config de TypeScript
│   └── ngsw-config.json     → Config de PWA
│
├── 📂 public/               → Archivos estáticos
│   ├── favicon.ico
│   ├── icons/
│   └── manifest.webmanifest
│
├── 📂 src/                  → Tu código
│   ├── main.ts              → Punto de entrada
│   ├── styles.css           → Estilos globales
│   ├── index.html           → HTML principal
│   │
│   └── app/                 → La aplicación
│       ├── app.ts           → Componente raíz
│       ├── app.config.ts    → Configuración
│       ├── app.routes.ts    → Rutas
│       │
│       ├── core/            → Servicios y modelos
│       ├── features/        → Páginas/módulos
│       ├── layout/          → Estructura visual
│       └── shared/          → Componentes reutilizables
│
└── 📂 docs/obsidian/        → Tu documentación
```

---

## 📄 Archivos de Configuración

### En la Raíz

| Archivo              | Propósito                          |
| -------------------- | ---------------------------------- |
| `package.json`       | Paquetes npm y scripts             |
| `package-lock.json`  | Versiones exactas de paquetes      |
| `angular.json`       | Configuración del proyecto Angular |
| `tsconfig.json`      | Opciones de TypeScript             |
| `tsconfig.app.json`  | TS para la app                     |
| `tsconfig.spec.json` | TS para tests                      |
| `ngsw-config.json`   | Service Worker (PWA)               |
| `.editorconfig`      | Formato de código                  |
| `.gitignore`         | Archivos ignorados por Git         |

---

## 📂 public/ - Archivos Estáticos

```
public/
├── favicon.ico           → Ícono en la pestaña
├── manifest.webmanifest  → Identidad PWA
└── icons/
    ├── icon-192x192.png  → Ícono pequeño
    └── icon-512x512.png  → Ícono grande
```

Estos archivos se copian TAL CUAL a la carpeta final.

---

## 📂 src/ - Tu Código Fuente

### Archivos Principales

```
src/
├── main.ts        → Enciende la app
├── index.html     → HTML base
└── styles.css     → CSS global
```

### La Carpeta app/

```
src/app/
│
├── app.ts              → Componente raíz
├── app.config.ts       → Providers globales
├── app.routes.ts       → Todas las rutas
│
├── 🧱 core/            → LO ESENCIAL
│   ├── auth/              Autenticación
│   │   ├── auth.ts           Servicio
│   │   └── auth.guard.ts     Guard
│   ├── models/            Interfaces
│   │   └── index.ts
│   ├── services/          Servicios globales
│   │   ├── product.service.ts
│   │   ├── sales.service.ts
│   │   └── storage.service.ts
│   └── theme/             Tema claro/oscuro
│
├── 🎨 features/        → LAS PÁGINAS
│   ├── auth/              Login
│   ├── dashboard/         Inicio
│   ├── pos/               Punto de venta
│   ├── inventory/         Inventario
│   ├── clients/           Clientes
│   ├── sales/             Historial
│   └── users/             Usuarios
│
├── 🖼️ layout/          → LA ESTRUCTURA
│   └── main-layout.component.ts
│
└── 🧰 shared/          → REUTILIZABLES
    ├── ui/                Componentes
    │   ├── index.ts
    │   ├── ui-button/
    │   ├── ui-input/
    │   └── ...
    ├── directives/        Directivas
    │   └── click-outside/
    └── utils/             Utilidades
        └── cn.ts
```

---

## 🗂️ Convenciones de Nombres

### Archivos

```
componente.component.ts    → Componente
servicio.service.ts        → Servicio
modelo.model.ts            → Modelo
guardia.guard.ts           → Guard
directiva.directive.ts     → Directiva
```

### Carpetas

```
nombre-feature/            → Feature (kebab-case)
└── nombre-page/              Página
    ├── nombre.component.ts
    ├── nombre.component.html
    └── nombre.component.css
```

---

## 📁 ¿Dónde va cada cosa?

| Tipo             | Ubicación            | Ejemplo                    |
| ---------------- | -------------------- | -------------------------- |
| Servicio global  | `core/services/`     | `product.service.ts`       |
| Modelo/Interface | `core/models/`       | `Product`, `Sale`          |
| Autenticación    | `core/auth/`         | `auth.ts`, `auth.guard.ts` |
| Página nueva     | `features/nombre/`   | `features/reports/`        |
| Componente UI    | `shared/ui/`         | `ui-button/`               |
| Directiva        | `shared/directives/` | `click-outside/`           |
| Utilidad         | `shared/utils/`      | `cn.ts`                    |
| Layout           | `layout/`            | `main-layout.component.ts` |

---

## 📊 Dependencias entre Carpetas

```
                    ┌─────────────┐
                    │   layout/   │
                    └──────┬──────┘
                           │ usa
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  features/   │  │   shared/    │  │    core/     │
  └──────┬───────┘  └──────────────┘  └──────────────┘
         │                 ▲                 ▲
         │ usa             │ usa             │
         └─────────────────┴─────────────────┘
```

### Reglas:

```
✅ features/ → puede usar → shared/ y core/
✅ layout/   → puede usar → shared/ y core/
✅ shared/   → puede usar → core/ (solo utils/services)
❌ core/     → NO puede usar → features/ (dependencia circular)
```

---

## 📦 Build Output

### Cuando haces `npm run build`:

```
dist/
└── sistema-master/
    └── browser/
        ├── index.html        ← Tu página
        ├── main-abc123.js    ← Todo tu código
        ├── polyfills-def.js  ← Compatibilidad
        ├── styles-xyz789.css ← Tus estilos
        ├── ngsw-worker.js    ← Service Worker
        ├── manifest.webmanifest
        └── assets/           ← Imágenes, etc.
```

---

## 💡 Reglas Zen de Estructura

> [!important] Regla 1: Cada cosa en su lugar
> Servicios en core/, páginas en features/, UI en shared/

> [!tip] Regla 2: Barrel exports
> Usa index.ts para exportar todo de una carpeta

> [!note] Regla 3: Evita dependencias circulares
> core/ nunca importa de features/

---

## 📎 Relacionados

- [[Core]]
- [[Features]]
- [[Shared]]
- [[Layout]]
