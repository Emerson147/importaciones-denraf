---
tags: [angular, pwa, offline, service-worker]
created: 2024-12-20
---

# 📱 PWA - Tu App como App de Celular

> _"Una web que funciona sin internet"_

---

## 🎒 ¿Qué es una PWA?

**Progressive Web App** = Una página web que:

- 📲 Se puede "instalar" en el celular
- 📴 Funciona sin internet
- 🔔 Puede enviar notificaciones
- 🚀 Carga súper rápido

---

## 🏗️ Tu Configuración PWA

### 1. Service Worker habilitado

```typescript
// app.config.ts
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(), // Solo en producción
  registrationStrategy: 'registerWhenStable:30000',
});
```

### 2. Configuración de cache

```json
// ngsw-config.json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch", // Descarga todo al instalar
      "resources": {
        "files": ["/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy", // Descarga cuando se necesita
      "resources": {
        "files": ["/**/*.png", "/**/*.jpg"]
      }
    }
  ]
}
```

---

## 📦 Estrategias de Cache

### prefetch (Descargar todo ya)

```
Instalas la app → Descarga TODO inmediatamente
↓
Vas offline → ✅ Todo funciona

Ideal para: HTML, CSS, JS principal
```

### lazy (Descargar cuando se necesite)

```
Instalas la app → No descarga nada
↓
Ves una imagen → La descarga y guarda
↓
Vas offline → ✅ Esa imagen funciona

Ideal para: Imágenes, archivos grandes
```

---

## 🔄 Data Groups - Cache de Datos

```json
"dataGroups": [
  {
    "name": "api-freshness",
    "urls": ["/api/sales/**", "/api/inventory/**"],
    "cacheConfig": {
      "strategy": "freshness",  // Siempre pide al servidor
      "timeout": "5s",          // Si no responde en 5s → usa cache
      "maxAge": "1h"            // Cache válido por 1 hora
    }
  },
  {
    "name": "api-performance",
    "urls": ["/api/products/**"],
    "cacheConfig": {
      "strategy": "performance", // Usa cache primero
      "maxAge": "12h"
    }
  }
]
```

### Estrategias

| Estrategia    | Comportamiento                        |
| ------------- | ------------------------------------- |
| `freshness`   | Servidor primero, cache como backup   |
| `performance` | Cache primero, servidor en background |

---

## 📲 Manifest - Identidad de la App

```json
// manifest.webmanifest
{
  "name": "Sistema DENRAF",
  "short_name": "DENRAF",
  "theme_color": "#1c1917",
  "background_color": "#fafaf9",
  "display": "standalone",
  "icons": [
    { "src": "icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "icons/icon-512x512.png", "sizes": "512x512" }
  ]
}
```

### Opciones de Display

```
standalone → Parece app nativa (sin barra de navegador)
fullscreen → Pantalla completa
minimal-ui → Con algunos controles del navegador
browser    → Como página web normal
```

---

## 🔄 Flujo de Funcionamiento

```
1. Usuario visita tu web
   ↓
2. Service Worker se instala
   ↓
3. Descarga archivos importantes (prefetch)
   ↓
4. Usuario vuelve a visitar
   ↓
5. SW intercepta peticiones
   ├── ¿Está en cache? → Sirve desde cache 🚀
   └── ¿No está? → Pide al servidor
   ↓
6. Usuario va offline
   ↓
7. SW sirve todo desde cache ✅
```

---

## 📴 Tu Sistema Offline

### Lo que ya tienes:

```
✅ Productos → Se guardan en localStorage
✅ Ventas → Se guardan en localStorage
✅ Usuarios → Se guardan en localStorage
✅ Service Worker → Cache de la app
```

### Flujo de ventas offline:

```
1. Usuario hace venta sin internet
   ↓
2. Se guarda en localStorage como "pendiente"
   ↓
3. Usuario recupera internet
   ↓
4. App sincroniza ventas pendientes
   ↓
5. Actualiza estado a "sincronizado"
```

---

## 🛠️ Archivos de PWA

```
📁 Proyecto
├── ngsw-config.json      ← Configuración del Service Worker
├── public/
│   ├── manifest.webmanifest  ← Identidad de la app
│   └── icons/
│       ├── icon-192x192.png
│       └── icon-512x512.png
└── src/
    └── index.html        ← Link al manifest
```

### En index.html

```html
<head>
  <link rel="manifest" href="manifest.webmanifest" />
  <meta name="theme-color" content="#1c1917" />
</head>
```

---

## 🧪 Probar PWA

### Solo funciona en producción:

```bash
# 1. Build de producción
npm run build

# 2. Servir con un servidor
npx http-server dist/sistema-master/browser

# 3. Abrir en navegador
# → DevTools → Application → Service Workers
```

### En development NO funciona:

```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(), // ← Solo en producción
});
```

---

## 💡 Reglas Zen de PWA

> [!important] Regla 1: Cache inteligente
> prefetch para lo esencial, lazy para lo pesado

> [!tip] Regla 2: Offline-first para datos críticos
> Ventas deben funcionar sin internet

> [!note] Regla 3: Solo en producción
> PWA no funciona con `npm start`

---

## 📎 Relacionados

- [[angular.json]]
- [[Offline Mode]]
- [[Storage Service]]
