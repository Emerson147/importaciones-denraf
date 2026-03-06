# 🚀 Guía para Niños de 5 Años: Modo Offline en DenRaf

## 📚 ¿Qué es el Modo Offline?

Imagina que tienes una **caja mágica** 📦 donde guardas tus juguetes favoritos. Cuando no hay internet (como cuando te quedas sin WiFi), la aplicación usa esa caja mágica para seguir funcionando.

**En palabras simples:**
- ✅ **CON internet**: La app guarda datos en el servidor (la nube ☁️)
- ❌ **SIN internet**: La app guarda datos en tu computadora (la caja mágica 📦)
- 🔄 **Cuando vuelve internet**: La app envía todo lo guardado a la nube

---

## 🎯 ¿Cómo Funciona? (Explicación Simple)

### Paso 1: La Caja Mágica (IndexedDB)

```
┌─────────────────────────────────────┐
│  🗄️  IndexedDB = Base de Datos     │
│      en tu Navegador                │
├─────────────────────────────────────┤
│  📦 Cajón 1: VENTAS                 │
│     - Venta 1 ✅ (sincronizada)     │
│     - Venta 2 ⏳ (pendiente)        │
│                                     │
│  📦 Cajón 2: INVENTARIO             │
│     - Producto A ✅                 │
│     - Producto B ⏳                 │
│                                     │
│  📦 Cajón 3: COLA DE SINCRONIZACIÓN │
│     - Acción 1: Crear venta ⏳      │
│     - Acción 2: Actualizar stock ⏳ │
└─────────────────────────────────────┘
```

**¿Qué son estos cajones?**
- **Cajón 1 (sales)**: Guarda todas las ventas
- **Cajón 2 (inventory)**: Guarda cambios de inventario
- **Cajón 3 (syncQueue)**: Una lista de "tareas pendientes" para cuando vuelva internet

---

### Paso 2: El Guardián (OfflineService)

Este es como un **robot vigilante** 🤖 que:

1. **Detecta cuando se va el internet** 📡❌
   ```typescript
   window.addEventListener('offline', () => {
     console.log("¡Oh no! Se fue el internet 😱");
     this.isOnline.set(false); // Cambiar banderita a "sin internet"
   });
   ```

2. **Detecta cuando vuelve el internet** 📡✅
   ```typescript
   window.addEventListener('online', () => {
     console.log("¡Yay! Volvió el internet 🎉");
     this.isOnline.set(true);
     this.syncPendingOperations(); // ¡Enviar todo a la nube!
   });
   ```

3. **Guarda cosas cuando NO hay internet** 💾
   ```typescript
   // Cuando haces una venta sin internet:
   async saveSaleOffline(venta) {
     // 1. Crear un ID único (como ponerle nombre a tu juguete)
     const id = crypto.randomUUID(); // "abc-123-def-456"
     
     // 2. Crear un "paquete" con toda la info
     const paquete = {
       id: id,
       data: venta,              // Los datos de la venta
       timestamp: Date.now(),    // La hora exacta (para saber cuándo)
       synced: false            // ⏳ Aún no se envió al servidor
     };
     
     // 3. Guardar en el Cajón 1 (sales)
     await guardarEnCajon('sales', paquete);
     
     // 4. Agregar a la lista de tareas pendientes
     await addToSyncQueue('create', 'sales', venta);
   }
   ```

4. **Sincroniza cuando vuelve internet** 🔄
   ```typescript
   async syncPendingOperations() {
     // 1. Revisar la lista de tareas pendientes
     const tareasPendientes = await getAllFromStore('syncQueue');
     
     // 2. Para cada tarea:
     for (const tarea of tareasPendientes) {
       try {
         // 3. Enviar al servidor (la nube ☁️)
         await enviarAlServidor(tarea);
         
         // 4. Marcar como "ya sincronizado" ✅
         await marcarComoSincronizado(tarea);
         
         // 5. Borrar de la lista de pendientes
         await borrarDeLista(tarea);
         
       } catch (error) {
         // 6. Si falla, intentar de nuevo (máximo 3 veces)
         if (tarea.retries < 3) {
           tarea.retries++; // Sumar 1 al contador de intentos
         }
       }
     }
   }
   ```

---

## 🧪 Cómo Probar que Funciona (Paso a Paso)

