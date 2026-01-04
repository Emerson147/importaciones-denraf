# 🎯 Migración: Agregar Campo `saleType` a la Tabla Sales

## 📋 Descripción

Este campo permite registrar explícitamente si una venta fue realizada en:
- **🏪 Tienda Paucara** (días regulares)
- **🏪 Feria Acobamba** (jueves)
- **🏪 Feria Paucara** (domingos)

## 🔧 Script SQL para Supabase

```sql
-- ============================================
-- PASO 1: Agregar columna saleType a la tabla sales
-- ============================================

ALTER TABLE sales 
ADD COLUMN sale_type TEXT 
CHECK (sale_type IN ('feria-acobamba', 'feria-paucara', 'tienda'));

-- ============================================
-- PASO 2: Establecer valor por defecto 'tienda'
-- ============================================

ALTER TABLE sales 
ALTER COLUMN sale_type SET DEFAULT 'tienda';

-- ============================================
-- PASO 3: Migrar datos históricos (calcular por fecha)
-- ============================================

-- Asignar 'feria-acobamba' a ventas de JUEVES
UPDATE sales 
SET sale_type = 'feria-acobamba' 
WHERE EXTRACT(DOW FROM date) = 4 -- DOW: 0=Domingo, 4=Jueves
  AND sale_type IS NULL;

-- Asignar 'feria-paucara' a ventas de DOMINGO
UPDATE sales 
SET sale_type = 'feria-paucara' 
WHERE EXTRACT(DOW FROM date) = 0 -- DOW: 0=Domingo
  AND sale_type IS NULL;

-- Asignar 'tienda' al resto de días
UPDATE sales 
SET sale_type = 'tienda' 
WHERE sale_type IS NULL;

-- ============================================
-- PASO 4: Hacer el campo obligatorio
-- ============================================

ALTER TABLE sales 
ALTER COLUMN sale_type SET NOT NULL;

-- ============================================
-- PASO 5: Crear índice para mejorar consultas
-- ============================================

CREATE INDEX idx_sales_sale_type ON sales(sale_type);
CREATE INDEX idx_sales_date_sale_type ON sales(date, sale_type);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver distribución de ventas por tipo
SELECT 
  sale_type,
  COUNT(*) as total_ventas,
  SUM(total) as ingresos_totales,
  ROUND(AVG(total), 2) as ticket_promedio
FROM sales
GROUP BY sale_type
ORDER BY ingresos_totales DESC;

-- Ver ventas de la última semana por tipo
SELECT 
  sale_type,
  COUNT(*) as ventas,
  SUM(total) as ingresos
FROM sales
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY sale_type;
```

## ⚠️ Notas Importantes

### Limitaciones de la Migración Automática

El script asume que:
- **Jueves** → Feria Acobamba
- **Domingo** → Feria Paucara
- **Otros días** → Tienda

**Posibles errores:**
- Si algún jueves o domingo NO hubo feria (feriado, lluvia), el sistema igual lo marcará como feria
- Si hubo ferias en días diferentes, no se reflejarán correctamente

### Solución para Datos Históricos

Si necesitas precisión total en datos históricos, deberás:

1. **Exportar datos**: `SELECT * FROM sales ORDER BY date;`
2. **Revisar manualmente** cada jueves/domingo
3. **Corregir casos especiales**:
   ```sql
   -- Ejemplo: El jueves 25 de diciembre no hubo feria
   UPDATE sales 
   SET sale_type = 'tienda' 
   WHERE DATE(date) = '2024-12-25';
   ```

## 🚀 Implementación en IndexedDB (Offline)

También necesitas actualizar el esquema de IndexedDB para el modo offline:

```typescript
// En src/app/core/services/offline.service.ts

const DB_VERSION = 2; // Incrementar versión

openDB('denraf-offline-db', DB_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // ... código existente ...
    
    if (oldVersion < 2) {
      // Agregar índice para saleType
      const salesStore = transaction.objectStore('sales');
      salesStore.createIndex('saleType', 'saleType', { unique: false });
    }
  }
});
```

## ✅ Checklist de Implementación

- [x] ✅ Modelo `Sale` actualizado con campo `saleType`
- [x] ✅ POS actualizado para seleccionar tipo de venta
- [x] ✅ Auto-detección de tipo por día de la semana
- [x] ✅ Reportes actualizados para usar campo real
- [ ] ⏳ Ejecutar script SQL en Supabase
- [ ] ⏳ Actualizar esquema de IndexedDB
- [ ] ⏳ Probar sincronización offline → online

## 📊 Beneficios

### Antes (Calculado)
```typescript
const dayOfWeek = date.getDay();
if (dayOfWeek === 4) → Feria Acobamba
```
❌ No considera excepciones (feriados, lluvia)
❌ Datos históricos imprecisos

### Después (Campo Real)
```typescript
if (sale.saleType === 'feria-acobamba') → Feria Acobamba
```
✅ Precisión total
✅ Registro manual en cada venta
✅ Histórico confiable
✅ Manejas excepciones

## 🎯 Próximos Pasos

1. **Ejecutar script** en Supabase Dashboard
2. **Verificar datos** con query de verificación
3. **Probar POS** registrando ventas
4. **Validar reportes** con datos reales
5. **Actualizar IndexedDB** para modo offline
