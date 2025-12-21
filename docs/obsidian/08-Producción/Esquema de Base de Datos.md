---
tags: [supabase, postgresql, esquema, tablas]
created: 2024-12-20
---

# 📊 Esquema de Base de Datos

> _"El plano de tu almacén de datos"_

---

## 🎒 ¿Qué es un Esquema?

Es el **diseño de tus tablas** y cómo se relacionan.

### Analogía: Tu Tienda Física

```
📦 Estante de Productos
   └── Cada producto tiene: nombre, precio, stock

🧾 Cajón de Tickets
   └── Cada venta tiene: productos, total, fecha

👥 Carpeta de Empleados
   └── Cada usuario tiene: nombre, rol, PIN
```

---

## 📋 Tus Tablas

### 1. Tabla: `usuarios`

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT DEFAULT 'vendedor' CHECK (rol IN ('admin', 'vendedor')),
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

```
┌─────────────────────────────────────────────────┐
│                    usuarios                      │
├──────────────┬──────────────┬───────────────────┤
│ id           │ nombre       │ rol               │
├──────────────┼──────────────┼───────────────────┤
│ abc-123      │ Yo           │ admin             │
│ def-456      │ Mamá         │ vendedor          │
│ ghi-789      │ Hermano      │ vendedor          │
└──────────────┴──────────────┴───────────────────┘
```

---

### 2. Tabla: `productos`

```sql
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria TEXT,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2),
  imagen TEXT,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3. Tabla: `variantes` (tallas/colores)

```sql
CREATE TABLE variantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  talla TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

```
┌────────────────────────────────────────────────────────────┐
│                        variantes                            │
├────────────┬─────────────┬───────┬─────────┬───────────────┤
│ id         │ producto_id │ talla │ color   │ stock         │
├────────────┼─────────────┼───────┼─────────┼───────────────┤
│ var-001    │ prod-123    │ S     │ Negro   │ 10            │
│ var-002    │ prod-123    │ M     │ Negro   │ 15            │
│ var-003    │ prod-123    │ L     │ Blanco  │ 8             │
└────────────┴─────────────┴───────┴─────────┴───────────────┘
```

---

### 4. Tabla: `ventas`

```sql
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  subtotal DECIMAL(10,2) NOT NULL,
  impuesto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'yape', 'tarjeta')),
  estado TEXT DEFAULT 'completada',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 5. Tabla: `venta_items` (detalle de la venta)

```sql
CREATE TABLE venta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  variante_id UUID REFERENCES variantes(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);
```

```
Una venta con 2 productos:

ventas:
┌──────────┬───────────┬─────────┐
│ id       │ total     │ metodo  │
├──────────┼───────────┼─────────┤
│ sale-001 │ 540.00    │ yape    │
└──────────┴───────────┴─────────┘

venta_items:
┌──────────┬───────────┬──────────┬──────────┐
│ venta_id │ producto  │ cantidad │ subtotal │
├──────────┼───────────┼──────────┼──────────┤
│ sale-001 │ Casaca    │ 2        │ 300.00   │
│ sale-001 │ Jean      │ 2        │ 240.00   │
└──────────┴───────────┴──────────┴──────────┘
```

---

### 6. Tabla: `clientes` (opcional)

```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  notas TEXT,
  total_compras DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔗 Relaciones

```
usuarios
    │
    │ 1:N (un usuario, muchas ventas)
    ▼
  ventas ────────── 1:N ──────────▶ venta_items
    │                                   │
    │                                   │ N:1
    │                                   ▼
    │                              productos
    │                                   │
    │                                   │ 1:N
    │                                   ▼
    │                              variantes
    │
    └── N:1 ──▶ clientes (opcional)
```

---

## 📝 SQL Completo para Crear Todo

```sql
-- 1. Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT DEFAULT 'vendedor',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria TEXT,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2),
  imagen TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Variantes
CREATE TABLE variantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  talla TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Ventas
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  subtotal DECIMAL(10,2) NOT NULL,
  impuesto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT,
  estado TEXT DEFAULT 'completada',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Items de Venta
CREATE TABLE venta_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id),
  variante_id UUID REFERENCES variantes(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- 6. Clientes (opcional)
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  total_compras DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (usuarios autenticados pueden todo)
CREATE POLICY "Acceso autenticado" ON usuarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso autenticado" ON productos FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso autenticado" ON variantes FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso autenticado" ON ventas FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso autenticado" ON venta_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Acceso autenticado" ON clientes FOR ALL TO authenticated USING (true);
```

---

## 💡 Reglas Zen del Esquema

> [!important] Regla 1: UUID en lugar de números
> Evita conflictos cuando sincronizas offline

> [!tip] Regla 2: created_at en todas las tablas
> Siempre útil para ordenar y debuggear

> [!note] Regla 3: ON DELETE CASCADE
> Cuando borras producto, borra sus variantes

---

## 📎 Relacionados

- [[Supabase - Qué es]]
- [[Migración de Servicios]]
- [[Core]]
