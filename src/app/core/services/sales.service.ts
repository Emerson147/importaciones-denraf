import { Injectable, signal, computed, inject } from '@angular/core';
import { Sale, SaleItem, Customer } from '../models';
import { NotificationService } from './notification.service';
import { ToastService } from './toast.service';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  
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
  createSale(sale: Omit<Sale, 'id' | 'saleNumber' | 'date'>): Sale {
    const newSale: Sale = {
      ...sale,
      id: this.generateId(),
      saleNumber: this.generateSaleNumber(),
      date: new Date()
    };

    // ⚡ SINCRONIZACIÓN AUTOMÁTICA: Reducir stock de cada producto vendido
    let stockUpdateSuccess = true;
    newSale.items.forEach(item => {
      const success = this.productService.reduceStock(item.productId, item.quantity);
      if (!success) {
        console.warn(`⚠️ No se pudo reducir stock del producto ${item.productId}`);
        stockUpdateSuccess = false;
      }
    });

    // Agregar venta al historial
    this.salesSignal.update(current => [newSale, ...current]);
    
    // Guardar en localStorage
    this.saveToLocalStorage();
    
    // 🔔 Notificaciones automáticas
    this.checkAndNotify(newSale);
    
    // Toast de confirmación
    if (stockUpdateSuccess) {
      this.toastService.success(`✅ Venta ${newSale.saleNumber} registrada e inventario actualizado`);
    } else {
      this.toastService.warning(`⚠️ Venta registrada pero revisa el inventario`);
    }
    
    return newSale;
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
    const stored = localStorage.getItem('denraf_sales');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.salesSignal.set(parsed);
      } catch (error) {
        console.error('Error loading sales:', error);
      }
    }
  }

  // Guardar en localStorage
  private saveToLocalStorage(): void {
    localStorage.setItem('denraf_sales', JSON.stringify(this.salesSignal()));
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
