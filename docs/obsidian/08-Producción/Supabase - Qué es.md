---
tags: [supabase, base-datos, postgresql, baas]
created: 2024-12-20
---

# ☁️ Supabase - Tu Base de Datos en la Nube

> _"PostgreSQL sin complicaciones"_

---

## 🎒 ¿Qué es Supabase?

Supabase es como tener un **servidor propio** pero sin manejarlo tú.

### Analogía: El Banco

```
❌ Guardar dinero en tu casa (localStorage):
   └── Te roban, se quema, lo pierdes

✅ Guardar dinero en un banco (Supabase):
   └── Seguro, accesible desde cualquier lugar,
       el banco se encarga de todo
```

---

## 🎁 ¿Qué te da Supabase?

### 1. Base de Datos PostgreSQL

```sql
-- Tu tabla de productos
CREATE TABLE productos (
  id UUID PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio DECIMAL(10,2),
  stock INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Autenticación

```typescript
// Login con email
await supabase.auth.signInWithPassword({
  email: 'mama@denraf.com',
  password: 'contraseña123',
});
```

### 3. API Automática

```typescript
// Obtener productos
const { data } = await supabase.from('productos').select('*');

// Insertar venta
await supabase.from('ventas').insert({ producto_id: '123', cantidad: 2 });
```

### 4. Tiempo Real (opcional)

```typescript
// Escuchar cambios en ventas
supabase
  .channel('ventas')
  .on('INSERT', (payload) => {
    console.log('Nueva venta:', payload);
  })
  .subscribe();
```

---

## 🆚 Supabase vs Tu Código Actual

### Obtener Productos

**❌ Ahora (localStorage):**

```typescript
getProducts(): Product[] {
  const data = localStorage.getItem('denraf_products');
  return data ? JSON.parse(data) : [];
}
```

**✅ Con Supabase:**

```typescript
async getProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('productos')
    .select('*')
    .order('nombre');
  return data || [];
}
```

### Guardar Venta

**❌ Ahora:**

```typescript
saveSale(sale: Sale) {
  const sales = this.getSales();
  sales.push(sale);
  localStorage.setItem('denraf_sales', JSON.stringify(sales));
}
```

**✅ Con Supabase:**

```typescript
async saveSale(sale: Sale) {
  await supabase
    .from('ventas')
    .insert(sale);
}
```

---

## 🛠️ Configurar Supabase

### Paso 1: Crear Cuenta

```
1. Ve a supabase.com
2. "Start your project" (gratis)
3. Usa tu cuenta de GitHub o email
```

### Paso 2: Crear Proyecto

```
1. "New Project"
2. Nombre: "denraf"
3. Password: (guárdala bien, es de la DB)
4. Region: South America (São Paulo)
5. "Create new project"
```

### Paso 3: Obtener Credenciales

```
Settings → API:
├── Project URL: https://xxx.supabase.co
└── anon key: eyJhbGciOiJIUzI1NiIsInR...
```

### Paso 4: Instalar en Angular

```bash
npm install @supabase/supabase-js
```

### Paso 5: Crear Cliente

```typescript
// src/app/core/services/supabase.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tu-proyecto.supabase.co';
const supabaseKey = 'tu-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## 🔒 Seguridad con Row Level Security (RLS)

### ¿Qué es RLS?

Reglas que dicen **quién puede ver qué**.

```sql
-- Solo los usuarios logueados pueden ver productos
CREATE POLICY "Usuarios ven productos"
  ON productos
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin puede editar
CREATE POLICY "Admin edita productos"
  ON productos
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

---

## 📊 Dashboard de Supabase

```
supabase.com/dashboard
├── 📊 Table Editor    → Ver/editar datos visualmente
├── 🔑 Authentication  → Gestionar usuarios
├── 📝 SQL Editor      → Ejecutar queries
├── 📈 Reports         → Estadísticas
└── ⚙️ Settings        → Configuración
```

---

## 💡 Reglas Zen de Supabase

> [!important] Regla 1: Guarda la anon key en environment
> Nunca la pongas directamente en el código

> [!tip] Regla 2: RLS siempre activado
> Protege tus datos con políticas

> [!note] Regla 3: Usa el SQL Editor para aprender
> Puedes ver/editar datos visualmente

---

## 📎 Relacionados

- [[Esquema de Base de Datos]]
- [[SyncService - Sincronización]]
- [[Migración de Servicios]]
