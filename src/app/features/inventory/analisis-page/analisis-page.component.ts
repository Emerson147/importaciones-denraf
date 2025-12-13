import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { ApexChartConfigService } from '../../../core/services/apex-chart-config.service';
import { ApexOptions } from 'ng-apexcharts';

@Component({
  selector: 'app-analisis-page',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
  ],
  templateUrl: './analisis-page.component.html',
  styleUrls: ['./analisis-page.component.css']
})
export class AnalisisPageComponent {
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private apexConfigService = inject(ApexChartConfigService);

  // Servicios y datos inteligentes
  metrics = this.inventoryService.metrics;
  stockAlerts = this.inventoryService.stockAlerts;
  criticalProducts = this.inventoryService.criticalProducts;
  highDemandProducts = this.inventoryService.highDemandProducts;
  lowRotationProducts = this.inventoryService.lowRotationProducts;
  reorderSuggestions = this.inventoryService.reorderSuggestions;
  productAnalytics = this.inventoryService.productAnalytics;
  
  // Computed para alertas de alta prioridad
  highPriorityAlertsCount = computed(() => 
    this.stockAlerts().filter(alert => alert.priority === 'high').length
  );
  
  // Propiedades para acceder a funciones globales en el template
  readonly Infinity = Infinity;
  readonly isFinite = isFinite;

  // KPI: Valor Total del Inventario
  totalInventoryValue = this.productService.totalInventoryValue;

  // KPI: Productos con Stock Bajo
  lowStockCount = computed(() => {
    return this.metrics().lowStockProducts + this.metrics().criticalProducts;
  });

  // Gráfico de rotación de productos (Top 10 más vendidos)
  rotationChartOptions = computed<ApexOptions>(() => {
    const topProducts = this.highDemandProducts().slice(0, 10);
    
    return this.apexConfigService.getBarChartConfig({
      series: [{
        name: 'Rotación (und/día)',
        data: topProducts.map(p => Number(p.rotationRate.toFixed(2)))
      }],
      categories: topProducts.map(p => p.product.name.substring(0, 15)),
      height: 300,
      horizontal: true
    });
  });

  // Gráfico radial de estado del inventario
  inventoryStatusChartOptions = computed<ApexOptions>(() => {
    const m = this.metrics();
    const total = m.totalProducts;
    
    const healthy = total - m.criticalProducts - m.lowStockProducts - m.overstockedProducts;
    
    return this.apexConfigService.getDonutChartConfig({
      series: [
        healthy,
        m.lowStockProducts,
        m.criticalProducts,
        m.overstockedProducts
      ],
      labels: ['Saludable', 'Stock Bajo', 'Crítico', 'Sobrestock'],
      height: 300
    });
  });
}
