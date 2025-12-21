/**
 * 🔄 Sync Service
 *
 * Sincroniza datos entre IndexedDB (local) y Supabase (nube).
 * Permite trabajar offline y sincronizar cuando hay conexión.
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { LocalDbService, SyncQueueItem } from './local-db.service';
import { supabase } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SyncService {
  private localDb = inject(LocalDbService);

  // Estado de conexión
  isOnline = signal(navigator.onLine);
  isSyncing = signal(false);
  pendingCount = signal(0);
  lastSyncAt = signal<Date | null>(null);

  // Estado derivado
  hasPending = computed(() => this.pendingCount() > 0);
  statusText = computed(() => {
    if (this.isSyncing()) return 'Sincronizando...';
    if (!this.isOnline()) return 'Offline';
    if (this.hasPending()) return `${this.pendingCount()} pendientes`;
    return 'Sincronizado';
  });

  constructor() {
    this.setupListeners();
    this.updatePendingCount();
  }

  /**
   * Configurar listeners de conexión
   */
  private setupListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Conexión restaurada');
      this.isOnline.set(true);
      this.syncAll(); // Sincronizar automáticamente
    });

    window.addEventListener('offline', () => {
      console.log('📴 Sin conexión');
      this.isOnline.set(false);
    });
  }

  /**
   * Agregar item a la cola de sincronización
   */
  async queueForSync(
    type: SyncQueueItem['type'],
    action: SyncQueueItem['action'],
    data: any
  ): Promise<void> {
    await this.localDb.addToSyncQueue({ type, action, data });
    await this.updatePendingCount();

    // Si hay internet, intentar sincronizar
    if (this.isOnline() && !this.isSyncing()) {
      this.syncAll();
    }
  }

  /**
   * Sincronizar todos los items pendientes
   */
  async syncAll(): Promise<boolean> {
    if (!this.isOnline() || this.isSyncing()) {
      return false;
    }

    this.isSyncing.set(true);
    let success = true;

    try {
      const queue = await this.localDb.getSyncQueue();
      console.log(`🔄 Sincronizando ${queue.length} items...`);

      for (const item of queue) {
        const itemSuccess = await this.syncItem(item);
        if (!itemSuccess) {
          success = false;
        }
      }

      this.lastSyncAt.set(new Date());
      console.log('✅ Sincronización completada');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      success = false;
    } finally {
      this.isSyncing.set(false);
      await this.updatePendingCount();
    }

    return success;
  }

  /**
   * Sincronizar un item individual
   */
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      const table = this.getTableName(item.type);

      switch (item.action) {
        case 'create':
        case 'update':
          const { error: upsertError } = await supabase.from(table).upsert(item.data);
          if (upsertError) throw upsertError;
          break;

        case 'delete':
          const { error: deleteError } = await supabase.from(table).delete().eq('id', item.data.id);
          if (deleteError) throw deleteError;
          break;
      }

      // Éxito: eliminar de la cola
      await this.localDb.removeSyncItem(item.id);
      return true;
    } catch (error) {
      console.error(`Error sincronizando ${item.type}:`, error);

      // Incrementar reintentos
      item.retries++;

      if (item.retries >= 3) {
        console.error(`Item ${item.id} falló después de 3 intentos, eliminando`);
        await this.localDb.removeSyncItem(item.id);
      } else {
        await this.localDb.updateSyncItem(item);
      }

      return false;
    }
  }

  /**
   * Obtener nombre de tabla en Supabase
   */
  private getTableName(type: SyncQueueItem['type']): string {
    const tables: Record<string, string> = {
      product: 'productos',
      sale: 'ventas',
      user: 'usuarios',
    };
    return tables[type] || type;
  }

  /**
   * Actualizar contador de pendientes
   */
  private async updatePendingCount() {
    const count = await this.localDb.getSyncQueueCount();
    this.pendingCount.set(count);
  }

  /**
   * Descargar datos frescos de Supabase a IndexedDB
   */
  async pullFromCloud(): Promise<void> {
    if (!this.isOnline()) return;

    try {
      // Productos
      const { data: productos } = await supabase.from('productos').select('*').order('name');

      if (productos) {
        await this.localDb.saveProducts(productos);
      }

      // Ventas (últimas 100)
      const { data: ventas } = await supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (ventas) {
        await this.localDb.saveSales(ventas);
      }

      console.log('⬇️ Datos descargados de Supabase');
    } catch (error) {
      console.error('Error descargando datos:', error);
    }
  }
}