### Prueba 1: Ver el Indicador de Conexión

**Lo que verás:**
```
┌─────────────────────────┐
│  🟢 (nada visible)       │  ← Con internet
└─────────────────────────┘

┌─────────────────────────┐
│  🟡 Sin conexión (2)     │  ← Sin internet (2 operaciones pendientes)
└─────────────────────────┘

┌─────────────────────────┐
│  🟢 Conexión restaurada  │  ← Volvió internet (aparece 3 segundos)
└─────────────────────────┘
```

**Cómo hacerlo:**
1. Abre tu aplicación en Chrome
2. Presiona `F12` (se abre el panel de desarrollador)
3. Ve a la pestaña **Network** (Red)
4. Marca el checkbox **Offline** ✅
5. Mira la esquina inferior izquierda → Verás un badge **"Sin conexión"** 🟡

---

### Prueba 2: Guardar una Venta Sin Internet

**Pasos:**
1. **Desconecta internet** (F12 → Network → Offline)
2. **Abre la consola** (F12 → Console)
3. **Pega este código mágico:**

```javascript
// 1. Obtener el servicio offline (el robot 🤖)
const app = document.querySelector('app-root');
const injector = app.__ngContext__?.[8];
const offlineService = injector?.get('OfflineService');

// 2. Crear una venta de prueba
const ventaDePrueba = {
  cliente: 'Juan Pérez',
  total: 250.50,
  items: [
    { producto: 'Laptop', cantidad: 1, precio: 250.50 }
  ]
};

// 3. Guardarla (como guardar un juguete en la caja 📦)
offlineService.saveSaleOffline(ventaDePrueba);

// 4. Ver cuántas operaciones están pendientes
console.log('Operaciones pendientes:', offlineService.pendingSync());
// Debería mostrar: 1
```

**¿Qué pasó?**
- ✅ La venta se guardó en IndexedDB (la caja mágica)
- ✅ Se agregó a la cola de sincronización
- ✅ El contador de pendientes aumentó a `1`

---

### Prueba 3: Inspeccionar la Caja Mágica (IndexedDB)

**Pasos:**
1. `F12` → Pestaña **Application**
2. En el menú izquierdo, expande **IndexedDB**
3. Expande **denraf-offline**
4. Verás 3 cajones:
   - **sales** ← Tus ventas
   - **inventory** ← Cambios de inventario
   - **syncQueue** ← Lista de tareas pendientes

**Lo que verás:**

```
IndexedDB
└── denraf-offline
    ├── sales
    │   └── [Registro]
    │       ├── id: "abc-123-def"
    │       ├── data: { cliente: "Juan Pérez", total: 250.50 }
    │       ├── timestamp: 1702156800000
    │       └── synced: false ⏳
    │
    ├── inventory
    │   └── (vacío)
    │
    └── syncQueue
        └── [Tarea]
            ├── id: "xyz-789-ghi"
            ├── operation: "create"
            ├── entity: "sales"
            ├── data: { cliente: "Juan Pérez"... }
            ├── timestamp: 1702156800000
            └── retries: 0
```

**¿Qué significa?**
- `synced: false` = Aún no se envió al servidor ⏳
- `retries: 0` = No se ha intentado enviar todavía

---

### Prueba 4: Sincronización Automática

**Pasos:**
1. Con internet **desconectado**, guarda 2-3 ventas (usa el código de arriba)
2. Verifica que el badge diga **"Sin conexión (3)"**
3. **Reconecta internet** (F12 → Network → **desmarca** Offline)
4. **Observa:**
   - ✅ Badge cambia a **"Sincronizando..."** (con spinner 🔄)
   - ✅ Luego muestra **"Conexión restaurada"** (3 segundos)
   - ✅ Finalmente desaparece (todo sincronizado ✅)

**En la consola verás:**
```
Sincronizando create en sales { cliente: "Juan Pérez"... }
Sincronizando create en sales { cliente: "María López"... }
Sincronizando create en sales { cliente: "Carlos Ruiz"... }
```

5. **Vuelve a IndexedDB** (F12 → Application → IndexedDB)
6. Los registros ahora tienen `synced: true` ✅
7. La **syncQueue** está **vacía** (todas las tareas se completaron)

---

## 🏗️ Arquitectura Técnica (Para Curiosos)

