---
tags: [angular, html, pwa, meta]
created: 2024-12-20
---

# 📄 index.html - La Puerta de Entrada

> _"El primer archivo que carga el navegador"_

---

## 🎒 ¿Qué es index.html?

Es la **página principal** que carga todo lo demás:

- 📝 Meta información (título, descripción)
- 🔗 Enlaces a fuentes y estilos
- 📱 Configuración PWA
- 🎯 Donde se monta Angular (`<app-root>`)

---

## 📋 Tu index.html Explicado

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <!-- 📝 INFORMACIÓN BÁSICA -->
    <meta charset="utf-8" />
    <title>DenRaf - Sistema de Gestión Empresarial</title>
    <base href="/" />

    <!-- 📱 RESPONSIVE -->
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- 🔍 SEO -->
    <meta name="description" content="Sistema moderno de gestión..." />

    <!-- 📲 PWA / MOBILE -->
    <meta name="theme-color" content="#1c1917" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <link rel="manifest" href="manifest.webmanifest" />

    <!-- 🎨 RECURSOS EXTERNOS -->
    <link rel="icon" href="favicon.ico" />
    <link href="https://fonts.googleapis.com/..." rel="stylesheet" />
  </head>

  <body>
    <!-- 🎯 AQUÍ SE MONTA TODA LA APP -->
    <app-root></app-root>

    <!-- 🚫 MENSAJE SI NO HAY JAVASCRIPT -->
    <noscript>Please enable JavaScript...</noscript>
  </body>
</html>
```

---

## 📝 Meta Tags Importantes

### Información Básica

```html
<!-- Título en la pestaña del navegador -->
<title>DenRaf - Sistema de Gestión Empresarial</title>

<!-- Descripción para Google -->
<meta name="description" content="Sistema moderno de gestión..." />

<!-- Base URL para rutas relativas -->
<base href="/" />
```

### Responsive (Mobile)

```html
<!-- Hace que funcione bien en celulares -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

```
Sin viewport:
  📱 Página de escritorio encogida en celular
  → Difícil de leer

Con viewport:
  📱 Página adaptada al tamaño del celular
  → Fácil de usar
```

---

## 📱 Meta Tags PWA

### Color del tema

```html
<meta name="theme-color" content="#1c1917" />
```

```
Esto cambia el color de la barra del navegador
en dispositivos móviles al color de tu marca.

#1c1917 = Gris oscuro (stone-900 de Tailwind)
```

### Apple-specific

```html
<!-- Permite ejecutar como app en iOS -->
<meta name="apple-mobile-web-app-capable" content="yes" />

<!-- Estilo de la barra de estado en iOS -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

<!-- Nombre cuando se agrega al home screen -->
<meta name="apple-mobile-web-app-title" content="DenRaf" />
```

### Manifest

```html
<!-- Archivo de configuración PWA -->
<link rel="manifest" href="manifest.webmanifest" />
```

---

## 🔤 Fuentes (Google Fonts)

```html
<!-- Fuente principal: Inter (moderna, legible) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600" rel="stylesheet" />

<!-- Fuente decorativa: Playfair Display (elegante) -->
<link
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600"
  rel="stylesheet"
/>

<!-- Íconos de Material Design -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
```

### Uso de Material Icons

```html
<!-- En cualquier parte de tu app -->
<span class="material-icons-outlined">dashboard</span>
<span class="material-icons-outlined">shopping_cart</span>
<span class="material-icons-outlined">settings</span>
```

---

## 🎯 El Elemento `<app-root>`

```html
<body>
  <app-root></app-root>
</body>
```

### ¿Qué pasa aquí?

```
1. Navegador carga index.html
   ↓
2. Ve <app-root></app-root>
   ↓
3. Angular reemplaza <app-root> con tu AppComponent
   ↓
4. AppComponent tiene <router-outlet>
   ↓
5. Router muestra el componente según la URL
```

### Analogía

```
<app-root> es como un marco de fotos vacío

Angular viene y pone la foto (tu app) dentro

La foto cambia según la URL:
  /login → foto de login
  /dashboard → foto de dashboard
```

---

## 🚫 Noscript

```html
<noscript>Please enable JavaScript to continue using this application.</noscript>
```

Se muestra SOLO si el usuario tiene JavaScript deshabilitado.
(Raro hoy en día, pero buena práctica)

---

## 📁 Recursos Estáticos

### Favicon

```html
<link rel="icon" type="image/x-icon" href="favicon.ico" />
```

El íconito en la pestaña del navegador.

### Apple Touch Icon

```html
<link rel="apple-touch-icon" href="assets/icons/icon-192x192.png" />
```

Ícono cuando agregan tu app al home screen de iOS.

---

## 🔧 Cosas que Angular Agrega Automáticamente

Cuando haces `npm run build`, Angular agrega:

```html
<!-- ANTES del cierre de </head> -->
<link rel="stylesheet" href="styles.abc123.css" />

<!-- ANTES del cierre de </body> -->
<script src="polyfills.def456.js" type="module"></script>
<script src="main.xyz789.js" type="module"></script>
```

Estos son tus estilos y código compilados.

---

## 💡 Reglas Zen de index.html

> [!important] Regla 1: No pongas código aquí
> Todo tu código va en Angular, no en index.html

> [!tip] Regla 2: Optimiza para SEO
> Buenos meta tags = mejor ranking en Google

> [!note] Regla 3: PWA meta tags son importantes
> Para que tu app funcione bien en móviles

---

## 📎 Relacionados

- [[main.ts y app.config]]
- [[PWA Configuration]]
- [[Componente App]]
