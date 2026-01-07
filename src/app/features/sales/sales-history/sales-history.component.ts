import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiPageHeaderComponent } from '../../../shared/ui/ui-page-header/ui-page-header.component';
import { UiEmptyStateComponent } from '../../../shared/ui/ui-empty-state/ui-empty-state.component';
import { UiExportMenuComponent } from '../../../shared/ui/ui-export-menu/ui-export-menu.component';
import { UiTicketComponent } from '../../../shared/ui/ui-ticket/ui-ticket.component';
import { SalesService } from '../../../core/services/sales.service';
import { AuthService } from '../../../core/auth/auth';
import { LoggerService } from '../../../core/services/logger.service';
import { Sale, SaleItem } from '../../../core/models';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule, UiEmptyStateComponent, UiExportMenuComponent, UiTicketComponent],
  templateUrl: './sales-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // 🚀 Optimización de Change Detection
})
export class SalesHistoryComponent {
  private salesService = inject(SalesService);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  // ViewChild para enfoque automático
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // 🔥 ATAJOS DE TECLADO PROFESIONALES
  @HostListener('window:keydown.f2', ['$event'])
  onF2Key(event: Event) {
    event.preventDefault();
    this.searchInput?.nativeElement?.focus();
    this.searchInput?.nativeElement?.select();
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    event.preventDefault();
    if (this.selectedSale()) {
      this.closeDetails();
    }
  }

  @HostListener('window:keydown.1', ['$event'])
  onKey1(event: Event) {
    if ((event.target as HTMLElement).tagName !== 'INPUT') {
      event.preventDefault();
      this.selectedPeriod.set('today');
    }
  }

  @HostListener('window:keydown.2', ['$event'])
  onKey2(event: Event) {
    if ((event.target as HTMLElement).tagName !== 'INPUT') {
      event.preventDefault();
      this.selectedPeriod.set('week');
    }
  }

  @HostListener('window:keydown.3', ['$event'])
  onKey3(event: Event) {
    if ((event.target as HTMLElement).tagName !== 'INPUT') {
      event.preventDefault();
      this.selectedPeriod.set('month');
    }
  }

  @HostListener('window:keydown.4', ['$event'])
  onKey4(event: Event) {
    if ((event.target as HTMLElement).tagName !== 'INPUT') {
      event.preventDefault();
      this.selectedPeriod.set('all');
    }
  }

  // Filtros
  searchQuery = signal('');
  selectedPeriod = signal<'today' | 'week' | 'month' | 'all'>('today');
  selectedPayment = signal<string | null>(null);
  selectedStatus = signal<string | null>(null);
  selectedVendor = signal<string | null>(null); // Filtro por vendedor

  constructor() {
    // SalesService se inicializa automáticamente con Supabase-first
    // Las ventas se cargan automáticamente al iniciar

    // Escuchar actualizaciones de ventas offline sincronizadas
    window.addEventListener('sales-updated', () => {
      console.log('📡 Detectado evento sales-updated');
      // Las ventas se actualizan automáticamente mediante signals
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
      sales = sales.filter(
        (s) =>
          s.saleNumber.toLowerCase().includes(query) ||
          s.customer?.name.toLowerCase().includes(query) ||
          s.items.some((item) => item.productName.toLowerCase().includes(query))
      );
    }

    // Filtro por método de pago
    if (this.selectedPayment()) {
      sales = sales.filter((s) => s.paymentMethod === this.selectedPayment());
    }

    // Filtro por estado
    if (this.selectedStatus()) {
      sales = sales.filter((s) => s.status === this.selectedStatus());
    }

    // Filtro por vendedor
    if (this.selectedVendor()) {
      sales = sales.filter((s) => s.vendedorId === this.selectedVendor());
    }

    return sales;
  });

  // Resumen de ventas filtradas
  summary = computed(() => {
    const sales = this.filteredSales();
    return {
      count: sales.length,
      total: sales.reduce((sum, s) => sum + s.total, 0),
      average: sales.length > 0 ? sales.reduce((sum, s) => sum + s.total, 0) / sales.length : 0,
    };
  });

  // Venta seleccionada para ver detalles
  selectedSale = signal<Sale | null>(null);

