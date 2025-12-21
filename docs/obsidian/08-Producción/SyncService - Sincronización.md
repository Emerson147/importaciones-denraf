---
tags: [sync, offline, online, sincronización]
created: 2024-12-20
---

# 🔄 SyncService - El Puente Mágico

> _"Trabaja offline, sincroniza cuando puedas"_

---

## 🎒 ¿Qué hace el SyncService?

Es el **puente** entre IndexedDB (local) y Supabase (nube).

```
Sin internet:
  Guardar venta → IndexedDB ✅
  Supabase → ❌ No hay internet
  Cola de sync → ⏳ "Pendiente"

Con internet:
  Cola de sync → Supabase ✅
  Limpiar cola → ✅
  "¡Todo sincronizado!"
```

---

## 🔄 Flujo de Sincronización

### 1. Usuario hace una venta

```
┌─────────────────────────────────────────┐
│           Usuario hace venta            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   1. Guardar en IndexedDB (siempre)     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          ¿Hay internet?                 │
└────────┬────────────────────┬───────────┘
         │                    │
        Sí                   No
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────────┐
│ 2. Enviar a     │  │ 2. Agregar a cola   │
│    Supabase     │  │    de sync          │
└─────────────────┘  └─────────────────────┘
         │
         ▼
┌─────────────────┐
│ 3. Marcar como  │
│    "synced"     │
└─────────────────┘
```

### 2. Usuario recupera internet

```
┌─────────────────────────────────────────┐
│        Evento: "Hay internet"           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Obtener todo de la cola de sync       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Para cada item pendiente:             │
│   └── Enviar a Supabase                 │
│   └── Si OK, eliminar de cola           │
└─────────────────────────────────────────┘
```

---

## 🛠️ Código del SyncService

```typescript
// src/app/core/services/sync.service.ts
import { Injectable, inject, signal, effect } from '@angular/core';
import { supabase } from './supabase.service';
import { LocalDbService } from './local-db.service';

interface SyncItem {
  id: string;
  type: 'product' | 'sale' | 'user';
  action: 'create' | 'update' | 'delete';
  data: any;
  createdAt: Date;
  retries: number;
}

@Injectable({ providedIn: 'root' })
export class SyncService {
  private localDb = inject(LocalDbService);

  // Estado
  isOnline = signal(navigator.onLine);
  isSyncing = signal(false);
  pendingCount = signal(0);
  lastSyncAt = signal<Date | null>(null);

  constructor() {
    // Escuchar cambios de conexión
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.syncAll(); // Sincronizar cuando vuelve internet
    });

    window.addEventListener('offline', () => {
      this.isOnline.set(false);
    });

    // Actualizar contador de pendientes
    this.updatePendingCount();
  }

  // ========== AGREGAR A COLA ==========

  async queueForSync(type: SyncItem['type'], action: SyncItem['action'], data: any): Promise<void> {
    const item: SyncItem = {
      id: crypto.randomUUID(),
      type,
      action,
      data,
      createdAt: new Date(),
      retries: 0,
    };

    await this.localDb.addToSyncQueue(item);
    this.updatePendingCount();

    // Si hay internet, intentar sincronizar ahora
    if (this.isOnline()) {
      this.syncAll();
    }
  }

  // ========== SINCRONIZAR TODO ==========

  async syncAll(): Promise<void> {
    if (!this.isOnline() || this.isSyncing()) return;

    this.isSyncing.set(true);

    try {
      const queue = await this.localDb.getSyncQueue();

      for (const item of queue) {
        await this.syncItem(item);
      }

      this.lastSyncAt.set(new Date());
    } catch (error) {
      console.error('Error sincronizando:', error);
    } finally {
      this.isSyncing.set(false);
      this.updatePendingCount();
    }
  }

  // ========== SINCRONIZAR UN ITEM ==========

  private async syncItem(item: SyncItem): Promise<void> {
    try {
      const table = this.getTableName(item.type);

      switch (item.action) {
        case 'create':
        case 'update':
          await supabase.from(table).upsert(item.data);
          break;
        case 'delete':
          await supabase.from(table).delete().eq('id', item.data.id);
          break;
      }

      // Éxito: eliminar de la cola
      await this.localDb.removeFromSyncQueue(item.id);
    } catch (error) {
      // Error: incrementar retries
      item.retries++;
      if (item.retries < 3) {
        await this.localDb.updateSyncItem(item);
      } else {
        // Demasiados intentos, marcar como fallido
        console.error('Sync fallido después de 3 intentos:', item);
        await this.localDb.markSyncFailed(item.id);
      }
    }
  }

  // ========== HELPERS ==========

  private getTableName(type: SyncItem['type']): string {
    const tables = {
      product: 'productos',
      sale: 'ventas',
      user: 'usuarios',
    };
    return tables[type];
  }

  private async updatePendingCount() {
    const queue = await this.localDb.getSyncQueue();
    this.pendingCount.set(queue.length);
  }
}
```

