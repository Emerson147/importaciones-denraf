/**
 * 📦 Local Database Service (IndexedDB)
 *
 * Almacenamiento local offline-first usando IndexedDB.
 * Permite que la app funcione sin internet.
 */
import { Injectable, signal } from '@angular/core';
import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type { Product, Sale } from '../models';

// Esquema de la base de datos local
interface DenrafDB extends DBSchema {
  productos: {
    key: string;
    value: Product;
    indexes: { 'por-categoria': string };
  };
  ventas: {
    key: string;
    value: Sale;
    indexes: { 'por-fecha': string };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
  };
}

export interface SyncQueueItem {
  id: string;
  type: 'product' | 'sale' | 'sale_item' | 'user';
  action: 'create' | 'update' | 'delete';
  data: any;
  createdAt: Date;
  retries: number;
}

@Injectable({ providedIn: 'root' })
export class LocalDbService {
  private db = signal<IDBPDatabase<DenrafDB> | null>(null);
  private dbName = 'denraf-offline-db';
  private dbVersion = 1;

  isReady = signal(false);

  constructor() {
    this.init();
  }

  /**
   * Inicializar la base de datos IndexedDB
   */
  private async init() {
    try {
      const database = await openDB<DenrafDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Store de productos
          if (!db.objectStoreNames.contains('productos')) {
            const productStore = db.createObjectStore('productos', { keyPath: 'id' });
            productStore.createIndex('por-categoria', 'category');
          }

          // Store de ventas
          if (!db.objectStoreNames.contains('ventas')) {
            const saleStore = db.createObjectStore('ventas', { keyPath: 'id' });
            saleStore.createIndex('por-fecha', 'createdAt');
          }

          // Store de cola de sincronización
          if (!db.objectStoreNames.contains('sync_queue')) {
            db.createObjectStore('sync_queue', { keyPath: 'id' });
          }
        },
      });

      this.db.set(database);
      this.isReady.set(true);
      console.log('📦 IndexedDB inicializada correctamente');
    } catch (error) {
      console.error('Error inicializando IndexedDB:', error);
    }
  }

  // ========== PRODUCTOS ==========

  async getProducts(): Promise<Product[]> {
    const db = this.db();
    if (!db) return [];
    return db.getAll('productos');
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const db = this.db();
    if (!db) return undefined;
    return db.get('productos', id);
  }

  async saveProduct(product: Product): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.put('productos', product);
  }

  async saveProducts(products: Product[]): Promise<void> {
    const db = this.db();
    if (!db) return;
    const tx = db.transaction('productos', 'readwrite');
    await Promise.all([...products.map((p) => tx.store.put(p)), tx.done]);
  }

  async deleteProduct(id: string): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.delete('productos', id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const db = this.db();
    if (!db) return [];
    return db.getAllFromIndex('productos', 'por-categoria', category);
  }

  // ========== VENTAS ==========

  async getSales(): Promise<Sale[]> {
    const db = this.db();
    if (!db) return [];
    return db.getAll('ventas');
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const db = this.db();
    if (!db) return undefined;
    return db.get('ventas', id);
  }

  async saveSale(sale: Sale): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.put('ventas', sale);
  }

  async saveSales(sales: Sale[]): Promise<void> {
    const db = this.db();
    if (!db) return;
    const tx = db.transaction('ventas', 'readwrite');
    await Promise.all([...sales.map((s) => tx.store.put(s)), tx.done]);
  }

  // ========== COLA DE SINCRONIZACIÓN ==========

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries'>): Promise<void> {
    const db = this.db();
    if (!db) return;

    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      retries: 0,
    };

    await db.put('sync_queue', queueItem);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = this.db();
    if (!db) return [];
    return db.getAll('sync_queue');
  }

  async removeSyncItem(id: string): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.delete('sync_queue', id);
  }

  async updateSyncItem(item: SyncQueueItem): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.put('sync_queue', item);
  }

  async clearSyncQueue(): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.clear('sync_queue');
  }

  async getSyncQueueCount(): Promise<number> {
    const db = this.db();
    if (!db) return 0;
    return db.count('sync_queue');
  }

  // ========== UTILIDADES ==========

  async clearAll(): Promise<void> {
    const db = this.db();
    if (!db) return;
    await db.clear('productos');
    await db.clear('ventas');
    await db.clear('sync_queue');
  }
}