### Componentes Creados

#### 1. **OfflineService** (`offline.service.ts`)
```
📄 Archivo: src/app/core/services/offline.service.ts
📏 Líneas: 300
🎯 Función: Cerebro del sistema offline
```

**Métodos principales:**

| Método | ¿Qué hace? | Ejemplo |
|--------|------------|---------|
| `initDB()` | Crea la caja mágica (IndexedDB) | Se ejecuta automáticamente al iniciar |
| `saveSaleOffline(sale)` | Guarda una venta sin internet | `saveSaleOffline({total: 100})` |
| `syncPendingOperations()` | Sincroniza cuando vuelve internet | Se ejecuta automáticamente |
| `getOfflineSales()` | Lista ventas NO sincronizadas | `await getOfflineSales()` |
| `cleanOldData()` | Borra datos antiguos (>7 días) | Se ejecuta periódicamente |

**Signals (Señales reactivas):**
```typescript
isOnline = signal(navigator.onLine);  // true/false
pendingSync = signal(0);              // Número de operaciones pendientes
```

---

#### 2. **ConnectionStatusComponent** 
```
📄 Archivo: src/app/shared/ui/connection-status/
🎯 Función: Mostrar estado de conexión (el badge amarillo)
```

**Lo que muestra:**

| Estado | Visual | Cuándo |
|--------|--------|--------|
| 🟢 Online | Nada (oculto) | Hay internet |
| 🟡 Offline | Badge amarillo pulsante | Sin internet |
| 🔄 Sincronizando | Badge verde con spinner | Enviando datos |
| ✅ Restaurado | Toast verde 3s | Volvió internet |

**Código simplificado:**
```typescript
@Component({
  template: `
    <!-- Badge de "Sin conexión" -->
    @if (!offlineService.isOnline()) {
      <div class="badge-offline">
        🟡 Sin conexión ({{ offlineService.pendingSync() }})
      </div>
    }
    
    <!-- Badge de "Sincronizando" -->
    @if (offlineService.isOnline() && offlineService.pendingSync() > 0) {
      <div class="badge-syncing">
        🔄 Sincronizando...
      </div>
    }
    
    <!-- Toast de "Conexión restaurada" -->
    @if (showReconnectedToast()) {
      <div class="toast-success">
        ✅ Conexión restaurada
      </div>
    }
  `
})
```

---

#### 3. **PwaInstallPromptComponent**
```
📄 Archivo: src/app/shared/ui/pwa-install-prompt/
🎯 Función: Banner para instalar la app como PWA
```

**No está relacionado con offline**, pero complementa la experiencia PWA.

---

### Flujo de Datos Completo

```
┌──────────────────────────────────────────────────────────────┐
│                    USUARIO HACE UNA VENTA                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
                    ¿Hay Internet? 📡
                            │
            ┌───────────────┴───────────────┐
            │                               │
          ❌ NO                           ✅ SÍ
            │                               │
            ▼                               ▼
┌─────────────────────┐         ┌──────────────────────┐
│ 1. Guardar en       │         │ 1. Enviar a servidor │
│    IndexedDB (sales)│         │    (HTTP POST)       │
│                     │         │                      │
│ 2. Agregar a        │         │ 2. Guardar en BD     │
│    syncQueue        │         │    (PostgreSQL/etc)  │
│                     │         │                      │
│ 3. Aumentar         │         │ 3. Respuesta OK ✅   │
│    pendingSync++    │         │                      │
└─────────────────────┘         └──────────────────────┘
            │                               
            │ (esperando...)                
            ▼                               
    Internet vuelve 📡✅                    
            │                               
            ▼                               
┌─────────────────────────────────────┐    
│ syncPendingOperations()             │    
│                                     │    
│ 1. Leer syncQueue                   │    
│ 2. Para cada tarea:                 │    
│    - POST /api/sales                │    
│    - Marcar synced=true             │    
│    - Borrar de syncQueue            │    
│ 3. Actualizar pendingSync=0         │    
└─────────────────────────────────────┘    
            │
            ▼
        ✅ TODO SINCRONIZADO
```

---

## 🔍 Cómo Saber que Todo Funciona

### ✅ Checklist de Verificación