---

## 📊 Indicador de Estado en UI

```typescript
// En tu layout o toolbar
@Component({
  template: `
    <!-- Indicador de conexión -->
    <div class="flex items-center gap-2">
      @if (syncService.isOnline()) {
        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
        <span class="text-xs text-green-600">Online</span>
      } @else {
        <span class="w-2 h-2 bg-orange-500 rounded-full"></span>
        <span class="text-xs text-orange-600">Offline</span>
      }

      @if (syncService.pendingCount() > 0) {
        <span class="text-xs text-muted-foreground">
          ({{ syncService.pendingCount() }} pendientes)
        </span>
      }

      @if (syncService.isSyncing()) {
        <span class="animate-spin">🔄</span>
      }
    </div>
  `
})
```

---

## 🔧 Uso en ProductService

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private localDb = inject(LocalDbService);
  private syncService = inject(SyncService);

  productos = signal<Product[]>([]);

  async addProduct(product: Product) {
    // 1. Generar ID único
    product.id = crypto.randomUUID();
    product.createdAt = new Date();

    // 2. Guardar localmente (siempre funciona)
    await this.localDb.saveProduct(product);

    // 3. Actualizar signal
    this.productos.update((list) => [...list, product]);

    // 4. Poner en cola de sync
    await this.syncService.queueForSync('product', 'create', product);
  }

  async updateProduct(product: Product) {
    product.updatedAt = new Date();

    await this.localDb.saveProduct(product);
    this.productos.update((list) => list.map((p) => (p.id === product.id ? product : p)));
    await this.syncService.queueForSync('product', 'update', product);
  }

  async deleteProduct(id: string) {
    await this.localDb.deleteProduct(id);
    this.productos.update((list) => list.filter((p) => p.id !== id));
    await this.syncService.queueForSync('product', 'delete', { id });
  }
}
```

---

## 👶 Analogía: El Mensajero

```
Tú (App) quieres enviar una carta (venta) a otro país (Supabase)

✉️ Sin internet:
   └── Dejas la carta en tu buzón (cola de sync)
   └── Sigues trabajando normalmente

📬 Cuando hay internet:
   └── El mensajero (SyncService) recoge todas las cartas
   └── Las envía una por una
   └── Si alguna falla, lo intenta de nuevo

✅ Tú nunca te detienes esperando al mensajero
```

---

## 💡 Reglas Zen de Sincronización

> [!important] Regla 1: Local primero
> SIEMPRE guarda en IndexedDB antes de intentar Supabase

> [!tip] Regla 2: Reintentos con límite
> Máximo 3 intentos, luego marcar como fallido

> [!note] Regla 3: UUID para evitar conflictos
> Genera IDs en el cliente, no en el servidor

---

## 📎 Relacionados

- [[IndexedDB - Offline Storage]]
- [[Supabase - Qué es]]
- [[Migración de Servicios]]
