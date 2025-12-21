---
tags: [angular, componente, app, raíz]
created: 2024-12-20
---

# 🌳 Componente App - La Raíz del Árbol

> _"Todo empieza aquí"_

---

## 🎒 ¿Qué es el Componente App?

Es el **componente raíz** de toda tu aplicación.
Todo lo demás está DENTRO de este componente.

```
App (raíz)
└── RouterOutlet
    └── MainLayout (si estás logueado)
        └── Dashboard / POS / etc.
    └── LoginPage (si NO estás logueado)
```

---

## 📋 Tu Componente App

```typescript
@Component({
  selector: 'app-root', // 👈 Lo que está en index.html
  imports: [RouterOutlet, UiCommandPaletteComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  // 📝 Título de la app
  protected readonly title = signal('sistema-master');

  // 🔌 Servicios inyectados
  private salesService = inject(SalesService);
  searchService = inject(SearchService);

  ngOnInit() {
    // 📦 Cargar datos al iniciar
    this.salesService.loadFromLocalStorage();
  }

  // ⌨️ Atajo de teclado global (Ctrl+K / Cmd+K)
  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.searchService.toggle();
    }
  }
}
```

---

## 🎯 El Selector `app-root`

```typescript
@Component({
  selector: 'app-root',
  // ...
})
```

Este selector corresponde a lo que está en `index.html`:

```html
<body>
  <app-root></app-root>
  <!-- Aquí se monta -->
</body>
```

---

## 📦 Imports del Componente

```typescript
imports: [RouterOutlet, UiCommandPaletteComponent];
```

### RouterOutlet

El "hueco" donde se muestran las páginas según la URL.

### UiCommandPaletteComponent

La paleta de comandos (Ctrl+K) que aparece encima de todo.

---

## 🔄 Ciclo de Vida: ngOnInit

```typescript
ngOnInit() {
  // Se ejecuta UNA VEZ cuando el componente se crea
  this.salesService.loadFromLocalStorage();
}
```

### ¿Por qué aquí?

```
1. App se crea
   ↓
2. ngOnInit se ejecuta
   ↓
3. Carga ventas de localStorage
   ↓
4. Ahora las ventas están disponibles para toda la app
```

Es el lugar perfecto para **inicializar datos globales**.

---

## ⌨️ HostListener - Escuchar Eventos Globales

```typescript
@HostListener('document:keydown', ['$event'])
handleGlobalKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    this.searchService.toggle();
  }
}
```

### ¿Qué hace?

```
1. Usuario presiona Ctrl+K (o Cmd+K en Mac)
   ↓
2. El evento se captura en TODO el documento
   ↓
3. handleGlobalKeydown se ejecuta
   ↓
4. Abre/cierra la paleta de búsqueda
```

### Analogía

```
HostListener es como un vigilante en la puerta:

"Si alguien presiona Ctrl+K, avísame"

No importa dónde estés en la app,
el vigilante siempre está escuchando.
```

---

## 📄 Template (app.html)

```html
<!-- Paleta de comandos (siempre disponible) -->
@if (searchService.isOpen()) {
<app-ui-command-palette />
}

<!-- Aquí van las páginas -->
<router-outlet />
```

### router-outlet

```
URL: /login      → Muestra LoginPage
URL: /dashboard  → Muestra MainLayout → Dashboard
URL: /pos        → Muestra MainLayout → POS
```

---

## 🎨 Estilos (app.css)

Normalmente casi vacío porque:

- Estilos globales están en `styles.css`
- Cada componente tiene sus propios estilos

---

## 🆚 Componente App vs Angular Antiguo

### ❌ Antes (con NgModules)

```typescript
// app.module.ts
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### ✅ Ahora (Standalone)

```typescript
// app.ts
@Component({
  selector: 'app-root',
  standalone: true, // Implícito en Angular 19+
  imports: [RouterOutlet],
})
export class App {}
```

Más simple, menos archivos.

---

## 📊 Jerarquía de Componentes

```
App (app-root)
│
├── UiCommandPaletteComponent (paleta de búsqueda)
│
└── RouterOutlet
    │
    ├── LoginPageComponent (si ruta es /login)
    │
    └── MainLayoutComponent (si ruta es /, /dashboard, etc.)
        │
        ├── Sidebar
        ├── Topbar
        │
        └── RouterOutlet (anidado)
            │
            ├── DashboardPageComponent
            ├── PosPageComponent
            ├── InventoryPageComponent
            └── ... etc
```

---

## 💡 Reglas Zen del Componente App

> [!important] Regla 1: Mantén App mínimo
> Solo router-outlet y cosas verdaderamente globales

> [!tip] Regla 2: Inicializa aquí datos globales
> ngOnInit es perfecto para cargar localStorage

> [!note] Regla 3: HostListener para atajos globales
> Ctrl+K, Escape, etc. van aquí

---

## 📎 Relacionados

- [[main.ts y app.config]]
- [[app.routes.ts]]
- [[Layout]]
- [[index.html]]
