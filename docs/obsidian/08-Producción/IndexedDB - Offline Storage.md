---
tags: [indexeddb, offline, storage, pwa]
created: 2024-12-20
---

# 📦 IndexedDB - Tu Almacén Offline

> _"localStorage con esteroides"_

---

## 🎒 ¿Qué es IndexedDB?

Es una **base de datos dentro del navegador**, pero MUCHO más poderosa que localStorage.

### Analogía: Tipos de Almacenamiento

```
localStorage = Una caja pequeña (5MB)
  └── Solo guarda texto simple
  └── Un solo "cajón"

IndexedDB = Un almacén gigante (50GB+)
  └── Guarda cualquier cosa (objetos, imágenes)
  └── Múltiples "estantes" organizados
  └── Puedes buscar rápido
```

---

## 🆚 localStorage vs IndexedDB

| Característica | localStorage   | IndexedDB        |
| -------------- | -------------- | ---------------- |
| Tamaño máximo  | ~5MB           | ~50GB+           |
| Tipo de datos  | Solo strings   | Cualquier tipo   |
| Consultas      | Manual (lento) | Índices (rápido) |
| Sincrónico     | ✅ Bloquea UI  | ❌ Async (mejor) |
| Productos      | ~1,000 máx     | 100,000+         |

---

## 📦 Instalación

Usaremos `idb` - una librería que hace IndexedDB más fácil.

```bash
npm install idb
```

---

## 🛠️ Crear la Base de Datos Local

```typescript
// src/app/core/services/local-db.service.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// 1. Definir el esquema (tipos)
interface DenrafDB extends DBSchema {
  productos: {
    key: string;
    value: Product;
    indexes: { 'por-categoria': string };
  };
  ventas: {
    key: string;
    value: Sale;
    indexes: { 'por-fecha': Date };
  };
  sync_queue: {
    key: string;
    value: SyncItem;
  };
}

// 2. Crear/abrir la base de datos
async function initDB(): Promise<IDBPDatabase<DenrafDB>> {
  return openDB<DenrafDB>('denraf-db', 1, {
    upgrade(db) {
      // Crear "estantes" (stores)

      // Productos
      const productStore = db.createObjectStore('productos', {
        keyPath: 'id',
      });
      productStore.createIndex('por-categoria', 'category');

      // Ventas
      const saleStore = db.createObjectStore('ventas', {
        keyPath: 'id',
      });
      saleStore.createIndex('por-fecha', 'createdAt');

      // Cola de sincronización
      db.createObjectStore('sync_queue', {
        keyPath: 'id',
      });
    },
  });
}
```

---

## 📝 Operaciones Básicas

### Guardar un Producto

```typescript
async function saveProduct(product: Product) {
  const db = await initDB();
  await db.put('productos', product);
}
```

### Obtener Todos los Productos

```typescript
async function getAllProducts(): Promise<Product[]> {
  const db = await initDB();
  return db.getAll('productos');
}
```

### Obtener Producto por ID

```typescript
async function getProduct(id: string): Promise<Product | undefined> {
  const db = await initDB();
  return db.get('productos', id);
}
```

### Eliminar Producto

```typescript
async function deleteProduct(id: string) {
  const db = await initDB();
  await db.delete('productos', id);
}
```

### Buscar por Categoría

```typescript
async function getByCategory(category: string): Promise<Product[]> {
  const db = await initDB();
  return db.getAllFromIndex('productos', 'por-categoria', category);
}
```

---

## 🔄 El Servicio Completo

```typescript
// src/app/core/services/local-db.service.ts
import { Injectable, signal } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import type { DenrafDB } from './db-schema';

@Injectable({ providedIn: 'root' })
export class LocalDbService {
  private db = signal<IDBPDatabase<DenrafDB> | null>(null);

  async init() {
    const database = await openDB<DenrafDB>('denraf-db', 1, {
      upgrade(db) {
        // Crear stores...
      },
    });
    this.db.set(database);
  }

  // ========== PRODUCTOS ==========

  async getProducts(): Promise<Product[]> {
    const db = this.db();
    if (!db) return [];
    return db.getAll('productos');
  }

  async saveProduct(product: Product): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.put('productos', product);
  }

  async deleteProduct(id: string): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.delete('productos', id);
  }

  // ========== VENTAS ==========

  async getSales(): Promise<Sale[]> {
    const db = this.db();
    if (!db) return [];
    return db.getAll('ventas');
  }

  async saveSale(sale: Sale): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.put('ventas', sale);
  }

  // ========== COLA DE SYNC ==========

  async addToSyncQueue(item: SyncItem): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.put('sync_queue', item);
  }

  async getSyncQueue(): Promise<SyncItem[]> {
    const db = this.db();
    if (!db) return [];
    return db.getAll('sync_queue');
  }

  async clearSyncQueue(): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.clear('sync_queue');
  }
}
```

---

## 🎯 ¿Cuándo se usa cada uno?

```
IndexedDB (local):
├── Trabajas sin internet
├── Guardas temporalmente
└── Lectura rápida

Supabase (nube):
├── Respaldo permanente
├── Sincronización entre dispositivos
└── Cuando hay internet
```

---

## 👶 Analogía: Tu Libreta vs El Banco

```
IndexedDB = Tu libreta de apuntes
  └── Siempre la tienes contigo
  └── Escribes rápido
  └── Si la pierdes, se perdió

Supabase = El banco donde guardas dinero
  └── Siempre seguro
  └── Accesible desde cualquier lugar
  └── Pero necesitas ir (internet)

Solución: Anotas en tu libreta Y lo pasas al banco
```

---

## 💡 Reglas Zen de IndexedDB

> [!important] Regla 1: Async siempre
> Todas las operaciones son con `await`

> [!tip] Regla 2: Usa IDs UUID
> Evita conflictos cuando sincronices

> [!note] Regla 3: Índices para búsquedas
> `createIndex` hace las búsquedas rápidas

---

## 📎 Relacionados

- [[SyncService - Sincronización]]
- [[Supabase - Qué es]]
- [[PWA Configuration]]
