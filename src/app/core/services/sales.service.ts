import { Injectable, signal, computed, inject } from '@angular/core';
import { Sale, SaleItem, Customer } from '../models';
import { NotificationService } from './notification.service';
import { ToastService } from './toast.service';
import { ProductService } from './product.service';
import { ErrorHandlerService } from './error-handler.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  private errorHandler = inject(ErrorHandlerService);
  private storage = inject(StorageService);
  
  private readonly STORAGE_KEY = 'sales';
  
  // Estado de ventas
  private salesSignal = signal<Sale[]>([]);
  
  // Exponemos como readonly
  readonly sales = this.salesSignal.asReadonly();
  readonly allSales = this.sales; // Alias para compatibilidad

  // Ventas de hoy
  todaySales = computed(() => {
    const today = new Date().toDateString();
    return this.salesSignal().filter(s => 
      new Date(s.date).toDateString() === today
    );
  });

  // Ingresos de hoy
  todayRevenue = computed(() => {
    return this.todaySales().reduce((sum, s) => sum + s.total, 0);
  });

  // Ventas de la semana
  weeklySales = computed(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.salesSignal().filter(s => new Date(s.date) >= weekAgo);
  });

  // Ingresos de la semana
  weeklyRevenue = computed(() => {
    return this.weeklySales().reduce((sum, s) => sum + s.total, 0);
  });

  // Ventas del mes
  monthlySales = computed(() => {
    const now = new Date();
    return this.salesSignal().filter(s => {
      const saleDate = new Date(s.date);
      return saleDate.getMonth() === now.getMonth() && 
             saleDate.getFullYear() === now.getFullYear();
    });
  });

  // Ingresos del mes
  monthlyRevenue = computed(() => {
    return this.monthlySales().reduce((sum, s) => sum + s.total, 0);
  });

  // Productos más vendidos
  topProducts = computed(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    this.salesSignal().forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          productMap.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.subtotal
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
          date: new Date()
        };

        // ⚡ SINCRONIZACIÓN AUTOMÁTICA: Reducir stock de cada producto vendido
        const failedItems: string[] = [];
        newSale.items.forEach(item => {
          const success = this.productService.reduceStock(item.productId, item.quantity);
          if (!success) {
            failedItems.push(item.productName);
          }
        });

        if (failedItems.length > 0) {
          throw new Error(`No se pudo actualizar el stock de: ${failedItems.join(', ')}`);
        }

        // Agregar venta al historial
        this.salesSignal.update(current => [newSale, ...current]);
        
        // Guardar en localStorage
        this.saveToLocalStorage();
        
        // 🔔 Notificaciones automáticas
        this.checkAndNotify(newSale);
        
        // Toast de confirmación
        this.toastService.success(`✅ Venta ${newSale.saleNumber} registrada e inventario actualizado`);
        
        return newSale;
      },
      'Registro de venta',
      'No se pudo completar la venta'
    );
  }

  // Obtener venta por ID
  getSaleById(id: string): Sale | undefined {
    return this.salesSignal().find(s => s.id === id);
  }

  // Cancelar venta
  cancelSale(id: string): void {
    this.salesSignal.update(current =>
      current.map(s => s.id === id ? { ...s, status: 'cancelled' as const } : s)
    );
    this.saveToLocalStorage();
  }

  // Filtrar ventas por rango de fechas
  getSalesByDateRange(startDate: Date, endDate: Date): Sale[] {
    return this.salesSignal().filter(s => {
      const saleDate = new Date(s.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  // Filtrar ventas por método de pago
  getSalesByPaymentMethod(method: Sale['paymentMethod']): Sale[] {
    return this.salesSignal().filter(s => s.paymentMethod === method);
  }

  // Cargar ventas desde localStorage
  loadFromLocalStorage(): void {
    const stored = this.storage.get<Sale[]>(this.STORAGE_KEY);
    if (stored) {
      this.salesSignal.set(stored);
    }
  }

  // Guardar en localStorage
  private saveToLocalStorage(): void {
    this.storage.set(this.STORAGE_KEY, this.salesSignal());
  }

  // Generar ID único
  private generateId(): string {
    return `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generar número de venta
  private generateSaleNumber(): string {
    const count = this.salesSignal().length + 1;
    return `VENTA-${count.toString().padStart(4, '0')}`;
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
          actionRoute: '/pos'
        }
      );

      // Si es una venta grande (>$500), notificación especial
      if (sale.total > 500) {
        this.notificationService.success(
          '🎉 Venta Grande',
          `¡Excelente! Venta de $${sale.total.toLocaleString()} completada`,
          {
            actionLabel: 'Ver dashboard',
            actionRoute: '/dashboard'
          }
        );
      }
    }

    // 2. Verificar stock bajo en productos vendidos
    sale.items.forEach(item => {
      // Simulamos stock bajo (en producción, verificarías con InventoryService)
      const estimatedStock = Math.floor(Math.random() * 15); // Mock
      
      if (estimatedStock < 5 && estimatedStock > 0) {
        this.notificationService.warning(
          '⚠️ Stock Bajo',
          `${item.productName} tiene solo ${estimatedStock} unidades disponibles`,
          {
            actionLabel: 'Ver inventario',
            actionRoute: '/inventory'
          }
        );
      } else if (estimatedStock === 0) {
        this.notificationService.error(
          '🚫 Producto Agotado',
          `${item.productName} está agotado. Necesita restock urgente`,
          {
            actionLabel: 'Gestionar inventario',
            actionRoute: '/inventory'
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
      byPaymentMethod
    };
  }
}
