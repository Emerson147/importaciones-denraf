import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { UiButtonComponent } from '../../shared/ui/ui-button/ui-button.component';
import { UiExportMenuComponent } from '../../shared/ui/ui-export-menu/ui-export-menu.component';
import { AuthService } from '../../core/auth/auth';
import { SalesService } from '../../core/services/sales.service';
import { ApexChartConfigService } from '../../core/services/apex-chart-config.service';
import { ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, UiButtonComponent, UiExportMenuComponent],
  templateUrl: './reports-page.component.html',
})
export class ReportsPageComponent {
  private authService = inject(AuthService);
  private salesService = inject(SalesService);
  private apexConfigService = inject(ApexChartConfigService);
  
  // DATOS DE PRUEBA (Ventas de los últimos 7 días)
  weeklySales = [1200, 1500, 900, 2100, 1800, 3200, 2800];
  
  // Ventas mensuales (últimos 6 meses)
  monthlySales = [8500, 9200, 7800, 10500, 12300, 14250];
  
  // Productos Estrella
  topProducts = signal([
    { name: 'Casaca North Face', sold: 45, revenue: 6750, trend: '+12%' },
    { name: 'Jean Skinny Black', sold: 38, revenue: 3420, trend: '+5%' },
    { name: 'Polo Básico Blanco', sold: 120, revenue: 3600, trend: '+20%' },
    { name: 'Gorra Urbana', sold: 25, revenue: 875, trend: '+8%' },
  ]);

  // Datos formateados para exportación
  exportData = computed(() => {
    return this.topProducts().map(p => ({
      Producto: p.name,
      'Unidades Vendidas': p.sold,
      'Ingresos (S/)': p.revenue,
      Tendencia: p.trend
    }));
  });

  // Métricas computadas
  totalRevenue = computed(() => {
    return this.weeklySales.reduce((sum, val) => sum + val, 0);
  });

  averageSale = computed(() => {
    return this.totalRevenue() / this.weeklySales.length;
  });

  currentRange = signal('Esta Semana');

  // Ventas por vendedor
  vendorSales = computed(() => {
    const users = this.authService.getAvailableUsers();
    const sales = this.salesService.allSales();
    
    return users.map(user => {
      const userSales = sales.filter(s => s.vendedorId === user.id);
      const revenue = userSales.reduce((sum, s) => sum + s.total, 0);
      const count = userSales.length;
      const avgTicket = count > 0 ? revenue / count : 0;
      
      return {
        id: user.id,
        name: user.name,
        revenue,
        count,
        avgTicket,
        percentage: 0 // Se calculará después
      };
    });
  });

  // Ventas por vendedor con porcentajes
  vendorSalesWithPercentage = computed(() => {
    const data = this.vendorSales();
    const total = data.reduce((sum, v) => sum + v.revenue, 0);
    
    return data
      .map(v => ({
        ...v,
        percentage: total > 0 ? (v.revenue / total) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);
  });

  // Datos para el gráfico de barras
  vendorChartData = computed(() => {
    return this.vendorSalesWithPercentage().map(v => v.revenue);
  });

  // Labels para el gráfico
  vendorLabels = computed(() => {
    return this.vendorSalesWithPercentage().map(v => v.name);
  });

  // Configuración de gráfico semanal (Área)
  weeklyChartOptions = computed<ApexOptions>(() => {
    return this.apexConfigService.getAreaChartConfig({
      series: [{
        name: 'Ventas Diarias',
        data: this.weeklySales
      }],
      categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      height: 300
    });
  });

  // Configuración de gráfico mensual (Área)
  monthlyChartOptions = computed<ApexOptions>(() => {
    return this.apexConfigService.getAreaChartConfig({
      series: [{
        name: 'Ventas Mensuales',
        data: this.monthlySales
      }],
      categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      height: 300
    });
  });

  // Configuración de gráfico de vendedores (Barras)
  vendorChartOptions = computed<ApexOptions>(() => {
    return this.apexConfigService.getBarChartConfig({
      series: [{
        name: 'Ingresos',
        data: this.vendorChartData()
      }],
      categories: this.vendorLabels(),
      height: 300
    });
  });

  // Configuración de gráfico de categorías (Dona)
  categoriesChartOptions = computed<ApexOptions>(() => {
    return this.apexConfigService.getDonutChartConfig({
      series: [4500, 3200, 2800, 1900, 1200],
      labels: ['Casacas', 'Jeans', 'Polos', 'Gorras', 'Accesorios'],
      height: 350
    });
  });

  downloadReport() {
    console.log('Descargando PDF...'); // Aquí iría tu lógica de exportar
    alert('Funcionalidad de exportación próximamente');
  }
}