---
tags: [angular, configuración, npm, paquetes]
created: 2024-12-20
---

# 📦 package.json - La Lista de Compras

> _"Todo lo que tu proyecto necesita para funcionar"_

---

## 🎒 ¿Qué es package.json?

Es como una **lista de compras** para tu proyecto:

- 📝 Nombre del proyecto
- 📋 Comandos para ejecutar
- 🛒 Paquetes que necesitas

---

## 📋 Tu package.json Explicado

```json
{
  "name": "sistema-master",  // 📛 Nombre de tu app
  "version": "0.0.0",        // 🔢 Versión actual

  // 🎮 SCRIPTS - Comandos mágicos
  "scripts": {
    "start": "ng serve",     // npm start → Inicia el servidor
    "build": "ng build",     // npm run build → Crea versión final
    "test": "ng test"        // npm test → Ejecuta pruebas
  },

  // 📦 DEPENDENCIAS - Lo que tu app NECESITA
  "dependencies": { ... },

  // 🔧 DEV DEPENDENCIES - Solo para programar
  "devDependencies": { ... }
}
```

---

## 🎮 Scripts - Los Comandos Mágicos

### La Magia de npm scripts

```bash
# En vez de escribir esto (largo):
node_modules/.bin/ng serve --open

# Escribes esto (corto):
npm start
```

### Tus Comandos Disponibles

| Comando         | ¿Qué hace?                          |
| --------------- | ----------------------------------- |
| `npm start`     | 🚀 Inicia el servidor de desarrollo |
| `npm run build` | 📦 Crea versión de producción       |
| `npm run watch` | 👀 Build que se actualiza solo      |
| `npm test`      | 🧪 Ejecuta las pruebas              |

### Analogía

```
npm start = Encender la estufa para cocinar
npm build = Empacar la comida para vender
npm test  = Probar si la comida sabe bien
```

---

## 📦 Dependencias - Tu Lista de Compras

### Dependencies (tu app las necesita)

```json
"dependencies": {
  // 🅰️ ANGULAR - El framework principal
  "@angular/core": "^21.0.0",       // El cerebro
  "@angular/common": "^21.0.0",     // Herramientas comunes
  "@angular/router": "^21.0.0",     // Navegación
  "@angular/forms": "^21.0.0",      // Formularios
  "@angular/animations": "^21.0.1", // Animaciones
  "@angular/cdk": "^21.0.1",        // Componentes base
  "@angular/service-worker": "^21.0.0", // PWA offline

  // 🎨 ESTILOS
  "tailwindcss": "^4.1.17",        // CSS moderno
  "@tailwindcss/cli": "^4.1.17",   // Comandos Tailwind
  "tailwind-merge": "^3.4.0",      // Para cn()
  "clsx": "^2.1.1",                // Combinar clases

  // 📊 GRÁFICOS Y REPORTES
  "apexcharts": "^5.3.6",          // Gráficos bonitos
  "ng-apexcharts": "^2.0.4",       // Angular + ApexCharts
  "jspdf": "^3.0.4",               // Crear PDFs
  "jspdf-autotable": "^5.0.2",     // Tablas en PDF
  "xlsx": "^0.18.5",               // Exportar a Excel
  "qrcode": "^1.5.4",              // Generar QR codes

  // 🔧 UTILIDADES
  "rxjs": "~7.8.0",                // Programación reactiva
  "tslib": "^2.3.0",               // Helpers de TypeScript
  "tw-animate-css": "^1.4.0"       // Animaciones CSS
}
```

### DevDependencies (solo para programar)

```json
"devDependencies": {
  "@angular/cli": "^21.0.1",      // Comandos ng
  "@angular/build": "^21.0.1",    // Compilador
  "typescript": "~5.9.2",         // El lenguaje
  "vitest": "^4.0.8"              // Pruebas
}
```

---

## 🆚 Dependencies vs DevDependencies

```
Dependencies (📦):
└── Van en la app final
└── Los usuarios las descargan
└── Ejemplo: @angular/core

DevDependencies (🔧):
└── Solo para programar
└── No van en la app final
└── Ejemplo: typescript, vitest
```

### Analogía

```
Dependencies = Ingredientes de la pizza 🍕
  → Masa, salsa, queso (van en el producto final)

DevDependencies = Utensilios de cocina 🔧
  → Horno, cuchillo (los usas para cocinar,
     pero no los comes)
```

---

## 🔢 Versiones - Los Números Mágicos

```json
"@angular/core": "^21.0.0"
                  │││
                  ││└── Patch (arreglos)
                  │└─── Minor (nuevas features)
                  └──── Major (cambios grandes)
```

### El Símbolo `^`

```
"^21.0.0" significa:
├── ✅ 21.0.1 (patch) → Sí, automáticamente
├── ✅ 21.1.0 (minor) → Sí, automáticamente
└── ❌ 22.0.0 (major) → No, puede romper cosas
```

---

## 🛠️ Comandos de npm

### Instalar todo

```bash
npm install  # Lee package.json y descarga todo
```

### Agregar paquete nuevo

```bash
npm install nombre-paquete      # A dependencies
npm install -D nombre-paquete   # A devDependencies
```

### Actualizar paquetes

```bash
npm update         # Actualiza según ^
npm outdated       # Muestra qué está viejo
```

---

## 💡 Reglas Zen de package.json

> [!important] Regla 1: Nunca edites node_modules
> Si algo falla, borra la carpeta y haz `npm install` de nuevo

> [!tip] Regla 2: Commitea package-lock.json
> Asegura que todos tengan las mismas versiones exactas

> [!note] Regla 3: DevDependencies con -D
> `npm install -D typescript` para herramientas de desarrollo

---

## 📎 Relacionados

- [[angular.json]]
- [[tsconfig.json]]
- [[Comandos npm]]
