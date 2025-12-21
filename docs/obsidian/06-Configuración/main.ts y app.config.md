---
tags: [angular, bootstrap, configuración]
created: 2024-12-20
---

# 🚀 main.ts y app.config.ts - El Arranque

> _"Cómo tu app enciende por primera vez"_

---

## 🎒 ¿Qué hacen estos archivos?

```
main.ts     → Enciende el motor
app.config.ts → La configuración del motor
```

---

## 🔑 main.ts - La Llave de Encendido

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 🚀 Enciende la aplicación
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

### ¿Qué hace cada línea?

```typescript
// 1. Importa la función para iniciar
import { bootstrapApplication } from '@angular/platform-browser';

// 2. Importa tu configuración
import { appConfig } from './app/app.config';

// 3. Importa el componente raíz
import { App } from './app/app';

// 4. ¡ENCIENDE TODO!
bootstrapApplication(App, appConfig);
```

---

## ⚙️ app.config.ts - La Configuración

```typescript
// app.config.ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // 🌐 Navegación
    provideRouter(routes),

    // ✨ Animaciones
    provideAnimations(),

    // 📱 PWA (solo en producción)
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

---

## 📦 Los Providers Explicados

### `provideRouter(routes)`

```typescript
provideRouter(routes);
```

```
"Activa la navegación"
├── /dashboard → DashboardComponent
├── /pos → PosComponent
└── /login → LoginComponent
```

### `provideAnimations()`

```typescript
provideAnimations();
```

```
"Activa animaciones Angular"
├── [@triggerName] funciona
├── Transiciones suaves
└── Animaciones en componentes
```

### `provideServiceWorker()`

```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(), // Solo en producción
  registrationStrategy: 'registerWhenStable:30000',
});
```

```
"Activa el modo offline (PWA)"
├── Cache de archivos
├── Funciona sin internet
└── Se registra después de 30 segundos
```

---

## 🔄 Flujo de Inicio

```
1. Navegador carga index.html
   ↓
2. index.html carga main.js
   ↓
3. main.js ejecuta main.ts
   ↓
4. main.ts llama bootstrapApplication()
   ↓
5. Angular lee appConfig
   ↓
6. Configura providers (router, animaciones, SW)
   ↓
7. Renderiza el componente App
   ↓
8. Tu app está lista! 🎉
```

---

## 🆚 Antes vs Ahora (Angular Moderno)

### ❌ Antes (con NgModules)

```typescript
// app.module.ts (VIEJO)
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

// main.ts (VIEJO)
platformBrowserDynamic().bootstrapModule(AppModule);
```

### ✅ Ahora (Standalone)

```typescript
// app.config.ts (NUEVO)
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimations()],
};

// main.ts (NUEVO)
bootstrapApplication(App, appConfig);
```

---

## 📋 Providers Comunes

| Provider                       | ¿Qué hace?           |
| ------------------------------ | -------------------- |
| `provideRouter()`              | Navegación           |
| `provideAnimations()`          | Animaciones          |
| `provideHttpClient()`          | Llamadas HTTP        |
| `provideServiceWorker()`       | PWA/Offline          |
| `provideZoneChangeDetection()` | Detección de cambios |

### Si necesitas HTTP:

```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // ← Agregar esto
    // ...
  ],
};
```

---

## 🧪 El Componente Raíz (App)

```typescript
// app.ts o app.component.ts
@Component({
  selector: 'app-root', // 👈 Lo que está en index.html
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />', // 👈 Donde van las páginas
})
export class App {}
```

### En index.html

```html
<body>
  <app-root></app-root>
  <!-- 👈 Aquí se monta todo -->
</body>
```

---

## 💡 Reglas Zen del Bootstrap

> [!important] Regla 1: Un solo bootstrap
> Solo llamas `bootstrapApplication()` una vez

> [!tip] Regla 2: Providers globales en appConfig
> Todo lo que necesita toda la app va aquí

> [!note] Regla 3: Standalone es el futuro
> No más NgModules, todo es providers

---

## 📎 Relacionados

- [[Routing]]
- [[PWA Configuration]]
- [[Core]]
