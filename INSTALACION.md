# 🚀 GUÍA DE INSTALACIÓN - Sistema POS

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm 9+ instalado
- Cuenta en Supabase (gratis)
- Cuenta en Cloudinary (opcional, para imágenes)

---

## 🔧 INSTALACIÓN PASO A PASO

### 1️⃣ Clonar el repositorio

```bash
git clone <tu-repositorio>
cd sistema-master
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar Base de Datos (Supabase)

#### A. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratis
3. Crea un nuevo proyecto
4. Guarda tu **URL** y **API Key**

#### B. Ejecutar SQL de creación de tablas

Copia y ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  brand TEXT,
  
  -- Campos opcionales según tipo de negocio
  model TEXT,
  serial TEXT,
  expiration_date DATE,
  batch TEXT,
  requires_prescription BOOLEAN DEFAULT false,
  warranty_months INTEGER,
  ingredients TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit TIMESTAMP,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number TEXT NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  customer_id UUID REFERENCES clients(id),
  customer_name TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  sale_type TEXT,
  vendor TEXT,
  status TEXT DEFAULT 'completed',
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de movimientos de inventario
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost DECIMAL(10,2),
  total DECIMAL(10,2),
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_movements_date ON inventory_movements(date);

-- Habilitar Row Level Security (RLS) - Opcional
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Política para permitir todo a usuarios autenticados
CREATE POLICY "Allow all for authenticated users" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON sales FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON inventory_movements FOR ALL TO authenticated USING (true);
```

### 4️⃣ Configurar Variables de Entorno

Crea el archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    key: 'tu-anon-key-aqui'
  }
};
```

Y `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://tu-proyecto.supabase.co',
    key: 'tu-anon-key-aqui'
  }
};
```

### 5️⃣ Configurar Cloudinary (Opcional)

Si quieres usar imágenes, configura en `src/environments/cloudinary.config.ts`:

```typescript
export const cloudinaryConfig = {
  cloudName: 'tu-cloud-name',
  uploadPreset: 'tu-preset',
};
```

---

## 🎨 PERSONALIZACIÓN DEL NEGOCIO

### 📝 Configuración Principal

Edita el archivo `src/app/config/business.config.ts`:

```typescript
export const BUSINESS_CONFIG: BusinessConfig = {
  business: {
    name: 'Tu Negocio',              // 🔥 CAMBIAR
    type: 'clothing',                // 🔥 CAMBIAR: clothing, pharmacy, electronics, restaurant, hardware, generic
    currency: 'PEN',
    currencySymbol: 'S/',
    timezone: 'America/Lima',
    language: 'es',
  },

  branding: {
    logo: '/icons/logo.svg',         // 🔥 CAMBIAR
    primaryColor: '#1a1a1a',         // 🔥 CAMBIAR
    secondaryColor: '#f5f5f4',       // 🔥 CAMBIAR
    accentColor: '#78716c',
    fontFamily: 'Inter, sans-serif',
  },

  modules: {
    inventory: true,    // Activar/desactivar módulos
    pos: true,
    clients: true,
    sales: true,
    reports: true,
    analytics: true,
    goals: true,
    users: true,
  },

  ticket: {
    businessInfo: {
      address: 'Tu dirección',       // 🔥 CAMBIAR
      phone: 'Tu teléfono',          // 🔥 CAMBIAR
      email: 'Tu email',             // 🔥 CAMBIAR
      ruc: 'Tu RUC',                 // 🔥 CAMBIAR
    },
  },
};
```

### 🎨 Usar Preset por Tipo de Negocio

Si quieres un preset automático, usa:

```typescript
import { PRESET_CONFIGS } from './business.config';

export const BUSINESS_CONFIG: BusinessConfig = {
  ...BUSINESS_CONFIG,
  ...PRESET_CONFIGS.pharmacy,  // pharmacy, electronics, restaurant, hardware
};
```

---

## ▶️ EJECUTAR EL PROYECTO

### Modo desarrollo

```bash
npm start
```

Abre [http://localhost:4200](http://localhost:4200)

### Modo producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/sistema-master/`

---

## 🚀 DEPLOY

### Vercel (Recomendado - Gratis)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

---

## 👤 USUARIO POR DEFECTO

Después de la instalación, crea tu usuario admin en:
- **Email:** admin@tuempresa.com
- **PIN:** 1234

Puedes cambiar esto en el código o agregar usuarios desde la app.

---

## 🆘 PROBLEMAS COMUNES

### Error: "Supabase not configured"
- Verifica que `environment.ts` tenga las credenciales correctas
- Asegúrate de haber ejecutado el SQL en Supabase

### Error: "Cannot connect to database"
- Verifica que el proyecto Supabase esté activo
- Revisa que la API Key sea correcta

### Error: "Images not loading"
- Si no configuraste Cloudinary, desactiva las imágenes temporalmente
- O configura Cloudinary correctamente

---

## 📞 SOPORTE

Para ayuda adicional, contacta:
- Email: soporte@tuempresa.com
- WhatsApp: +51 XXX XXX XXX

---

## 📄 LICENCIA

Este software está licenciado para uso comercial. Ver LICENSE.md para más detalles.
