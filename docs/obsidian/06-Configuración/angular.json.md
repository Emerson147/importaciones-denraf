---
tags: [angular, configuración, build]
created: 2024-12-20
---

# ⚙️ angular.json - El Plano de Construcción

> _"Cómo Angular debe construir tu app"_

---

## 🎒 ¿Qué es angular.json?

Es el **plano de construcción** que le dice a Angular:

- 📁 Dónde está tu código
- 🔨 Cómo compilarlo
- 📦 Dónde poner el resultado

---

## 📋 Estructura Principal

```json
{
  "projects": {
    "sistema-master": {        // 📛 Tu proyecto
      "projectType": "application",
      "sourceRoot": "src",      // 📁 Código fuente aquí
      "prefix": "app",          // 🏷️ Prefijo de componentes

      "architect": {            // 🔧 Tareas de construcción
        "build": { ... },       // Compilar
        "serve": { ... },       // Servidor desarrollo
        "test": { ... }         // Pruebas
      }
    }
  }
}
```

---

## 🔨 Architect: build

### ¿Qué hace?

Compila tu código TypeScript a JavaScript que el navegador entiende.

```json
"build": {
  "builder": "@angular/build:application",
  "options": {
    "browser": "src/main.ts",       // 🚀 Punto de entrada
    "tsConfig": "tsconfig.app.json",// ⚙️ Config de TypeScript
    "assets": [                      // 📦 Archivos estáticos
      { "glob": "**/*", "input": "public" }
    ],
    "styles": ["src/styles.css"]    // 🎨 CSS global
  }
}
```

### Configuraciones

```json
"configurations": {
  "production": {        // Para publicar
    "outputHashing": "all",       // Cache busting
    "serviceWorker": "ngsw-config.json"  // PWA
  },
  "development": {       // Para desarrollar
    "optimization": false,        // Sin optimizar (más rápido)
    "sourceMap": true            // Mapas para debug
  }
}
```

---

## 🖥️ Architect: serve

### ¿Qué hace?

Inicia un servidor local para ver tu app mientras programas.

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "configurations": {
    "development": {
      "buildTarget": "sistema-master:build:development"
    }
  },
  "defaultConfiguration": "development"
}
```

### Resultado

```bash
npm start
# → http://localhost:4200
# → Se actualiza automáticamente cuando guardas
```

---

## 📊 Budgets - Control de Tamaño

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kB",  // ⚠️ Alerta si > 500KB
    "maximumError": "1MB"       // ❌ Error si > 1MB
  }
]
```

### ¿Por qué importa?

```
App pequeña = Carga rápida = Usuarios felices
App grande  = Carga lenta  = Usuarios se van

Budget = Alarma que te avisa si tu app crece mucho
```

---

## 🎨 Assets y Styles

### Assets (archivos estáticos)

```json
"assets": [
  { "glob": "**/*", "input": "public" }
]
```

```
public/
├── favicon.ico         → Se copia tal cual
├── icons/              → Se copia tal cual
└── manifest.webmanifest → Se copia tal cual
```

### Styles (CSS global)

```json
"styles": ["src/styles.css"]
```

Este CSS aplica a TODA la app.

---

## 📁 Estructura Resultante

### En desarrollo (npm start)

```
Memoria (no archivos físicos)
└── Se sirve desde localhost:4200
```

### En producción (npm run build)

```
dist/
└── sistema-master/
    └── browser/
        ├── index.html        ← Tu página
        ├── main-abc123.js    ← Tu código
        ├── styles-xyz789.css ← Tus estilos
        └── assets/           ← Imágenes, etc.
```

---

## 🆚 Development vs Production

| Aspecto         | Development | Production  |
| --------------- | ----------- | ----------- |
| Optimización    | ❌ Apagado  | ✅ Máximo   |
| Source maps     | ✅ Sí       | ❌ No       |
| Minificación    | ❌ No       | ✅ Sí       |
| Tree shaking    | ❌ No       | ✅ Sí       |
| Service Worker  | ❌ No       | ✅ Sí (PWA) |
| Velocidad build | 🚀 Rápido   | 🐢 Lento    |

---

## 💡 Reglas Zen de angular.json

> [!important] Regla 1: No edites manualmente
> Usa `ng config` o las opciones de CLI cuando puedas

> [!tip] Regla 2: Budgets son tu amigo
> Mantienen tu app rápida

> [!note] Regla 3: Development para programar
> Production solo para publicar

---

## 📎 Relacionados

- [[package.json]]
- [[tsconfig.json]]
- [[PWA Configuration]]
