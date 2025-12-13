import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiTicketComponent } from '../../../shared/ui/ui-ticket/ui-ticket.component';
import { SalesService } from '../../../core/services/sales.service';
import { ProductService } from '../../../core/services/product.service';
import { OfflineService } from '../../../core/services/offline.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/auth/auth';
import { Sale, SaleItem, Product } from '../../../core/models';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, UiTicketComponent],
  template: `
    <div class="flex h-[calc(100vh-2rem)] gap-6 p-6 max-w-[1600px] mx-auto">
      
      <!-- Panel izquierdo: Productos -->
      <div class="flex-1 flex flex-col gap-6">
        
        <!-- Header con búsqueda y filtros -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-serif font-bold text-stone-800">Punto de Venta</h1>
              <p class="text-stone-500 text-sm">Selecciona las prendas para agregar al carrito.</p>
            </div>
            
            <!-- Buscador -->
            <div class="relative w-72">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-stone-400 text-xl">search</span>
              <input
                type="text"
                placeholder="Buscar prenda..."
                [(ngModel)]="searchQuery"
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <!-- Filtros por categoría -->
          <div class="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              (click)="selectedCategory.set(null)"
              [class.bg-stone-900]="selectedCategory() === null"
              [class.text-white]="selectedCategory() === null"
              [class.bg-stone-100]="selectedCategory() !== null"
              [class.text-stone-600]="selectedCategory() !== null"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Todas
            </button>
            @for (category of categories(); track category) {
              <button
                (click)="selectedCategory.set(category)"
                [class.bg-stone-900]="selectedCategory() === category"
                [class.text-white]="selectedCategory() === category"
                [class.bg-stone-100]="selectedCategory() !== category"
                [class.text-stone-600]="selectedCategory() !== category"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                {{ category }}
              </button>
            }
          </div>
        </div>

        <!-- Grid de productos -->
        <div class="flex-1 overflow-y-auto no-scrollbar pr-2">
          @if (loading()) {
            <!-- Skeleton loading -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              @for (skeleton of [1,2,3,4,5,6,7,8]; track skeleton) {
                <div class="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                  <div class="aspect-[3/4] bg-stone-100"></div>
                  <div class="p-3 space-y-2">
                    <div class="h-3 bg-stone-100 rounded w-1/2"></div>
                    <div class="h-4 bg-stone-100 rounded w-3/4"></div>
                    <div class="h-4 bg-stone-100 rounded w-1/3"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (filteredProducts().length === 0) {
            <!-- Estado vacío -->
            <div class="h-full flex flex-col items-center justify-center text-stone-300 space-y-3">
              <span class="material-icons-outlined text-6xl">inventory_2</span>
              <p class="text-sm font-medium">No se encontraron productos</p>
              <button 
                (click)="clearFilters()"
                class="text-xs text-stone-500 hover:text-stone-700 underline"
              >
                Limpiar filtros
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              @for (product of filteredProducts(); track product.id) {
                <button 
                  [disabled]="product.stock === 0"
                  [class.opacity-50]="product.stock === 0"
                  [class.cursor-not-allowed]="product.stock === 0"
                  class="group relative flex flex-col text-left bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:border-stone-300 transition-all overflow-hidden active:scale-[0.98] disabled:hover:shadow-sm disabled:hover:border-stone-100"
                  (click)="addToCart(product)"
                  [attr.aria-label]="'Agregar ' + product.name + ' al carrito'"
                >
                  <div class="aspect-[3/4] w-full overflow-hidden bg-stone-100 relative">
                    @if (product.image) {
                      <img 
                        [src]="product.image" 
                        [alt]="product.name"
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    } @else {
                      <div class="h-full w-full flex items-center justify-center bg-stone-200">
                        <span class="material-icons-outlined text-stone-400 text-5xl">image</span>
                      </div>
                    }
                    
                    <!-- Badge de stock -->
                    <span 
                      [class.bg-white/95]="product.stock > 10"
                      [class.bg-orange-500/95]="product.stock <= 10 && product.stock > 0"
                      [class.bg-red-500/95]="product.stock === 0"
                      [class.text-stone-600]="product.stock > 10"
                      [class.text-white]="product.stock <= 10"
                      class="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm"
                    >
                      {{ product.stock === 0 ? 'Agotado' : product.stock + ' un.' }}
                    </span>

                    @if (product.stock === 0) {
                      <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span class="text-white font-bold text-sm">SIN STOCK</span>
                      </div>
                    }
                  </div>

                  <div class="p-3">
                    <p class="text-xs text-stone-400 font-medium uppercase tracking-wide mb-0.5">
                      {{ product.category }}
                    </p>
                    <h3 class="text-sm font-semibold text-stone-800 line-clamp-1 group-hover:text-stone-600">
                      {{ product.name }}
                    </h3>
                    @if (product.sizes.length > 0 || product.colors && product.colors.length > 0) {
                      <p class="text-xs text-stone-400 mt-0.5">
                        @if (product.sizes.length > 0) { <span>{{ product.sizes[0] }}</span> }
                        @if (product.sizes.length > 0 && product.colors && product.colors.length > 0) { <span> • </span> }
                        @if (product.colors && product.colors.length > 0) { <span>{{ product.colors[0] }}</span> }
                      </p>
                    }
                    <p class="mt-1 text-base font-bold text-stone-900">
                      S/ {{ product.price | number:'1.2-2' }}
                    </p>
                  </div>

                  @if (product.stock > 0) {
                    <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div class="bg-white text-stone-900 rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <span class="material-icons-outlined">add_shopping_cart</span>
                      </div>
                    </div>
                  }
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Panel derecho: Carrito -->
      <div class="w-96 flex flex-col bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden">
        
        <!-- Header del carrito -->
        <div class="p-6 border-b border-stone-50 bg-stone-50/50">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-stone-800 flex items-center gap-2">
                <span class="material-icons-outlined text-stone-400">receipt_long</span>
                Ticket de Venta
              </h2>
              <p class="text-xs text-stone-400 mt-1">
                Orden #{{ currentTicketNumber }} • {{ cart().length }} items
              </p>
            </div>
            
            @if (cart().length > 0) {
              <button
                (click)="clearCart()"
                class="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                aria-label="Vaciar carrito"
              >
                <span class="material-icons-outlined text-sm">delete_outline</span>
                Vaciar
              </button>
            }
          </div>
        </div>

        <!-- Items del carrito -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          @if (cart().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-stone-300 space-y-3 opacity-50">
              <span class="material-icons-outlined text-5xl">shopping_bag</span>
              <p class="text-sm font-medium">El carrito está vacío</p>
              <p class="text-xs text-stone-400 text-center px-8">
                Selecciona prendas del catálogo para comenzar
              </p>
            </div>
          }

          @for (item of cart(); track item.product.id) {
            <div class="flex gap-3 items-start bg-stone-50 rounded-xl p-3 animate-in slide-in-from-right-4 duration-300 border border-stone-100">
              <!-- Imagen -->
              <div class="h-14 w-14 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200">
                <img 
                  [src]="item.product.image" 
                  [alt]="item.product.name"
                  class="h-full w-full object-cover"
                />
              </div>
              
              <!-- Info del producto -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-stone-800 truncate">
                  {{ item.product.name }}
                </p>
                <p class="text-xs text-stone-500 mt-0.5">
                  S/ {{ item.product.price | number:'1.2-2' }} c/u
                </p>
                @if (item.product.sizes.length > 0 || (item.product.colors && item.product.colors.length > 0)) {
                  <p class="text-xs text-stone-400 mt-0.5">
                    @if (item.product.sizes.length > 0) { <span>{{ item.product.sizes[0] }}</span> }
                    @if (item.product.sizes.length > 0 && item.product.colors && item.product.colors.length > 0) { <span> • </span> }
                    @if (item.product.colors && item.product.colors.length > 0) { <span>{{ item.product.colors[0] }}</span> }
                  </p>
                }
                
                <!-- Subtotal del item -->
                <p class="text-sm font-bold text-stone-900 mt-1">
                  S/ {{ (item.product.price * item.quantity) | number:'1.2-2' }}
                </p>
              </div>

              <!-- Controles de cantidad -->
              <div class="flex flex-col items-end gap-2 shrink-0">
                <button
                  (click)="removeFromCart(item.product.id)"
                  class="text-stone-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar del carrito"
                >
                  <span class="material-icons-outlined text-lg">close</span>
                </button>
                
                <div class="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-stone-200 shadow-sm">
                  <button 
                    (click)="updateQuantity(item.product.id, -1)"
                    [disabled]="item.quantity <= 1"
                    class="w-7 h-7 flex items-center justify-center rounded-md bg-stone-50 hover:bg-stone-200 text-stone-700 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span class="text-sm font-bold w-6 text-center text-stone-900">
                    {{ item.quantity }}
                  </span>
                  <button 
                    (click)="updateQuantity(item.product.id, 1)"
                    [disabled]="item.quantity >= item.product.stock"
                    class="w-7 h-7 flex items-center justify-center rounded-md bg-stone-900 text-white text-sm hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer: Totales y checkout -->
        <div class="p-6 bg-stone-50 border-t border-stone-100 space-y-4">
          
          <!-- Datos del cliente (opcional antes de pagar) -->
          @if (showClientForm()) {
            <div class="space-y-3 p-4 bg-white rounded-xl border border-stone-200">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-stone-800">Datos del Cliente</h3>
                <button
                  (click)="showClientForm.set(false)"
                  class="text-stone-400 hover:text-stone-600"
                >
                  <span class="material-icons-outlined text-lg">close</span>
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Nombre del cliente"
                [(ngModel)]="clientName"
                class="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              
              <input
                type="tel"
                placeholder="Teléfono (para WhatsApp)"
                [(ngModel)]="clientPhone"
                class="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              
              <select
                [(ngModel)]="paymentMethod"
                class="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              >
                <option value="">Método de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Yape/Plin">Yape/Plin</option>
                <option value="Transferencia">Transferencia</option>
              </select>

              @if (paymentMethod === 'Efectivo') {
                <input
                  type="number"
                  placeholder="Monto recibido"
                  [(ngModel)]="amountPaid"
                  class="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
                @if (amountPaid > total()) {
                  <p class="text-xs text-green-600 font-medium">
                    Cambio: S/ {{ (amountPaid - total()) | number:'1.2-2' }}
                  </p>
                }
              }
            </div>
          }

          <!-- Resumen de totales -->
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span>S/ {{ subtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm text-stone-500">
              <span>IGV (18%)</span>
              <span>S/ {{ tax() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-xl font-bold text-stone-900 pt-3 border-t border-stone-200">
              <span>Total</span>
              <span>S/ {{ total() | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-2">
            @if (!showClientForm()) {
              <button
                (click)="showClientForm.set(true)"
                [disabled]="cart().length === 0"
                class="w-full py-2.5 text-sm rounded-xl border-2 border-stone-200 text-stone-600 font-medium hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar datos del cliente
              </button>
            }
            
            <button
              (click)="checkout()"
              [disabled]="cart().length === 0"
              class="w-full py-4 text-base font-bold rounded-xl bg-stone-900 hover:bg-black text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
              aria-label="Proceder al pago"
            >
              <span class="material-icons-outlined">payments</span>
              Cobrar S/ {{ total() | number:'1.2-2' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal del ticket -->
    <app-ui-ticket
      [isOpen]="showTicket()"
      [items]="cart()"
      [total]="total()"
      [ticketNumber]="currentTicketNumber"
      [clientName]="clientName"
      [clientPhone]="clientPhone"
      [paymentMethod]="paymentMethod"
      [amountPaid]="amountPaid"
      (closeTicket)="onTicketClosed()"
      (ticketPrinted)="onTicketPrinted()"
      (ticketSent)="onTicketSent()"
    ></app-ui-ticket>

    <!-- Toast de notificaciones -->
    @if (showToast()) {
      <div class="fixed bottom-6 right-6 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 z-50 flex items-center gap-3">
        <span class="material-icons-outlined text-lg">{{ toastIcon() }}</span>
        <span class="text-sm font-medium">{{ toastMessage() }}</span>
      </div>
    }
  `,
  styles: [`
    /* Ocultar scrollbar pero mantener funcionalidad */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* Animaciones */
    @keyframes slideInFromRight {
      0% {
        opacity: 0;
        transform: translateX(20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInFromBottom {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-in {
      animation-fill-mode: both;
    }

    .slide-in-from-right-4 {
      animation: slideInFromRight 0.3s ease-out;
    }

    .slide-in-from-bottom-2 {
      animation: slideInFromBottom 0.3s ease-out;
    }
  `]
})
export class PosPageComponent {
  // Servicios
  private salesService = inject(SalesService);
  private productService = inject(ProductService);
  private offlineService = inject(OfflineService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  // Signals
  cart = signal<CartItem[]>([]);
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  showTicket = signal(false);
  loading = signal(false);
  showClientForm = signal(false);
  showToast = signal(false);
  toastMessage = signal('');
  toastIcon = signal('check_circle');

  // Datos del ticket
  currentTicketNumber = 4031;
  clientName = 'Cliente';
  clientPhone = '';
  paymentMethod = '';
  amountPaid = 0;
  discount = 0; // Descuento aplicado

  // ✅ PRODUCTOS SINCRONIZADOS DESDE EL SERVICIO CENTRAL
  products = this.productService.products;

  // Computed
  categories = computed(() => {
    const cats = new Set(this.products().map(p => p.category));
    return Array.from(cats);
  });

  filteredProducts = computed(() => {
    let filtered = this.products();

    // Filtrar por categoría
    if (this.selectedCategory()) {
      filtered = filtered.filter(p => p.category === this.selectedCategory());
    }

    // Filtrar por búsqueda
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  subtotal = computed(() => this.total() / 1.18);
  tax = computed(() => this.total() - this.subtotal());
  total = computed(() => {
    return this.cart().reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  });

  // Métodos del carrito
  addToCart(product: Product) {
    if (product.stock === 0) {
      this.toastService.error('Producto sin stock');
      return;
    }

    const existingItem = this.cart().find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        this.toastService.warning('Stock máximo alcanzado');
        return;
      }
      this.updateQuantity(product.id, 1);
    } else {
      this.cart.update(cart => [...cart, { product, quantity: 1 }]);
      this.toastService.success('Producto agregado al carrito');
    }
  }

  updateQuantity(productId: string, change: number) {
    this.cart.update(cart => {
      return cart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + change;
          
          if (newQuantity <= 0) {
            return item;
          }
          
          if (newQuantity > item.product.stock) {
            this.toastService.warning('Stock insuficiente');
            return item;
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  }

  removeFromCart(productId: string) {
    this.cart.update(cart => cart.filter(item => item.product.id !== productId));
    this.toastService.info('Producto eliminado');
  }

  clearCart() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.cart.set([]);
      this.toastService.info('Carrito vaciado');
    }
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set(null);
  }

  // Checkout
  checkout() {
    if (this.cart().length === 0) return;
    
    this.showTicket.set(true);
  }

  onTicketClosed() {
    // Crear y registrar la venta en el sistema
    this.completeSale();
    
    // Limpiar estado
    this.showTicket.set(false);
    this.cart.set([]);
    this.clientName = 'Cliente';
    this.clientPhone = '';
    this.paymentMethod = '';
    this.amountPaid = 0;
    this.discount = 0;
    this.showClientForm.set(false);
    this.currentTicketNumber++;
  }

  completeSale() {
    if (this.cart().length === 0) return;

    // Validar método de pago
    if (!this.paymentMethod) {
      this.toastService.warning('Selecciona un método de pago');
      return;
    }

    // Convertir items del carrito a SaleItems
    const saleItems: SaleItem[] = this.cart().map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      size: item.product.sizes[0] || 'M',
      color: item.product.colors?.[0],
      unitPrice: item.product.price,
      subtotal: item.product.price * item.quantity
    }));