  // Datos formateados para exportación
  exportData = computed(() => {
    return this.filteredSales().map((sale) => ({
      'Nº Venta': sale.saleNumber,
      Fecha: new Date(sale.date).toLocaleDateString('es-PE'),
      Hora: new Date(sale.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      Cliente: sale.customer?.name || 'Cliente General',
      Vendedor: sale.createdBy || 'Usuario POS',
      Items: sale.items?.length || 0,
      Subtotal: sale.subtotal.toFixed(2),
      Descuento: sale.discount.toFixed(2),
      Total: sale.total.toFixed(2),
      'Método Pago': this.getPaymentMethodLabel(sale.paymentMethod),
      Estado:
        sale.status === 'completed'
          ? 'Completada'
          : sale.status === 'pending'
          ? 'Pendiente'
          : 'Cancelada',
    }));
  });

  // Texto descriptivo del período actual
  periodLabel = computed(() => {
    const labels = {
      today: 'Hoy',
      week: 'Esta Semana',
      month: 'Este Mes',
      all: 'Todas',
    };
    return labels[this.selectedPeriod()];
  });

  // 🎫 Estado para modal de anulación
  cancelModalOpen = signal(false);
  saleToCancel = signal<Sale | null>(null);
  cancelReason = signal('');
  restoreStock = signal(true);

  // 🔄 Estado para reimprimir ticket
  showTicketModal = signal(false);
  ticketSale = signal<Sale | null>(null);

  viewSaleDetails(sale: Sale) {
    this.selectedSale.set(sale);
  }

  closeDetails() {
    this.selectedSale.set(null);
  }

  // 🖨️ Reimprimir ticket
  reprintTicket(sale: Sale) {
    this.ticketSale.set(sale);
    this.showTicketModal.set(true);
    this.logger.log('🖨️ Reimprimiendo ticket:', sale.saleNumber);
  }

  closeTicketModal() {
    this.showTicketModal.set(false);
    this.ticketSale.set(null);
  }

  // ❌ Abrir modal de anulación
  openCancelModal(sale: Sale) {
    this.saleToCancel.set(sale);
    this.cancelReason.set('');
    this.restoreStock.set(true);
    this.cancelModalOpen.set(true);
  }

  closeCancelModal() {
    this.cancelModalOpen.set(false);
    this.saleToCancel.set(null);
    this.cancelReason.set('');
  }

  // ✅ Confirmar anulación
  confirmCancelSale() {
    const sale = this.saleToCancel();
    if (!sale) return;

    const success = this.salesService.cancelSale(
      sale.id,
      this.cancelReason() || 'Sin motivo especificado',
      this.restoreStock()
    );

    if (success) {
      this.closeCancelModal();
    }
  }

  // 🎟️ Transformar items de venta a formato de ticket
  getTicketItems(
    sale: Sale
  ): { product: { id: string; name: string; price: number }; quantity: number }[] {
    return sale.items.map((item) => ({
      product: {
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
      },
      quantity: item.quantity,
    }));
  }

  // 🔢 Extraer número de ticket del saleNumber (e.g., "V-20260107-123456" -> 123456)
  getTicketNumber(saleNumber: string): number {
    const match = saleNumber.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
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
      plin: 'Plin',
    };
    return labels[method] || method;
  }

  getStatusBadge(status: string) {
    const badges: Record<string, { label: string; class: string }> = {
      completed: {
        label: 'Completada',
        class: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
      },
      pending: {
        label: 'Pendiente',
        class: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
      },
      cancelled: {
        label: 'Cancelada',
        class: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400',
      },
    };
    return (
      badges[status] || {
        label: status,
        class: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
      }
    );
  }

  getVendorName(vendedorId: string): string {
    const user = this.authService.getAvailableUsers().find((u) => u.id === vendedorId);
    return user?.name || 'Usuario';
  }

  getVendorInitial(vendedorId: string): string {
    const name = this.getVendorName(vendedorId);
    return name.charAt(0).toUpperCase();
  }

  getVendorColor(vendedorId: string): string {
    const colors: Record<string, string> = {
      'user-1': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
      'user-2': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400',
      'user-3': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
    };
    return (
      colors[vendedorId] || 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
    );
  }

  // 🚀 FUNCIONES TRACKBY PARA OPTIMIZACIÓN DE PERFORMANCE
  trackBySaleId(_index: number, sale: Sale): string {
    return sale.id;
  }

  trackByVendor(_index: number, vendor: string): string {
    return vendor;
  }
}
