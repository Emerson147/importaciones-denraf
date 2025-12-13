import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../../../core/services/export.service';
import { ClickOutsideDirective } from '../../directives/click-outside/click-outside.component';
import { ThemeService } from '../../../core/theme/theme.service';

export interface ExportOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  format: 'excel' | 'pdf' | 'csv' | 'print';
}

@Component({
  selector: 'app-ui-export-menu',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './ui-export-menu.component.html',
  styleUrl: './ui-export-menu.component.css'
})
export class UiExportMenuComponent {
  @Input() data: any[] = [];
  @Input() type: 'dashboard' | 'sales' | 'inventory' | 'clients' | 'reports' = 'sales';
  @Input() mini: boolean = false; // Modo compacto para botón flotante

  isOpen = signal(false);
  private exportService = new ExportService();
  themeService = inject(ThemeService);
  isDarkMode = computed(() => this.themeService.darkMode());

  // Opciones según el tipo de datos
  get exportOptions(): ExportOption[] {
    const baseOptions: ExportOption[] = [
      {
        id: 'excel',
        label: 'Excel',
        icon: 'description',
        description: 'Exportar a .xlsx',
        format: 'excel'
      },
      {
        id: 'csv',
        label: 'CSV',
        icon: 'table_chart',
        description: 'Valores separados por comas',
        format: 'csv'
      },
      {
        id: 'pdf',
        label: 'PDF',
        icon: 'picture_as_pdf',
        description: 'Documento portable',
        format: 'pdf'
      }
    ];

    // Agregar opción de impresión para ventas
    if (this.type === 'sales') {
      baseOptions.push({
        id: 'print',
        label: 'Imprimir',
        icon: 'print',
        description: 'Ticket térmico',
        format: 'print'
      });
    }

    return baseOptions;
  }

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  handleExport(option: ExportOption): void {
    if (!this.data || this.data.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    console.log('Exportando:', { option, type: this.type, dataLength: this.data.length });

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${this.type}-${timestamp}`;

    switch (option.format) {
      case 'excel':
        this.exportService.exportToExcel(this.data, filename);
        break;
      
      case 'csv':
        this.exportService.exportToCSV(this.data, filename);
        break;
      
      case 'pdf':
        const columns = this.getColumnsForType();
        this.exportService.exportToPDF(this.data, columns, { 
          filename,
          title: this.getTitleForType(),
          orientation: this.data.length > 50 ? 'portrait' : 'portrait'
        });
        break;
      
      case 'print':
        if (this.data.length > 0) {
          // Para imprimir ticket necesitamos el objeto Sale completo, no el formateado
          alert('Para imprimir tickets, usa el botón de impresión individual en cada venta');
        }
        break;
    }

    this.closeDropdown();
  }

  private getColumnsForType(): { header: string, dataKey: string }[] {
    switch (this.type) {
      case 'sales':
        return [
          { header: 'Nº Venta', dataKey: 'Nº Venta' },
          { header: 'Fecha', dataKey: 'Fecha' },
          { header: 'Cliente', dataKey: 'Cliente' },
          { header: 'Items', dataKey: 'Items' },
          { header: 'Total', dataKey: 'Total' },
          { header: 'Estado', dataKey: 'Estado' }
        ];
      
      case 'inventory':
        return [
          { header: 'Producto', dataKey: 'name' },
          { header: 'Categoría', dataKey: 'category' },
          { header: 'Stock', dataKey: 'stock' },
          { header: 'Precio', dataKey: 'price' }
        ];
      
      case 'clients':
        return [
          { header: 'Nombre', dataKey: 'name' },
          { header: 'Email', dataKey: 'email' },
          { header: 'Teléfono', dataKey: 'phone' }
        ];
      
      case 'reports':
        return [
          { header: 'Producto', dataKey: 'Producto' },
          { header: 'Vendidas', dataKey: 'Unidades Vendidas' },
          { header: 'Ingresos', dataKey: 'Ingresos (S/)' },
          { header: 'Tendencia', dataKey: 'Tendencia' }
        ];
      
      default:
        // Detectar columnas automáticamente del primer objeto
        if (this.data.length > 0) {
          const firstRow = this.data[0];
          return Object.keys(firstRow).map(key => ({
            header: key,
            dataKey: key
          }));
        }
        return [];
    }
  }

  private getTitleForType(): string {
    const titles = {
      dashboard: 'Dashboard - Análisis Empresarial',
      sales: 'Reporte de Ventas',
      inventory: 'Inventario de Productos',
      clients: 'Lista de Clientes',
      reports: 'Reportes'
    };
    return titles[this.type] || 'Exportación';
  }
}
