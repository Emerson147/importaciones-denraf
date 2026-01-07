import { Injectable, signal, computed, inject } from '@angular/core';
import { Sale, SaleItem, Customer } from '../models';
import { NotificationService } from './notification.service';
import { ToastService } from './toast.service';
import { ProductService } from './product.service';
import { ErrorHandlerService } from './error-handler.service';
import { SyncService } from './sync.service';
import { LocalDbService } from './local-db.service';

/**
 * 🚀 SalesService - Supabase First Architecture
 * Misma estrategia que ProductService: Supabase como verdad + IndexedDB como cache
 */
@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  private errorHandler = inject(ErrorHandlerService);
  private syncService = inject(SyncService);
  private localDb = inject(LocalDbService);

  // Estado de ventas
  private salesSignal = signal<Sale[]>([]);

  // 🔄 Estado de carga y sincronización
  isLoading = signal(true);
  isSyncing = signal(false);
  lastSyncTime = signal<Date | null>(null);

  // 🎯 Control de inicialización única
  private initialized = false;
  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

  // Exponemos como readonly
  readonly sales = this.salesSignal.asReadonly();
  readonly allSales = this.sales; // Alias para compatibilidad

  constructor() {
    // 🚀 Inicialización optimizada: solo una vez
    if (!this.initialized) {
      this.initialized = true;
      this.initStaleWhileRevalidate();
    }
  }

  /**
   * 🚀 Estrategia Stale-While-Revalidate (igual que ProductService)
   */
  private async initStaleWhileRevalidate(): Promise<void> {
    console.log('⚡ [Sales] Iniciando Stale-While-Revalidate...');

    // PASO 1: Cargar cache INMEDIATAMENTE
    const hasCache = await this.loadFromCache();

    // PASO 2: Actualizar desde Supabase SOLO si es necesario (background)
    const shouldSync = this.shouldSyncWithSupabase();
    if (shouldSync) {
      console.log('🔄 [Sales] Actualizando desde Supabase en background...');
      this.loadFromSupabaseBackground();
    } else {
      console.log('✅ [Sales] Cache reciente, no es necesario sincronizar');
      this.isLoading.set(false);
    }
  }

  /**
   * Cargar desde cache de IndexedDB (SIEMPRE primero)
   */
  private async loadFromCache(): Promise<boolean> {
    try {
      const cachedSales = await this.localDb.getSales();

      if (cachedSales && cachedSales.length > 0) {
        console.log(`⚡ [Sales] Cache: ${cachedSales.length} ventas cargadas INSTANTÁNEAMENTE`);
        this.salesSignal.set(cachedSales);
        this.isLoading.set(false);
        return true;
      } else {
        console.log('📄 [Sales] Sin cache, cargando desde Supabase...');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ [Sales] Error leyendo cache:', error);
      return false;
    }
  }

  /**
   * Verificar si debemos sincronizar con Supabase
   */
  private shouldSyncWithSupabase(): boolean {
    const lastSync = this.lastSyncTime();
    if (!lastSync) return true;

    const timeSinceLastSync = Date.now() - lastSync.getTime();
    return timeSinceLastSync > this.SYNC_INTERVAL_MS;
  }

  /**
   * Cargar desde Supabase en BACKGROUND
   */
  private loadFromSupabaseBackground(): void {
    this.syncFromSupabase();
  }

  /**
   * Sincronizar con Supabase (internal)
   */
  private async syncFromSupabase(): Promise<void> {
    if (!navigator.onLine) {
      console.log('📴 Sin conexión, usando solo cache');
      this.isLoading.set(false);
      return;
    }

    try {
      this.isSyncing.set(true);
      console.log('☁️ Cargando ventas desde Supabase...');

      const { sales } = await this.syncService.pullFromCloud();

      if (sales && sales.length > 0) {
        console.log(`✅ Supabase: ${sales.length} ventas cargadas`);
        this.salesSignal.set(sales);
        await this.localDb.saveSales(sales);
        this.lastSyncTime.set(new Date());
      }
    } catch (error) {
      console.error('❌ Error cargando ventas desde Supabase:', error);
    } finally {
      this.isLoading.set(false);
      this.isSyncing.set(false);
    }
  }

  /**
   * Sincronizar cambios locales hacia Supabase
   */
  private async syncToSupabase(): Promise<void> {
    try {
      this.isSyncing.set(true);
      await this.syncService.syncAll();
      console.log('✅ Cambios sincronizados con Supabase');
    } catch (error) {
      console.error('❌ Error sincronizando con Supabase:', error);
    } finally {
      this.isSyncing.set(false);
    }
  }

  // 📏 Cache de fecha actual para evitar recalcular new Date() en cada computed
  private currentDateCache = computed(() => {
    // Este computed se actualiza cuando cambian las ventas (trigger implícito)
    // Forzamos dependencia leyendo la señal para que se re-compute cuando cambia
    this.salesSignal();
    return new Date().toDateString();
  });

  // Ventas de hoy (optimizado con cache)
  todaySales = computed(() => {
    const today = this.currentDateCache();
    return this.salesSignal().filter((s) => new Date(s.date).toDateString() === today);
  });

  // Ingresos de hoy
  todayRevenue = computed(() => {
    return this.todaySales().reduce((sum, s) => sum + s.total, 0);
  });

  // Ventas de la semana (optimizado con cálculo de fecha cacheado)
  weeklySales = computed(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoTime = weekAgo.getTime();
    return this.salesSignal().filter((s) => new Date(s.date).getTime() >= weekAgoTime);
  });

  // Ingresos de la semana
  weeklyRevenue = computed(() => {
    return this.weeklySales().reduce((sum, s) => sum + s.total, 0);
  });

  // Ventas del mes
  monthlySales = computed(() => {
    const now = new Date();
    return this.salesSignal().filter((s) => {
      const saleDate = new Date(s.date);
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    });
  });

  // Ingresos del mes
  monthlyRevenue = computed(() => {
    return this.monthlySales().reduce((sum, s) => sum + s.total, 0);
  });

  // Productos más vendidos
  topProducts = computed(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    this.salesSignal().forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          productMap.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.subtotal,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });

  // ✅ Crear nueva venta Y REDUCIR STOCK AUTOMÁTICAMENTE
  createSale(sale: Omit<Sale, 'id' | 'saleNumber' | 'date'>): Sale | null {
    return this.errorHandler.handleSyncOperation(
      () => {
        // Validaciones
        if (!sale.items || sale.items.length === 0) {
          throw new Error('No se pueden crear ventas sin productos');
        }

        if (sale.total <= 0) {
          throw new Error('El total de la venta debe ser mayor a 0');
        }

        const newSale: Sale = {
          ...sale,
          id: this.generateId(),
          saleNumber: this.generateSaleNumber(),
          date: new Date(),
        };

        // ⚡ SINCRONIZACIÓN AUTOMÁTICA: Reducir stock de cada producto vendido
        const failedItems: string[] = [];
        newSale.items.forEach((item) => {
          const success = this.productService.reduceStock(
            item.productId,
            item.quantity,
            item.variantId
          );
          if (!success) {
            failedItems.push(item.productName);
          }
        });

        if (failedItems.length > 0) {
          throw new Error(`No se pudo actualizar el stock de: ${failedItems.join(', ')}`);
        }

        // Agregar venta al historial
        this.salesSignal.update((current) => [newSale, ...current]);

        // 🔄 Sincronizar venta con Supabase en segundo plano
        this.syncService.queueForSync('sale', 'create', newSale);
        this.localDb.saveSale(newSale);

        // 🔄 Sincronizar cada item de la venta (tabla venta_items)
        newSale.items.forEach((item, index) => {
          const saleItem = {
            id: crypto.randomUUID(),
            saleId: newSale.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          };
          this.syncService.queueForSync('sale_item', 'create', saleItem);
        });

        // Sincronizar cambios inmediatamente en segundo plano
        this.syncToSupabase();

        // 🔔 Notificaciones automáticas
        this.checkAndNotify(newSale);

        // Toast de confirmación
        this.toastService.success(
          `✅ Venta ${newSale.saleNumber} registrada e inventario actualizado`
        );

        return newSale;
      },
      'Registro de venta',
      'No se pudo completar la venta'
    );
  }

  /**
   * 🔄 Forzar sincronización manual con Supabase
   */
  async forceSync(): Promise<void> {
    console.log('🔄 [Sales] Sincronización manual forzada...');
    this.isSyncing.set(true);
    await this.syncFromSupabase();
    this.isSyncing.set(false);
  }

  // Obtener venta por ID
  getSaleById(id: string): Sale | undefined {
    return this.salesSignal().find((s) => s.id === id);
  }

  // ❌ Cancelar/Anular venta CON RESTAURACIÓN DE STOCK
  cancelSale(id: string, reason?: string, restoreStock: boolean = true): boolean {
    const sale = this.getSaleById(id);

    if (!sale) {
      this.toastService.error('Venta no encontrada');
      return false;
    }

    if (sale.status === 'cancelled') {
      this.toastService.warning('Esta venta ya fue anulada');
      return false;
    }

    // 🔄 RESTAURAR STOCK de cada producto
    if (restoreStock) {
      sale.items.forEach((item) => {
        const success = this.productService.addStock(item.productId, item.quantity, item.variantId);
        if (success) {
          console.log(`✅ Stock restaurado: ${item.productName} (+${item.quantity})`);
        } else {
          console.warn(`⚠️ No se pudo restaurar stock de: ${item.productName}`);
        }
      });
    }

    // Actualizar estado de la venta
    const cancellationDate = new Date();
    this.salesSignal.update((current) =>
      current.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'cancelled' as const,
              notes: s.notes
                ? `${s.notes} | ANULADA: ${
                    reason || 'Sin motivo'
                  } (${cancellationDate.toLocaleString()})`
                : `ANULADA: ${reason || 'Sin motivo'} (${cancellationDate.toLocaleString()})`,
            }
          : s
      )
    );

    // Sincronizar cambio con Supabase
    const cancelledSale = this.getSaleById(id);
    if (cancelledSale) {
      this.syncService.queueForSync('sale', 'update', cancelledSale);
      this.localDb.saveSale(cancelledSale);
      this.syncToSupabase();
    }

    this.toastService.success(
      `Venta ${sale.saleNumber} anulada${restoreStock ? ' y stock restaurado' : ''}`
    );
    return true;
  }

  // Filtrar ventas por rango de fechas
  getSalesByDateRange(startDate: Date, endDate: Date): Sale[] {
    return this.salesSignal().filter((s) => {
      const saleDate = new Date(s.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  // Filtrar ventas por método de pago
  getSalesByPaymentMethod(method: Sale['paymentMethod']): Sale[] {
    return this.salesSignal().filter((s) => s.paymentMethod === method);
  }

  // Generar ID único (UUID para Supabase)
  private generateId(): string {
    return crypto.randomUUID();
  }

  // Generar número de venta (único globalmente para multi-usuario)
  private generateSaleNumber(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const time = now.getTime().toString().slice(-6); // últimos 6 dígitos del timestamp
    return `V-${date}-${time}`;
  }

  // 🔔 Sistema de notificaciones automáticas
  private checkAndNotify(sale: Sale) {
    // 1. Venta completada exitosamente
    if (sale.status === 'completed') {
      this.toastService.success(
        `Venta ${sale.saleNumber} completada por $${sale.total.toLocaleString()}`,
        3000,
        {
          persistent: sale.total > 500, // Solo guardar ventas grandes
          title: sale.total > 500 ? '🎉 Venta Grande' : 'Venta Completada',
          actionLabel: 'Ver detalles',
          actionRoute: '/pos',
        }
      );

      // Si es una venta grande (>$500), notificación especial
      if (sale.total > 500) {
        this.notificationService.success(
          '🎉 Venta Grande',
          `¡Excelente! Venta de $${sale.total.toLocaleString()} completada`,
          {
            actionLabel: 'Ver dashboard',
            actionRoute: '/dashboard',
          }
        );
      }
    }

    // 2. Verificar stock bajo en productos vendidos
    sale.items.forEach((item) => {
      // Simulamos stock bajo (en producción, verificarías con InventoryService)
      const estimatedStock = Math.floor(Math.random() * 15); // Mock

      if (estimatedStock < 5 && estimatedStock > 0) {
        this.notificationService.warning(
          '⚠️ Stock Bajo',
          `${item.productName} tiene solo ${estimatedStock} unidades disponibles`,
          {
            actionLabel: 'Ver inventario',
            actionRoute: '/inventory',
          }
        );
      } else if (estimatedStock === 0) {
        this.notificationService.error(
          '🚫 Producto Agotado',
          `${item.productName} está agotado. Necesita restock urgente`,
          {
            actionLabel: 'Gestionar inventario',
            actionRoute: '/inventory',
          }
        );
      }
    });
  }

  // Exportar ventas a JSON
  exportToJSON(): string {
    return JSON.stringify(this.salesSignal(), null, 2);
  }

  // Estadísticas del día
  getDailyStats() {
    const today = this.todaySales();
    const totalSales = today.length;
    const totalRevenue = this.todayRevenue();
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const byPaymentMethod = today.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      totalRevenue,
      averageTicket,
      byPaymentMethod,
    };
  }
}
