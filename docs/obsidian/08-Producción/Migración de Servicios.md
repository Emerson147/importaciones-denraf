---
tags: [migración, servicios, refactoring]
created: 2024-12-20
---

# 🔧 Migración de Servicios

> _"Transformar tu app para producción"_

---

## 🎒 ¿Qué vamos a migrar?

```
ANTES:
ProductService → localStorage

DESPUÉS:
ProductService → LocalDbService → SyncService → Supabase
```

---

## 📦 Paso 1: Supabase Client

```typescript
// src/app/core/services/supabase.service.ts
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
```

---

## 🔄 Paso 2: ProductService Migrado

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private localDb = inject(LocalDbService);
  private syncService = inject(SyncService);

  private productsSignal = signal<Product[]>([]);
  readonly products = this.productsSignal.asReadonly();

  constructor() {
    this.init();
  }

  private async init() {
    // 1. Cargar de IndexedDB (offline)
    const local = await this.localDb.getProducts();
    this.productsSignal.set(local);

    // 2. Si hay internet, sincronizar
    if (navigator.onLine) {
      await this.fetchFromSupabase();
    }
  }

  async addProduct(product: Product) {
    const newProduct = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    // Local primero
    await this.localDb.saveProduct(newProduct);
    this.productsSignal.update((list) => [...list, newProduct]);

    // Luego sync
    await this.syncService.queueForSync('product', 'create', newProduct);
  }
}
```

---

## 📋 Checklist

- [ ] Crear `LocalDbService` con IndexedDB
- [ ] Crear `SyncService`
- [ ] Migrar ProductService
- [ ] Migrar SalesService
- [ ] Migrar AuthService
- [ ] Probar offline

---

## 📎 Relacionados

- [[SyncService - Sincronización]]
- [[IndexedDB - Offline Storage]]
- [[Deploy en Vercel]]
