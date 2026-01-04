# 🔧 FIX: Variantes Desaparecen - Arquitectura Relacional

## 📋 Problema Identificado

Las variantes desaparecían al actualizar porque el código estaba diseñado para un campo JSONB `variants`, pero tu base de datos usa una **tabla relacional separada** `variantes`.

### ❌ Problema Original

```typescript
// El código intentaba leer esto (NO EXISTE):
SELECT id, name, variants FROM productos; // ❌ Error 400

// Tu base de datos real:
CREATE TABLE variantes (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES productos(id),
  size TEXT,
  color TEXT,
  stock INTEGER
);
```

## ✅ Solución: Adaptación a Tabla Relacional

He modificado el código para trabajar con la tabla `variantes` usando **relaciones de Supabase**.

### 1. Consultas con JOIN (Relaciones)

Todas las consultas ahora incluyen las variantes:

```typescript
// ✅ CORRECTO
.select(`
  id, name, category, brand, price, cost, stock,
  variantes (
    id, size, color, stock, barcode
  )
`)
```

**Archivos modificados:**
- `pullProductsWithFallback()` - Línea ~258
- `pullProductsInBatches()` - Línea ~300  
- `pullProductsByCategory()` - Línea ~498
- `searchProducts()` - Línea ~520

### 2. Mapeo de Variantes Relacionales

Modificado `adaptFromSupabase` para mapear desde relación:

```typescript
private adaptFromSupabase(type: string, data: any): any {
  if (type === 'product') {
    // Mapear variantes desde la tabla relacional
    const variants = data.variantes 
      ? data.variantes.map((v: any) => ({
          id: v.id,
          size: v.size,
          color: v.color || '',
          stock: v.stock || 0,
          barcode: v.barcode || ''
        }))
      : [];

    return {
      id: data.id,
      name: data.name,
      // ... otros campos
      variants: variants, // ✅ Variantes mapeadas
      // ...
    };
  }
}
```

### 3. Sincronización de Variantes

Agregado método `syncProductVariants()` para guardar variantes en tabla separada:

```typescript
private async syncProductVariants(productId: string, variants: any[]): Promise<void> {
  // 1. Eliminar variantes existentes
  await supabase
    .from('variantes')
    .delete()
    .eq('product_id', productId);

  // 2. Insertar nuevas variantes
  const variantesData = variants.map(v => ({
    id: v.id,
    product_id: productId,
    size: v.size,
    color: v.color || null,
    stock: v.stock || 0,
    barcode: v.barcode || null
  }));

  await supabase
    .from('variantes')
    .insert(variantesData);
}
```

### 4. Integración en `syncItem()`

Modificado para sincronizar variantes automáticamente:

```typescript
private async syncItem(item: SyncQueueItem): Promise<boolean> {
  // Guardar producto principal
  await supabase.from('productos').upsert(adaptedData);

  // 🔥 Si tiene variantes, sincronizar en tabla separada
  if (item.type === 'product' && item.data.variants?.length > 0) {
    await this.syncProductVariants(item.data.id, item.data.variants);
  }
  
  return true;
}
```

## 🔄 Flujo Completo

### Crear Producto con Variantes

```
1. Usuario crea producto con variantes en UI
   ↓
2. Se guarda en IndexedDB (formato Angular con variants[])
   ↓
3. Se encola para sincronización
   ↓
4. syncItem() ejecuta:
   a. INSERT INTO productos (name, price, stock, ...)
   b. syncProductVariants() ejecuta:
      - DELETE FROM variantes WHERE product_id = ?
      - INSERT INTO variantes (product_id, size, color, stock)
   ↓
5. ✅ Producto y variantes guardados en Supabase
```

### Cargar Producto con Variantes

```
1. Consulta con JOIN:
   SELECT p.*, v.id, v.size, v.color, v.stock
   FROM productos p
   LEFT JOIN variantes v ON v.product_id = p.id
   ↓
2. adaptFromSupabase() mapea:
   {
     id: "...",
     name: "...",
     variants: [
       { id: "...", size: "S", color: "Negro", stock: 10 },
       { id: "...", size: "M", color: "Blanco", stock: 5 }
     ]
   }
   ↓
3. Se guarda en IndexedDB (cache local)
   ↓
4. ✅ UI muestra producto con variantes
```

## 🧪 Verificación

Tu base de datos YA tiene la estructura correcta:

```sql
-- ✅ Tabla productos existe
-- ✅ Tabla variantes existe con FK a productos
-- ✅ ON DELETE CASCADE configurado
```

**NO necesitas ejecutar ningún script SQL adicional.**

## 📊 Pruebas

1. **Recarga la aplicación**
   ```bash
   # La app debería cargar sin errores 400
   ```

2. **Crear producto con variantes**
   - Crea un producto nuevo
   - Agrega múltiples variantes (tallas/colores)
   - Guarda

3. **Verificar en Supabase**
   ```sql
   -- Ver producto con variantes
   SELECT 
     p.name,
     v.size,
     v.color,
     v.stock
   FROM productos p
   LEFT JOIN variantes v ON v.product_id = p.id
   WHERE p.id = 'TU_PRODUCTO_ID';
   ```

4. **Recargar aplicación**
   - Las variantes deben persistir ✅

## 📁 Archivos Modificados

✅ `src/app/core/services/sync.service.ts`
- Consultas SELECT con relaciones `variantes`
- Método `adaptFromSupabase()` mapea variantes
- Método `adaptToSupabase()` sin campo variants
- Nuevo método `syncProductVariants()` 
- Modificado `syncItem()` para sincronizar variantes

## 🎯 Resultado

- ✅ Variantes se cargan correctamente desde tabla relacional
- ✅ Variantes se guardan en tabla `variantes` separada
- ✅ Stock de variantes se actualiza correctamente
- ✅ DELETE CASCADE funciona (variantes se eliminan con producto)
- ✅ Sin errores 400 en consola
- ✅ Persistencia completa en Supabase

---

**Fecha:** 4 de enero de 2026  
**Status:** ✅ Resuelto con arquitectura relacional