    // Calcular totales
    const subtotal = this.subtotal();
    const tax = this.tax();
    const total = this.total();

    const saleData = {
      items: saleItems,
      subtotal: subtotal,
      discount: this.discount,
      tax: tax,
      total: total - this.discount,
      paymentMethod: this.getPaymentMethodType(),
      status: 'completed' as const,
      customer: this.clientName !== 'Cliente' ? {
        id: `CLI-${Date.now()}`,
        name: this.clientName,
        phone: this.clientPhone || undefined,
        totalPurchases: total,
        tier: 'nuevo' as const
      } : undefined,
      notes: this.amountPaid > 0 ? `Pagó: S/ ${this.amountPaid}, Cambio: S/ ${this.amountPaid - total}` : undefined,
      createdBy: this.authService.currentUser()?.name || 'Usuario POS',
      vendedorId: this.authService.currentUser()?.id || 'user-1'
    };

    // 🔌 DETECCIÓN AUTOMÁTICA: Online vs Offline
    
    if (this.offlineService.isOnline()) {
      // ✅ MODO ONLINE: Guardar normalmente
      const sale = this.salesService.createSale(saleData);
      this.toastService.success(`Venta ${sale.saleNumber} registrada correctamente`);
      console.log('✅ Venta registrada (ONLINE):', sale);
    } else {
      // 📴 MODO OFFLINE: Guardar en IndexedDB
      this.offlineService.saveSaleOffline(saleData);
      this.toastService.warning('Venta guardada offline. Se sincronizará cuando vuelva internet');
      console.log('📴 Venta guardada (OFFLINE):', saleData);
    }

    // ✅ El stock se reduce automáticamente en SalesService.createSale()
  }

  getPaymentMethodType(): Sale['paymentMethod'] {
    const method = this.paymentMethod.toLowerCase();
    if (method.includes('efectivo')) return 'cash';
    if (method.includes('tarjeta')) return 'card';
    if (method.includes('yape')) return 'yape';
    if (method.includes('plin')) return 'plin';
    if (method.includes('transfer')) return 'transfer';
    return 'cash';
  }

  onTicketPrinted() {
    console.log('Ticket impreso');
    this.toastService.info('Imprimiendo ticket...');
  }

  onTicketSent() {
    if (!this.clientPhone) {
      this.toastService.warning('Ingresa el teléfono del cliente');
      return;
    }
    console.log('Ticket enviado por WhatsApp');
    this.toastService.success('Ticket enviado por WhatsApp');
  }

  // Toast notifications
  toast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    this.toastMessage.set(message);
    this.toastIcon.set(icons[type]);
    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }
}