| # | Prueba | ¿Qué verificar? | ✅ |
|---|--------|-----------------|---|
| 1 | Abrir app con internet | No debe haber badge visible | ☐ |
| 2 | Desconectar (F12 → Offline) | Aparece badge "Sin conexión" | ☐ |
| 3 | Guardar venta offline (consola) | `pendingSync()` aumenta a 1 | ☐ |
| 4 | Ver IndexedDB | Registro en `sales` con `synced: false` | ☐ |
| 5 | Reconectar internet | Badge "Sincronizando..." aparece | ☐ |
| 6 | Esperar 2 segundos | Toast "Conexión restaurada" | ☐ |
| 7 | Revisar IndexedDB | `synced: true` y syncQueue vacía | ☐ |
| 8 | Ver consola | Logs de "Sincronizando create..." | ☐ |

---

## 🎨 Estilos del Badge (Zen Minimalista)

**Badge Offline (Amarillo):**
```css
.badge-offline {
  /* Posición fija esquina inferior izquierda */
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  
  /* Colores (modo claro) */
  background: rgba(251, 191, 36, 0.1);  /* Amber transparente */
  border: 1px solid rgb(251, 191, 36);   /* Borde amber */
  color: rgb(217, 119, 6);               /* Texto amber oscuro */
  
  /* Glassmorphism */
  backdrop-filter: blur(12px);
  
  /* Animación de pulso */
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**Modo Oscuro:**
```css
.dark .badge-offline {
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgb(251, 191, 36);
  color: rgb(252, 211, 77);
}
```

---

## 🚀 Implementación Técnica Detallada

### IndexedDB: La Caja Mágica

**¿Por qué IndexedDB y no localStorage?**

| Feature | localStorage | IndexedDB |
|---------|-------------|-----------|
| Tamaño | ~5-10MB | ~50MB+ (ilimitado) |
| Tipo de datos | Solo strings | Objetos complejos |
| Índices | ❌ No | ✅ Sí |
| Transacciones | ❌ No | ✅ Sí |
| Async | ❌ No (bloquea) | ✅ Sí (Promise) |

**Creación de la base de datos:**
```typescript
private async initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 1. Abrir/crear base de datos
    const request = indexedDB.open('denraf-offline', 1);
    //                               ↑nombre      ↑versión

    // 2. Si hay error
    request.onerror = () => reject(request.error);

    // 3. Si se abre exitosamente
    request.onsuccess = () => {
      this.db = request.result; // Guardar referencia
      resolve();
    };

    // 4. Si es primera vez O cambió la versión
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Crear "cajón" de ventas
      if (!db.objectStoreNames.contains('sales')) {
        const salesStore = db.createObjectStore('sales', { 
          keyPath: 'id'  // La llave única es el campo 'id'
        });
        
        // Crear índices (para búsquedas rápidas)
        salesStore.createIndex('synced', 'synced', { unique: false });
        salesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Crear cajón de inventario (igual que sales)
      // ...

      // Crear cajón de cola de sincronización
      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { 
          keyPath: 'id' 
        });
        queueStore.createIndex('timestamp', 'timestamp');
        queueStore.createIndex('entity', 'entity');
      }
    };
  });
}
```

**¿Qué son los índices?**
- Como el **índice de un libro** 📖
- Permiten buscar rápido sin leer todo
- Ejemplo: Buscar todas las ventas con `synced: false`

---

### Guardar Datos (Transacciones)

**El problema de IndexedDB nativo:**
```typescript
// ❌ No funciona (no es Promise nativo)
const data = await db.transaction('sales').objectStore('sales').get('123');
```

**Solución: Wrappers con Promises**
```typescript
private getFromStore<T>(storeName: string, key: string): Promise<T | undefined> {
  if (!this.db) return Promise.resolve(undefined);

  return new Promise((resolve, reject) => {
    // 1. Crear transacción (modo lectura)
    const transaction = this.db!.transaction([storeName], 'readonly');
    
    // 2. Acceder al "cajón" (object store)
    const store = transaction.objectStore(storeName);
    
    // 3. Hacer la petición
    const request = store.get(key);

    // 4. Manejar respuesta
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

**Tipos de transacciones:**
| Modo | Permisos | Uso |
|------|----------|-----|
| `readonly` | Solo leer 👁️ | `get()`, `getAll()` |
| `readwrite` | Leer y escribir ✍️ | `put()`, `delete()` |

---

### Sistema de Reintentos

**¿Por qué reintentar?**
- La red puede fallar momentáneamente
- El servidor puede estar ocupado
- Timeouts aleatorios

**Implementación:**
```typescript
async syncPendingOperations(): Promise<void> {
  const queue = await this.getAllFromStore<SyncQueueItem>('syncQueue');
  
  for (const item of queue) {
    try {
      // Intentar sincronizar
      await this.http.post(`/api/${item.entity}`, item.data).toPromise();
      
      // ✅ Éxito: marcar y borrar
      await this.markAsSynced(item);
      await this.deleteFromStore('syncQueue', item.id);
      
    } catch (error) {
      console.error('Error:', error);
      
      // ⚠️ Falló: incrementar reintentos
      if (item.retries < 3) {
        item.retries++;  // 0 → 1 → 2 → 3
        await this.putInStore('syncQueue', item);
      } else {
        // ❌ Después de 3 intentos, abandonar
        console.error('Operación descartada:', item);
      }
    }
  }
}
```

**Estrategia de reintentos:**
1. Intento 1: Inmediato (cuando vuelve internet)
2. Intento 2: Al próximo evento `online`
3. Intento 3: Al próximo evento `online`
4. **Descartado** (se podría mover a una "cola de errores")

---

### Limpieza Automática (7 días)

**¿Por qué limpiar?**
- IndexedDB tiene límite de espacio (~50MB)
- Datos antiguos ya sincronizados no sirven
- Mejor rendimiento con menos datos

**Implementación:**
```typescript
async cleanOldData(): Promise<void> {
  // 1. Calcular timestamp de hace 7 días
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  //                                  ↑días ↑horas ↑min ↑seg ↑ms
  
  // 2. Obtener todas las ventas
  const oldSales = await this.getAllFromStore<SaleRecord>('sales');
  
  // 3. Filtrar y borrar
  for (const sale of oldSales) {
    if (sale.synced && sale.timestamp < sevenDaysAgo) {
      //     ↑ya sincronizado  ↑más viejo que 7 días
      await this.deleteFromStore('sales', sale.id);
    }
  }
}
```

**¿Cuándo se ejecuta?**
- Manualmente: `offlineService.cleanOldData()`
- Automático: Se puede configurar un `setInterval()` en el constructor

---

## 📊 Monitoreo y Debugging

### Logs Útiles

**Agregar en `syncPendingOperations()`:**
```typescript
console.log(`📤 Sincronizando ${item.operation} en ${item.entity}`, item.data);
console.log(`✅ Sincronizado exitosamente: ${item.id}`);
console.log(`❌ Error (intento ${item.retries}/3):`, error);
```

**Ver en tiempo real:**
```javascript
// En la consola del navegador
const offlineService = ...; // (obtener como antes)

// Observar cambios en signals
setInterval(() => {
  console.log({
    online: offlineService.isOnline(),
    pending: offlineService.pendingSync()
  });
}, 1000); // Cada segundo
```

---

### DevTools Tips

**Application Tab:**
```
Application
├── Service Workers      ← PWA (otra feature)
├── Storage
│   ├── IndexedDB
│   │   └── denraf-offline  ← ¡Aquí están tus datos!
│   │       ├── sales
│   │       ├── inventory
│   │       └── syncQueue
│   ├── Local Storage    ← localStorage
│   └── Session Storage
└── Cache Storage        ← Service Worker cache
```

**Network Tab:**
- **Offline checkbox**: Simular sin internet
- **Throttling**: Simular 3G lento
- **Filter**: `api/` para ver solo requests del backend

**Console Tab:**
```javascript
// Comandos útiles
indexedDB.databases()  // Listar todas las DBs
  .then(dbs => console.table(dbs));

// Borrar todo (resetear)
indexedDB.deleteDatabase('denraf-offline');
```

---

## 🎓 Conceptos Avanzados (Opcional)

### Signals de Angular

**¿Qué son?**
- Variables reactivas (como `useState` en React)
- Cuando cambian, la UI se actualiza automáticamente

**Ejemplo:**
```typescript
// En el servicio
isOnline = signal(true);

// En el componente
@if (offlineService.isOnline()) {
  <p>✅ Conectado</p>
} @else {
  <p>❌ Sin internet</p>
}

// Cuando cambia:
offlineService.isOnline.set(false);
// → La UI se actualiza AUTOMÁTICAMENTE
```

---

### Computed Signals

**Señales que dependen de otras:**
```typescript
showReconnectedToast = computed(() => {
  const wasOffline = this.previousOnlineState;
  const isNowOnline = this.offlineService.isOnline();
  
  return wasOffline === false && isNowOnline === true;
  //     ↑ Estaba offline      ↑ Ahora está online
  //     = ¡Acaba de reconectar!
});
```

---

### Transacciones ACID

**En bases de datos tradicionales:**
- **A**tomicity: Todo o nada (si falla, se revierte)
- **C**onsistency: Datos siempre válidos
- **I**solation: Transacciones no se interfieren
- **D**urability: Cambios permanentes

**En IndexedDB:**
✅ Atomicity, Consistency, Isolation
❌ Durability (el navegador puede borrar datos)

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "No aparece el badge offline"

**Posibles causas:**
1. El componente no está en el layout
2. Los estilos están siendo sobrescritos
3. Z-index muy bajo

**Solución:**
```typescript
// Verificar que esté en main-layout.component.html
<app-connection-status />

// Verificar z-index en el CSS
.badge { z-index: 9999 !important; }
```

---

### Problema 2: "Los datos no se sincronizan"

**Debug:**
```javascript
// 1. Verificar que hay tareas pendientes
offlineService.pendingSync() // Debe ser > 0

// 2. Ver la cola
indexedDB.open('denraf-offline').onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('syncQueue');
  const req = tx.objectStore('syncQueue').getAll();
  req.onsuccess = () => console.table(req.result);
};

// 3. Forzar sincronización manual
offlineService.syncPendingOperations();
```

---

### Problema 3: "IndexedDB no se crea"

**Posibles causas:**
1. Navegador no soporta IndexedDB
2. Modo incógnito (algunos navegadores bloquean)
3. Error en `onupgradeneeded`

**Solución:**
```javascript
// Verificar soporte
if ('indexedDB' in window) {
  console.log('✅ IndexedDB soportado');
} else {
  console.log('❌ No soportado');
}
```

---

## 🎯 Resumen Ejecutivo

### Lo que se implementó:

1. **OfflineService** (300 líneas)
   - Base de datos IndexedDB con 3 stores
   - Sistema de cola de sincronización
   - Detección de online/offline
   - Reintentos automáticos (máx 3)
   - Limpieza de datos antiguos (7 días)

2. **ConnectionStatusComponent** (100 líneas)
   - Badge de "Sin conexión" (amarillo pulsante)
   - Badge de "Sincronizando" (verde con spinner)
   - Toast de "Conexión restaurada" (3 segundos)

3. **Signals Reactivos**
   - `isOnline()`: Estado de conexión
   - `pendingSync()`: Contador de operaciones pendientes

4. **Diseño Zen Minimalista**
   - Glassmorphism (fondo blur)
   - Animaciones suaves (150ms)
   - Modo oscuro completo
   - Colores: Stone + Amber + Emerald

### Cómo probar (ultra resumido):

```bash
# 1. Abrir app
ng serve

# 2. En el navegador
F12 → Network → ✅ Offline

# 3. En la consola
const app = document.querySelector('app-root');
const injector = app.__ngContext__?.[8];
const offlineService = injector?.get('OfflineService');

offlineService.saveSaleOffline({ total: 100 });
console.log(offlineService.pendingSync()); // 1

# 4. Reconectar
F12 → Network → ☐ Offline

# 5. Verificar
// Badge debería mostrar "Sincronizando..." y luego desaparecer
```

---

## 📚 Recursos Adicionales

**Para profundizar:**
- [MDN: IndexedDB](https://developer.mozilla.org/es/docs/Web/API/IndexedDB_API)
- [Angular Signals](https://angular.dev/guide/signals)
- [Service Workers](https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API)

**Ejemplos en el código:**
- `src/app/core/services/offline.service.ts` (Servicio principal)
- `src/app/shared/ui/connection-status/` (Badge UI)
- `PWA-README.md` (Documentación general PWA)

---

¿Tienes alguna pregunta sobre alguna parte específica? 🤓
