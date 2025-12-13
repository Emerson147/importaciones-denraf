import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiPageHeaderComponent } from '../../../shared/ui/ui-page-header/ui-page-header.component';
import { UiEmptyStateComponent } from '../../../shared/ui/ui-empty-state/ui-empty-state.component';
import { UiExportMenuComponent } from '../../../shared/ui/ui-export-menu/ui-export-menu.component';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/auth/auth';
import { Sale } from '../../../core/models';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, UiPageHeaderComponent, UiEmptyStateComponent, UiExportMenuComponent],
  templateUrl: './sales-history.component.html',
})
export class SalesHistoryComponent {
  private salesService = inject(SalesService);
  private authService = inject(AuthService);

  // Filtros
  searchQuery = signal('');
  selectedPeriod = signal<'today' | 'week' | 'month' | 'all'>('today');
  selectedPayment = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  selectedVendor = signal<string | null>(null); // Filtro por vendedor
  
  constructor() {
    // Cargar ventas desde localStorage al iniciar
    this.salesService.loadFromLocalStorage();
    
    // Escuchar actualizaciones de ventas offline sincronizadas
    window.addEventListener('sales-updated', () => {
      console.log('📡 Detectado evento sales-updated, recargando ventas...');
      this.salesService.loadFromLocalStorage();
    });
  }

  // Ventas filtradas
  filteredSales = computed(() => {
    let sales = this.salesService.allSales();

    // Filtro por período
    switch (this.selectedPeriod()) {
      case 'today':
        sales = this.salesService.todaySales();
        break;
      case 'week':
        sales = this.salesService.weeklySales();
        break;
      case 'month':
        sales = this.salesService.monthlySales();
        break;
    }

    // Filtro por búsqueda
    const query = this.searchQuery().toLowerCase();
    if (query) {
      sales = sales.filter(s =>
        s.saleNumber.toLowerCase().includes(query) ||
        s.customer?.name.toLowerCase().includes(query) ||
        s.items.some(item => item.productName.toLowerCase().includes(query))
      );
    }

    // Filtro por método de pago
    if (this.selectedPayment()) {
      sales = sales.filter(s => s.paymentMethod === this.selectedPayment());
    }

    // Filtro por estado
    if (this.selectedStatus()) {
      sales = sales.filter(s => s.status === this.selectedStatus());
    }

    // Filtro por vendedor
    if (this.selectedVendor()) {
      sales = sales.filter(s => s.vendedorId === this.selectedVendor());
    }

    return sales;
  });

  // Resumen de ventas filtradas
  summary = computed(() => {
    const sales = this.filteredSales();
    return {
      count: sales.length,
      total: sales.reduce((sum, s) => sum + s.total, 0),
      average: sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0
    };
  });

  // Venta seleccionada para ver detalles
  selectedSale = signal<Sale | null>(null);

  // Datos formateados para exportación
  exportData = computed(() => {
    return this.filteredSales().map(sale => ({
      'Nº Venta': sale.saleNumber,
      'Fecha': new Date(sale.date).toLocaleDateString('es-PE'),
      'Hora': new Date(sale.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      'Cliente': sale.customer?.name || 'Cliente General',
      'Vendedor': sale.createdBy || 'Usuario POS',
      'Items': sale.items.length,
      'Subtotal': sale.subtotal.toFixed(2),
      'Descuento': sale.discount.toFixed(2),
      'Total': sale.total.toFixed(2),
      'Método Pago': this.getPaymentMethodLabel(sale.paymentMethod),
      'Estado': sale.status === 'completed' ? 'Completada' : sale.status === 'pending' ? 'Pendiente' : 'Cancelada'
    }));
  });

  // Texto descriptivo del período actual
  periodLabel = computed(() => {
    const labels = {
      today: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes',
      all: 'Todas'
    };
    return labels[this.selectedPeriod()];
  });

  viewSaleDetails(sale: Sale) {
    this.selectedSale.set(sale);
  }

  closeDetails() {
    this.selectedSale.set(null);
  }

  exportSales() {
    const json = this.salesService.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas-denraf-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      yape: 'Yape',
      plin: 'Plin'
    };
    return labels[method] || method;
  }

  getStatusBadge(status: string) {
    const badges: Record<string, { label: string; class: string }> = {
      completed: { label: 'Completada', class: 'bg-emerald-100 text-emerald-700' },
      pending: { label: 'Pendiente', class: 'bg-amber-100 text-amber-700' },
      cancelled: { label: 'Cancelada', class: 'bg-rose-100 text-rose-700' }
    };
    return badges[status] || { label: status, class: 'bg-stone-100 text-stone-700' };
  }

  getVendorName(vendedorId: string): string {
    const user = this.authService.getAvailableUsers().find(u => u.id === vendedorId);
    return user?.name || 'Usuario';
  }

  getVendorInitial(vendedorId: string): string {
    const name = this.getVendorName(vendedorId);
    return name.charAt(0).toUpperCase();
  }

  getVendorColor(vendedorId: string): string {
    const colors: Record<string, string> = {
      'user-1': 'bg-blue-100 text-blue-700',
      'user-2': 'bg-purple-100 text-purple-700',
      'user-3': 'bg-green-100 text-green-700'
    };
    return colors[vendedorId] || 'bg-stone-100 text-stone-700';
  }
}
