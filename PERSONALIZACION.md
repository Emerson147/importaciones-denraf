# 🎨 GUÍA DE PERSONALIZACIÓN

Esta guía te ayudará a adaptar el sistema a diferentes tipos de negocios.

---

## 📋 TIPOS DE NEGOCIO SOPORTADOS

- 👕 **Tienda de Ropa** (clothing)
- 💊 **Farmacia** (pharmacy)
- 📱 **Electrónica** (electronics)
- 🍔 **Restaurant** (restaurant)
- 🔧 **Ferretería** (hardware)
- 🏪 **Genérico** (generic)

---

## 🎯 CAMBIAR TIPO DE NEGOCIO

### Opción 1: Usar Preset (Recomendado)

Edita `src/app/config/business.config.ts`:

```typescript
import { PRESET_CONFIGS } from './business.config';

// Para FARMACIA:
export const BUSINESS_CONFIG: BusinessConfig = {
  business: {
    name: 'Farmacia San José',
    type: 'pharmacy',
    // ...
  },
  branding: {
    logo: '/icons/pharmacy-logo.svg',
    primaryColor: '#10b981',  // Verde para farmacia
    // ...
  },
  // Aplica preset de farmacia
  ...PRESET_CONFIGS.pharmacy,
};
```

### Opción 2: Configuración Manual

```typescript
export const BUSINESS_CONFIG: BusinessConfig = {
  productFields: {
    expirationDate: true,  // ✅ Para farmacia
    batch: true,           // ✅ Para farmacia
    prescription: true,    // ✅ Para farmacia
    sizes: false,          // ❌ No aplica en farmacia
    colors: false,         // ❌ No aplica en farmacia
  },
};
```

---

## 🎨 PERSONALIZACIÓN VISUAL

### Cambiar Colores

En `business.config.ts`:

```typescript
branding: {
  primaryColor: '#10b981',    // Color principal
  secondaryColor: '#f0fdf4',  // Color secundario (fondo)
  accentColor: '#059669',     // Color de acento
}
```

Los colores se aplican automáticamente en:
- Botones principales
- Sidebar activo
- Badges y alertas
- Links y hover states

### Cambiar Logo

1. Coloca tu logo en `public/icons/`
2. Actualiza en `business.config.ts`:

```typescript
branding: {
  logo: '/icons/mi-logo.svg',
  favicon: '/icons/mi-favicon.ico',
}
```

### Cambiar Fuente

```typescript
branding: {
  fontFamily: 'Poppins, sans-serif',
}
```

**Agrega la fuente en `src/index.html`:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 📦 ACTIVAR/DESACTIVAR MÓDULOS

En `business.config.ts`:

```typescript
modules: {
  inventory: true,     // Gestión de inventario
  pos: true,           // Punto de venta
  clients: true,       // Base de datos de clientes
  sales: true,         // Historial de ventas
  reports: true,       // Reportes avanzados
  analytics: true,     // Analytics y KPIs
  goals: false,        // ❌ Desactivar metas
  users: false,        // ❌ Desactivar multi-usuario
}
```

Los módulos desactivados NO aparecerán en el menú lateral.

---

## 🏷️ PERSONALIZAR CAMPOS DE PRODUCTO

### Ejemplo: Farmacia

```typescript
productFields: {
  sizes: false,
  colors: false,
  brand: true,             // Laboratorio
  expirationDate: true,    // Fecha de vencimiento
  batch: true,             // Lote
  prescription: true,      // Requiere receta
  ingredients: true,       // Principio activo
}
```

### Ejemplo: Electrónica

```typescript
productFields: {
  sizes: false,
  colors: true,
  brand: true,
  model: true,            // Modelo (iPhone 15 Pro)
  serial: true,           // IMEI, número de serie
  warranty: true,         // Meses de garantía
}
```

### Ejemplo: Restaurant

```typescript
productFields: {
  sizes: true,            // Personal, Mediano, Familiar
  ingredients: true,      // Ingredientes
  expirationDate: false,
}
```

---

## 💳 TIPOS DE VENTA

### Activar tipos de venta

```typescript
saleTypes: {
  enabled: true,
  types: [
    { id: 'store', name: 'Tienda', icon: 'store' },
    { id: 'delivery', name: 'Delivery', icon: 'delivery_dining' },
    { id: 'online', name: 'Web', icon: 'language' },
  ]
}
```

### Desactivar tipos de venta

```typescript
saleTypes: {
  enabled: false,  // No mostrar selector de tipo de venta
}
```

---

## 🎫 PERSONALIZAR TICKET

En `business.config.ts`:

```typescript
ticket: {
  showLogo: true,
  showQR: true,
  showBarcode: true,
  footerMessage: '¡Vuelve pronto! 😊',
  businessInfo: {
    address: 'Av. Los Pinos 456, San Isidro',
    phone: '+51 987 654 321',
    email: 'ventas@mifarmacia.com',
    ruc: '20987654321',
  }
}
```

---

## 🌐 CAMBIAR IDIOMA Y MONEDA

```typescript
business: {
  currency: 'USD',          // USD, PEN, EUR, MXN
  currencySymbol: '$',      // $, S/, €, $MX
  timezone: 'America/New_York',
  language: 'en',           // en, es
}
```

---

## 🎨 EJEMPLO COMPLETO: FARMACIA

```typescript
export const BUSINESS_CONFIG: BusinessConfig = {
  business: {
    name: 'Farmacia MediPlus',
    type: 'pharmacy',
    currency: 'PEN',
    currencySymbol: 'S/',
    timezone: 'America/Lima',
    language: 'es',
  },

  branding: {
    logo: '/icons/farmacia-logo.svg',
    favicon: '/icons/farmacia-favicon.ico',
    primaryColor: '#10b981',      // Verde farmacia
    secondaryColor: '#f0fdf4',    // Verde muy claro
    accentColor: '#059669',       // Verde oscuro
    fontFamily: 'Inter, sans-serif',
  },

  modules: {
    inventory: true,
    pos: true,
    clients: true,
    sales: true,
    reports: true,
    analytics: false,  // No necesitan analytics avanzados
    goals: false,      // No necesitan metas
    users: true,       // Multi-usuario (turnos)
  },

  productFields: {
    sizes: false,
    colors: false,
    brand: true,              // Laboratorio
    model: false,
    serial: false,
    expirationDate: true,     // ✅ CRÍTICO
    batch: true,              // ✅ CRÍTICO
    prescription: true,       // ✅ CRÍTICO
    warranty: false,
    ingredients: true,        // Principio activo
  },

  saleTypes: {
    enabled: false,  // No necesitan tipos de venta
  },

  ticket: {
    showLogo: true,
    showQR: false,
    showBarcode: true,
    footerMessage: 'Cuida tu salud - Farmacia MediPlus',
    businessInfo: {
      address: 'Av. Salud 789, Miraflores, Lima',
      phone: '+51 987 123 456',
      email: 'ventas@mediplus.pe',
      ruc: '20123456789',
    },
  },
};
```

---

## 🚀 APLICAR CAMBIOS

Después de modificar `business.config.ts`:

1. Guarda los cambios
2. Reinicia el servidor de desarrollo: `npm start`
3. Los cambios se aplicarán automáticamente

---

## 📞 SOPORTE

¿Necesitas ayuda con la personalización?
- Email: soporte@tusistema.com
- WhatsApp: +51 XXX XXX XXX
