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

      // 🔄 Adaptar datos de Angular a Supabase
      const adaptedData = this.adaptToSupabase(item.type, item.data);

      switch (item.action) {
        case 'create':
        case 'update':
          const { error: upsertError } = await supabase.from(table).upsert(adaptedData);
          if (upsertError) throw upsertError;
          break;

        case 'delete':
          const { error: deleteError } = await supabase.from(table).delete().eq('id', item.data.id);
          if (deleteError) throw deleteError;
          break;
      }

      // Éxito: eliminar de la cola
      await this.localDb.removeSyncItem(item.id);
      console.log(`✅ Sincronizado ${item.type}: ${item.action}`);
      return true;
    } catch (error) {
      console.error(`❌ Error sincronizando ${item.type}:`, error);

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
   * 🔄 Adaptar datos de Angular a formato Supabase
   * Angular usa camelCase, Supabase usa snake_case
   */
  private adaptToSupabase(type: string, data: any): any {
    if (type === 'product') {
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        brand: data.brand,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        min_stock: data.minStock,
        sizes: data.sizes,
        colors: data.colors,
        image: data.image,
        barcode: data.barcode,
        status: data.status || 'active',
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      };
    }

    if (type === 'sale') {
      // Validar si vendedor_id es UUID válido (evitar IDs antiguos como "user-2")
      const isValidUUID = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      return {
        id: data.id,
        sale_number: data.saleNumber,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        payment_method: data.paymentMethod,
        status: data.status,
        notes: data.notes,
        created_by: data.createdBy,
        // Solo incluir vendedor_id si es UUID válido
        vendedor_id: data.vendedorId && isValidUUID(data.vendedorId) ? data.vendedorId : null,
        created_at: data.date,
      };
    }

    if (type === 'user') {
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        pin: data.pin,
        avatar: data.avatar,
        created_at: data.createdAt,
      };
    }

    // Si no hay adaptador, devolver datos originales
    return data;
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
   * Retorna los productos adaptados al formato Angular
   */
  async pullFromCloud(): Promise<{ products: any[]; sales: any[] }> {
    if (!this.isOnline()) {
      return { products: [], sales: [] };
    }

    try {
      // Productos
      const { data: productosRaw, error: prodError } = await supabase
        .from('productos')
        .select('*')
        .order('name');

      if (prodError) {
        console.error('Error descargando productos:', prodError);
      }

      // Adaptar productos de Supabase a Angular
      const productos = (productosRaw || []).map((p: any) => this.adaptFromSupabase('product', p));

      if (productos.length > 0) {
        await this.localDb.saveProducts(productos);
      }

      // Ventas (últimas 100)
      const { data: ventasRaw, error: saleError } = await supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (saleError) {
        console.error('Error descargando ventas:', saleError);
      }

      const ventas = (ventasRaw || []).map((v: any) => this.adaptFromSupabase('sale', v));

      if (ventas.length > 0) {
        await this.localDb.saveSales(ventas);
      }

      console.log(`⬇️ Datos descargados: ${productos.length} productos, ${ventas.length} ventas`);
      return { products: productos, sales: ventas };
    } catch (error) {
      console.error('Error descargando datos:', error);
      return { products: [], sales: [] };
    }
  }

  /**
   * 🔄 Adaptar datos de Supabase a formato Angular
   * Supabase usa snake_case, Angular usa camelCase
   */
  private adaptFromSupabase(type: string, data: any): any {
    if (type === 'product') {
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        brand: data.brand,
        price: Number(data.price),
        cost: Number(data.cost || 0),
        stock: data.stock || 0,
        minStock: data.min_stock || 5,
        sizes: data.sizes || [],
        colors: data.colors || [],
        image: data.image,
        barcode: data.barcode,
        status: data.status || 'active',
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
      };
    }

    if (type === 'sale') {
      return {
        id: data.id,
        saleNumber: data.sale_number,
        date: data.created_at ? new Date(data.created_at) : new Date(),
        subtotal: Number(data.subtotal),
        discount: Number(data.discount || 0),
        tax: Number(data.tax || 0),
        total: Number(data.total),
        paymentMethod: data.payment_method,
        status: data.status,
        notes: data.notes,
        createdBy: data.created_by,
        vendedorId: data.vendedor_id,
      };
    }

    return data;
  }
}
