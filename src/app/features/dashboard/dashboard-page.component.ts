import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { UiInputComponent } from '../../shared/ui/ui-input/ui-input.component';
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';
import { UiPageHeaderComponent } from '../../shared/ui/ui-page-header/ui-page-header.component';
import { UiKpiCardComponent } from '../../shared/ui/ui-kpi-card/ui-kpi-card.component';
import { UiExportMenuComponent } from '../../shared/ui/ui-export-menu/ui-export-menu.component';
import { ToastService } from '../../core/services/toast.service';
import { SalesService } from '../../core/services/sales.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ApexChartConfigService } from '../../core/services/apex-chart-config.service';
import { ApexOptions } from 'ng-apexcharts';

// MODELO DE PRODUCTO (Inventario)
interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  sizes: string[];
  cost: number;
  price: number;
  image: string | null;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    UiInputComponent,
    UiButtonComponent,
    UiPageHeaderComponent,
    UiKpiCardComponent,
    UiExportMenuComponent,
  ],
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPageComponent {
  private toastService = inject(ToastService);
  private salesService = inject(SalesService);
  private analyticsService = inject(AnalyticsService);
  private apexConfigService = inject(ApexChartConfigService);

  // Métricas de analytics
  profitMargin = this.analyticsService.profitMargin;
  roi = this.analyticsService.roi;
  averageTicket = this.analyticsService.averageTicket;
  conversionRate = this.analyticsService.conversionRate;
  topProfitableProducts = this.analyticsService.topProfitableProducts;
  weekComparison = this.analyticsService.weekComparison;
  weekComparisonChartData = this.analyticsService.weekComparisonChartData;
  salesForecast = this.analyticsService.salesForecast;

  // Configuración de gráficos ApexCharts
  weeklyChartOptions = computed<ApexOptions>(() => {
    const comparison = this.weekComparison();
    return this.apexConfigService.getAreaChartConfig({
      series: [
        {
          name: 'Esta semana',
          data: comparison.current.dailyData
        },
        {
          name: 'Semana anterior',
          data: comparison.previous.dailyData
        }
      ],
      categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      height: 240
    });
  });

  // Estado del formulario de búsqueda y dialogo
  searchQuery = signal<string>('');
  isDialogOpen = signal(false);
  dialogTrigger = signal<HTMLElement | null>(null);

  // Estado del formulario de producto
  newProductName = signal('');
  newProductCategory = signal('Casacas');
  newProductStock = signal<number>(0);
  newProductCost = signal<number>(0);
  newProductPrice = signal<number>(0);
  newProductSizes = signal<string[]>([]);
  newProductImage = signal<string | null>(null);

  // Computed para ganancia y margen
  newProductProfit = computed(() => {
    return this.newProductPrice() - this.newProductCost();
  });

  newProductMargin = computed(() => {
    const cost = this.newProductCost();
    const price = this.newProductPrice();
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  });

  // Lista de productos (simulado por ahora, pendiente ProductService)
  products = signal<Product[]>([]);

  // --- DATOS DEL DASHBOARD DESDE SALESSERVICE ---
  
  // KPIs principales
  todaySales = this.salesService.todaySales;
  todayRevenue = this.salesService.todayRevenue;
  weeklySales = this.salesService.weeklySales;
  weeklyRevenue = this.salesService.weeklyRevenue;
  monthlySales = this.salesService.monthlySales;
  monthlyRevenue = this.salesService.monthlyRevenue;

  // Gráfico de ingresos semanales (últimos 7 días)
  weeklyRevenueChart = computed(() => {
    const days = 7;
    const today = new Date();
    const revenues: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const daySales = this.salesService.allSales().filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });

      const dayRevenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
      revenues.push(dayRevenue);
    }

    return revenues;
  });

  // Ventas pendientes
  pendingSales = computed(() => {
    return this.salesService.allSales().filter(s => s.status === 'pending').length;
  });

  // Top productos desde ventas reales
  topProducts = this.salesService.topProducts;

  // Productos con stock bajo (simulado, pendiente ProductService)
  lowStockProducts = signal([
    { name: 'Casaca Bomber', stock: 2, category: 'Casacas' },
    { name: 'Jean Slim Fit', stock: 3, category: 'Pantalones' },
    { name: 'Gorra Urbana', stock: 1, category: 'Accesorios' }
  ]);

  // Datos formateados para exportación
  exportData = computed(() => {
    return this.todaySales().map(sale => ({
      'Nº Venta': sale.saleNumber,
      'Fecha': new Date(sale.date).toLocaleDateString('es-PE'),
      'Cliente': sale.customer?.name || 'Cliente General',
      'Items': sale.items.length,
      'Subtotal': sale.subtotal,
      'Descuento': sale.discount,
      'Total': sale.total,
      'Estado': sale.status === 'completed' ? 'Completada' : sale.status === 'pending' ? 'Pendiente' : 'Cancelada'
    }));
  });

  // ACCIÓN: Abrir panel
  // ACCIÓN: Abrir panel de nuevo producto
  openNewOrder(event?: Event | HTMLElement) {
    const target = (event instanceof Event ? event.target : event) as HTMLElement;
    this.dialogTrigger.set(target || null);
    this.isDialogOpen.set(true);
  }

  // --- MÉTODOS PARA EL FORMULARIO DE PRODUCTO ---

  toggleSize(size: string) {
    this.newProductSizes.update((sizes) => {
      if (sizes.includes(size)) {
        return sizes.filter((s) => s !== size);
      } else {
        return [...sizes, size];
      }
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newProductImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct() {
    const newProduct: Product = {
      id: `PROD-${Math.floor(Math.random() * 10000)}`,
      name: this.newProductName(),
      category: this.newProductCategory(),
      stock: this.newProductStock(),
      sizes: this.newProductSizes(),
      cost: this.newProductCost(),
      price: this.newProductPrice(),
      image: this.newProductImage(),
    };

    console.log('Guardando producto:', newProduct);
    this.products.update((prev) => [newProduct, ...prev]);

    this.toastService.success(`Producto "${newProduct.name}" agregado correctamente`);
    this.isDialogOpen.set(false);
    this.resetForm();
  }

  resetForm() {
    this.newProductName.set('');
    this.newProductCategory.set('Casacas');
    this.newProductStock.set(0);
    this.newProductCost.set(0);
    this.newProductPrice.set(0);
    this.newProductSizes.set(['M']); // Default 'M'
    this.newProductImage.set(null);
  }
}
