import { Component, computed, signal, inject, HostListener, ViewChild, ElementRef, ChangeDetectionStrategy, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling'; // 🚀 Virtual Scrolling
import { UiTicketComponent } from '../../../shared/ui/ui-ticket/ui-ticket.component';
import { UiSkeletonComponent } from '../../../shared/ui';
import { SalesService } from '../../../core/services/sales.service';
import { ProductService } from '../../../core/services/product.service';
import { OfflineService } from '../../../core/services/offline.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/auth/auth';
import { LoggerService } from '../../../core/services/logger.service';
import { Sale, SaleItem, Product, ProductVariant } from '../../../core/models';
import { UiAnimatedDialogComponent } from '../../../shared/ui/ui-animated-dialog/ui-animated-dialog.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { PosPaymentFacade } from '../facades/pos-payment.facade';

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant; // Variante seleccionada (talla + color)
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule, UiTicketComponent, UiSkeletonComponent, UiAnimatedDialogComponent, ImageFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush, // 🚀 Optimización de Change Detection
  template: `
    <div class="relative flex flex-col md:flex-row h-[calc(100vh-2rem)] gap-3 md:gap-6 p-3 md:p-6 w-full">
      
      <!-- Panel izquierdo: Productos -->
      <div class="flex-1 flex flex-col gap-6 min-w-0">
        
        <!-- Header con búsqueda y filtros -->
        <div class="space-y-3">
          <!-- Header limpio y minimalista -->
          <div class="flex items-center justify-between gap-3">
            <div class="flex-shrink-0">
              <h1 class="text-lg md:text-xl font-serif font-bold text-stone-800">POS</h1>
              <div class="hidden md:flex items-center gap-2 mt-1">
                <p class="text-xs text-stone-500">Busca y agrega productos al carrito</p>
                <!-- Indicador de conexión ultra compacto -->
                @if (!isOnline()) {
                  <div class="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 border border-orange-200">
                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                    <span class="text-[10px] font-medium text-orange-700">Offline</span>
                    @if (pendingSalesCount() > 0) {
                      <span class="text-[9px] bg-orange-200 text-orange-800 px-1 rounded font-bold">
                        {{ pendingSalesCount() }}
                      </span>
                    }
                  </div>
                }
              </div>
              <!-- Offline indicator móvil -->
              @if (!isOnline()) {
                <div class="flex md:hidden items-center gap-1 mt-1">
                  <div class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                  <span class="text-[10px] font-medium text-orange-700">Offline</span>
                </div>
              }
            </div>
            
            <!-- Buscador principal -->
            <div class="relative flex-1 md:w-96 md:flex-none">
              <span class="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-stone-400 text-lg md:text-xl">search</span>
              <input
                #searchInput
                type="text"
                placeholder="Buscar producto..."
                [(ngModel)]="searchQuery"
                (input)="onSearchChange($event)"
                class="w-full pl-8 md:pl-10 pr-3 md:pr-16 py-2 md:py-2.5 bg-white border border-stone-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-colors duration-100 text-sm"
                autocomplete="off"
              />
              <kbd class="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] bg-stone-100 text-stone-500 rounded border border-stone-200 font-mono">F2</kbd>
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
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-100 whitespace-nowrap"
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
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-100 whitespace-nowrap"
              >
                {{ category }}
              </button>
            }
          </div>
        </div>

        <!-- Grid de productos con Virtual Scrolling -->
        <div class="flex-1 overflow-hidden">
          @if (loading()) {
            <!-- Skeleton loading con más elementos para mejor UX -->
            <div class="overflow-y-auto no-scrollbar h-full pr-2">
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3">
                <app-ui-skeleton variant="product" [repeat]="18" />
              </div>
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
            <!-- 🚀 Virtual Scroll Viewport para 500+ productos -->
            <cdk-virtual-scroll-viewport 
              [itemSize]="220" 
              class="h-full"
              style="contain: strict;">
              
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-3 pr-2">
                @for (product of filteredProducts(); track product.id) {
                <button 
                  [disabled]="product.stock === 0"
                  [class.opacity-50]="product.stock === 0"
                  [class.cursor-not-allowed]="product.stock === 0"
                  class="group relative flex flex-col text-left bg-white rounded-2xl border border-stone-100 shadow-sm hover:border-stone-300 transition-colors duration-100 overflow-hidden disabled:hover:border-stone-100"
                  (click)="addToCart(product)"
                  [attr.aria-label]="'Agregar ' + product.name + ' al carrito'"
                >
                  <div class="aspect-[3/4] w-full overflow-hidden bg-stone-100 relative">
                    @if (product.image) {
                      <img 
                        [src]="product.image" 
                        [alt]="product.name"
                        class="h-full w-full object-cover"
                        loading="lazy"
                      />
                    } @else {
                      <div class="h-full w-full flex items-center justify-center bg-stone-200">
                        <span class="material-icons-outlined text-stone-400 text-5xl">image</span>
                      </div>
                    }
                    
                    <!-- Badge de stock mejorado con alerta visual -->
                    <div class="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <span 
                        [class.bg-white/95]="product.stock > 10"
                        [class.bg-orange-500]="product.stock <= 10 && product.stock > 5"
                        [class.bg-red-500]="product.stock <= 5 && product.stock > 0"
                        [class.bg-stone-500]="product.stock === 0"
                        [class.text-stone-600]="product.stock > 10"
                        [class.text-white]="product.stock <= 10"
                        [class.animate-pulse]="product.stock <= 5 && product.stock > 0"
                        class="text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1"
                      >
                        @if (product.stock <= 5 && product.stock > 0) {
                          <span class="material-icons-outlined text-xs">warning</span>
                        }
                        {{ product.stock === 0 ? 'Agotado' : product.stock + ' un.' }}
                      </span>
                    </div>

                    @if (product.stock === 0) {
                      <div class="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span class="text-white font-bold text-sm">SIN STOCK</span>
                      </div>
                    }
                  </div>

                  <div class="p-2.5">
                    <p class="text-[10px] text-stone-400 font-medium uppercase tracking-wide mb-0.5">
                      {{ product.category }}
                    </p>
                    <h3 class="text-xs font-semibold text-stone-800 line-clamp-1 group-hover:text-stone-600">
                      {{ product.name }}
                    </h3>
                    @if (product.sizes.length > 0 || product.colors && product.colors.length > 0) {
                      <p class="text-[10px] text-stone-400 mt-0.5">
                        @if (product.sizes.length > 0) { <span>{{ product.sizes[0] }}</span> }
                        @if (product.sizes.length > 0 && product.colors && product.colors.length > 0) { <span> • </span> }
                        @if (product.colors && product.colors.length > 0) { <span>{{ product.colors[0] }}</span> }
                      </p>
                    }
                    <p class="mt-1 text-sm font-bold text-stone-900">
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
            </cdk-virtual-scroll-viewport>
            <!-- 🚀 Fin Virtual Scroll -->
          }
        </div>
      </div>

      <!-- Panel derecho: Carrito (Desktop) -->
      <div class="hidden md:flex w-[28rem] flex-shrink-0 flex-col bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden">
        
        <!-- Header del carrito -->
        <div class="p-5 border-b border-stone-50 bg-stone-50/50">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-stone-800 flex items-center gap-2">
                <span class="material-icons-outlined text-stone-400 text-xl">receipt_long</span>
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
        <div class="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar min-h-0">
          @if (cart().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-stone-300 space-y-3 opacity-50">
              <span class="material-icons-outlined text-5xl">shopping_bag</span>
              <p class="text-sm font-medium">El carrito está vacío</p>
              <p class="text-xs text-stone-400 text-center px-8">
                Selecciona prendas del catálogo para comenzar
              </p>
            </div>
          }

          @for (item of cart(); track item.product.id + '-' + (item.variant?.id || 'no-variant')) {
            <div class="flex gap-3 items-start bg-stone-50 rounded-xl p-3.5 animate-in slide-in-from-right-4 duration-300 border border-stone-100">
              <!-- Imagen -->
              <div class="h-20 w-20 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200">
                <img 
                  [src]="item.product.image" 
                  [alt]="item.product.name"
                  loading="lazy"
                  class="h-full w-full object-cover"
                />
              </div>
              
              <!-- Info del producto -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-stone-800 truncate">
                  {{ item.product.name }}
                </p>
                <p class="text-xs text-stone-500 mt-1">
                  S/ {{ item.product.price | number:'1.2-2' }} c/u
                </p>
                @if (item.variant) {
                  <p class="text-xs text-stone-700 mt-1.5 flex items-center gap-1.5">
                    <span class="inline-flex items-center px-2 py-0.5 rounded bg-stone-900 text-white font-medium text-[10px]">
                      {{ item.variant.size }}
                    </span>
                    <span class="text-stone-400">•</span>
                    <span class="font-medium">{{ item.variant.color }}</span>
                  </p>
                }
                
                <!-- Subtotal del item -->
                <p class="text-base font-bold text-stone-900 mt-2">
                  S/ {{ (item.product.price * item.quantity) | number:'1.2-2' }}
                </p>
              </div>

              <!-- Controles de cantidad -->
              <div class="flex flex-col items-end gap-2 shrink-0">
                <button
                  (click)="removeFromCart(item.product.id, item.variant?.id)"
                  class="text-stone-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar del carrito"
                >
                  <span class="material-icons-outlined text-lg">close</span>
                </button>
                
                <div class="flex items-center gap-2 bg-white rounded-lg p-1.5 border border-stone-200 shadow-sm">
                  <button 
                    (click)="updateQuantity(item.product.id, item.variant?.id, -1)"
                    [disabled]="item.quantity <= 1"
                    class="w-8 h-8 flex items-center justify-center rounded-md bg-stone-50 hover:bg-stone-200 text-stone-700 font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span class="text-base font-bold w-8 text-center text-stone-900">
                    {{ item.quantity }}
                  </span>
                  <button 
                    (click)="updateQuantity(item.product.id, item.variant?.id, 1)"
                    [disabled]="item.quantity >= (item.variant ? item.variant.stock : item.product.stock)"
                    class="w-8 h-8 flex items-center justify-center rounded-md bg-stone-900 text-white font-bold hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer: Totales y checkout (sticky al fondo) -->
        <div class="p-5 bg-stone-50 border-t border-stone-100 space-y-3 shadow-2xl shadow-stone-200/50">
          
          <!-- Datos del cliente (inline compacto) -->
          @if (showClientForm()) {
            <div class="p-3.5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-stone-700">Cliente</h3>
                <button
                  (click)="showClientForm.set(false)"
                  class="text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <span class="material-icons-outlined text-sm">close</span>
                </button>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nombre"
                  [(ngModel)]="clientName"
                  class="px-2.5 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                
                <input
                  type="tel"
                  placeholder="Teléfono"
                  [(ngModel)]="clientPhone"
                  class="px-2.5 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>
            </div>
          }

          <!-- Resumen de totales -->
          <div class="p-5 bg-white rounded-xl border border-stone-200 shadow-sm space-y-3">
            <div class="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span class="font-medium">S/ {{ subtotal() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-sm text-stone-500">
              <span>IGV (18%)</span>
              <span class="font-medium">S/ {{ tax() | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-xl font-bold text-stone-900 pt-3 border-t border-stone-200">
              <span>Total</span>
              <span>S/ {{ total() | number:'1.2-2' }}</span>
            </div>
            @if (cart().length > 0) {
              <div class="pt-2.5 border-t border-stone-100">
                <p class="text-xs text-stone-500">
                  <span class="font-medium text-stone-700">{{ cart().length }}</span> 
                  {{ cart().length === 1 ? 'producto' : 'productos' }} en el carrito
                </p>
              </div>
            }
          </div>

          <!-- Botones de acción -->
          <div class="space-y-2">
            <!-- Métodos de pago rápido (solo si hay items) -->
            @if (cart().length > 0) {
              <div class="grid grid-cols-3 gap-2">
                <button
                  (click)="quickPayment('cash')"
                  class="px-3 py-2 bg-white rounded-lg border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors duration-100 text-xs font-semibold text-stone-700 hover:text-emerald-700"
                >
                  💵 Efectivo
                </button>
                <button
                  (click)="quickPayment('yape')"
                  class="px-3 py-2 bg-white rounded-lg border border-stone-200 hover:border-purple-500 hover:bg-purple-50 transition-colors duration-100 text-xs font-semibold text-stone-700 hover:text-purple-700"
                >
                  📱 Yape
                </button>
                <button
                  (click)="quickPayment('card')"
                  class="px-3 py-2 bg-white rounded-lg border border-stone-200 hover:border-blue-500 hover:bg-blue-50 transition-colors duration-100 text-xs font-semibold text-stone-700 hover:text-blue-700"
                >
                  💳 Tarjeta
                </button>
              </div>
            }

            @if (!showClientForm() && cart().length > 0) {
              <button
                (click)="showClientForm.set(true)"
                class="w-full py-2 text-xs rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-100 transition-colors"
              >
                + Datos del cliente
              </button>
            }
            
            <button
              (click)="checkout()"
              [disabled]="cart().length === 0"
              class="w-full py-3.5 text-sm font-bold rounded-xl bg-stone-900 hover:bg-black text-white shadow-lg transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Proceder al pago"
            >
              <span class="material-icons-outlined text-lg">payments</span>
              <span>{{ paymentMethod || 'Procesar Pago' }}</span>
              @if (cart().length > 0) {
                <kbd class="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] bg-white/10 text-white/60 rounded border border-white/20 font-mono">Enter</kbd>
              }
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 📱 Badge flotante para móvil -->
    <button
      (click)="showMobileCart.set(true)"
      class="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-stone-900 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-95 transition-transform"
    >
      <div class="relative">
        <span class="material-icons-outlined text-2xl">shopping_cart</span>
        @if (cart().length > 0) {
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {{ cart().length }}
          </div>
        }
      </div>
    </button>

    <!-- 📱 Bottom Sheet Móvil -->
    @if (showMobileCart()) {
      <div class="md:hidden fixed inset-0 z-50 flex items-end">
        <!-- Overlay -->
        <div 
          (click)="showMobileCart.set(false)"
          class="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        ></div>
        
        <!-- Sheet -->
        <div class="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-2">
            <div class="w-12 h-1.5 bg-stone-300 rounded-full"></div>
          </div>

          <!-- Header -->
          <div class="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-stone-800 flex items-center gap-2">
                  <span class="material-icons-outlined text-stone-400 text-xl">receipt_long</span>
                  Carrito
                </h2>
                <p class="text-xs text-stone-400 mt-1">
                  {{ cart().length }} {{ cart().length === 1 ? 'producto' : 'productos' }}
                </p>
              </div>
              <button
                (click)="showMobileCart.set(false)"
                class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
              >
                <span class="material-icons-outlined text-stone-500">close</span>
              </button>
            </div>
          </div>

          <!-- Items -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            @if (cart().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <span class="material-icons-outlined text-stone-300 text-4xl">shopping_cart</span>
                </div>
                <p class="text-stone-400 text-sm">Carrito vacío</p>
                <p class="text-stone-300 text-xs mt-1">Agrega productos para comenzar</p>
              </div>
            } @else {
              @for (item of cart(); track item.product.id + '-' + (item.variant?.id || 'no-variant')) {
                <div class="flex gap-3 items-start bg-stone-50 rounded-xl p-3 border border-stone-100">
                  <div class="h-16 w-16 rounded-lg bg-white overflow-hidden shrink-0 border border-stone-200">
                    <img [src]="item.product.image" [alt]="item.product.name" loading="lazy" class="h-full w-full object-cover" />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-stone-800 truncate">{{ item.product.name }}</p>
                    <p class="text-xs text-stone-500 mt-0.5">S/ {{ item.product.price | number:'1.2-2' }} c/u</p>
                    @if (item.variant) {
                      <p class="text-xs text-stone-700 mt-1 flex items-center gap-1">
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-900 text-white font-medium text-[10px]">{{ item.variant.size }}</span>
                        <span class="text-stone-400">•</span>
                        <span class="font-medium">{{ item.variant.color }}</span>
                      </p>
                    }
                    <p class="text-base font-bold text-stone-900 mt-2">S/ {{ (item.product.price * item.quantity) | number:'1.2-2' }}</p>
                  </div>

                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <button (click)="removeFromCart(item.product.id, item.variant?.id)" class="text-stone-400 hover:text-red-500 transition-colors">
                      <span class="material-icons-outlined text-lg">close</span>
                    </button>
                    
                    <div class="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-stone-200">
                      <button (click)="updateQuantity(item.product.id, item.variant?.id, -1)" [disabled]="item.quantity <= 1"
                        class="w-7 h-7 flex items-center justify-center rounded-md bg-stone-50 hover:bg-stone-200 text-stone-700 text-sm transition-colors disabled:opacity-30 active:scale-90">-</button>
                      <span class="text-sm font-bold w-6 text-center text-stone-900">{{ item.quantity }}</span>
                      <button (click)="updateQuantity(item.product.id, item.variant?.id, 1)" [disabled]="item.quantity >= (item.variant ? item.variant.stock : item.product.stock)"
                        class="w-7 h-7 flex items-center justify-center rounded-md bg-stone-900 text-white text-sm hover:bg-black transition-colors disabled:opacity-30 active:scale-90">+</button>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="p-4 bg-stone-50 border-t border-stone-100 space-y-3 shadow-xl">
             @if (showClientForm()) {
              <div class="p-3 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
                <div class="flex items-center justify-between">
                  <h3 class="text-xs font-bold text-stone-700">Cliente</h3>
                  <button (click)="showClientForm.set(false)" class="text-stone-400 hover:text-stone-600 transition-colors">
                    <span class="material-icons-outlined text-sm">close</span>
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Nombre" [(ngModel)]="clientName"
                    class="px-2.5 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all" />
                  <input type="tel" placeholder="Teléfono" [(ngModel)]="clientPhone"
                    class="px-2.5 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all" />
                </div>
              </div>
            }

            <div class="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2.5">
              <div class="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span class="font-medium">S/ {{ subtotal() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-sm text-stone-500">
                <span>IGV (18%)</span>
                <span class="font-medium">S/ {{ tax() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-xl font-bold text-stone-900 pt-2.5 border-t border-stone-200">
                <span>Total</span>
                <span>S/ {{ total() | number:'1.2-2' }}</span>
              </div>
            </div>

            @if (cart().length > 0) {
              <div class="space-y-2">
                @if (!showClientForm()) {
                  <button (click)="showClientForm.set(true)"
                    class="w-full px-3 py-2.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center justify-center gap-1.5 border border-stone-200 rounded-lg hover:border-stone-300 bg-white">
                    <span class="material-icons-outlined text-sm">person_add</span>
                    <span>+ Datos del cliente</span>
                  </button>
                }

                <div class="grid grid-cols-3 gap-2">
                  <button (click)="quickPayment('cash'); showMobileCart.set(false)"
                    class="px-3 py-3 border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors duration-100 text-xs font-medium text-stone-700 hover:text-emerald-700 flex flex-col items-center justify-center gap-1 bg-white">
                    <span class="text-xl">💵</span>
                    <span>Efectivo</span>
                  </button>
                  <button (click)="quickPayment('yape'); showMobileCart.set(false)"
                    class="px-3 py-3 border border-stone-200 hover:border-purple-500 hover:bg-purple-50 rounded-lg transition-colors duration-100 text-xs font-medium text-stone-700 hover:text-purple-700 flex flex-col items-center justify-center gap-1 bg-white">
                    <span class="text-xl">📱</span>
                    <span>Yape</span>
                  </button>
                  <button (click)="quickPayment('card'); showMobileCart.set(false)"
                    class="px-3 py-3 border border-stone-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-100 text-xs font-medium text-stone-700 hover:text-blue-700 flex flex-col items-center justify-center gap-1 bg-white">
                    <span class="text-xl">💳</span>
                    <span>Tarjeta</span>
                  </button>
                </div>
              </div>
            }

            @if (cart().length === 0) {
              <button disabled class="w-full py-3 bg-stone-100 text-stone-400 rounded-xl font-medium text-sm cursor-not-allowed">Agrega productos al carrito</button>
            }
          </div>
        </div>
      </div>
    }

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

    <!-- Modal selector de variantes -->
    <app-ui-animated-dialog 
      [isOpen]="variantSelectorOpen()" 
      (isOpenChange)="variantSelectorOpen.set($event)"
      [maxWidth]="'sm'"
    >
      @if (selectedProductForVariant()) {
        <div class="space-y-6">
          <!-- Imagen del producto -->
          <div class="flex flex-col items-center gap-3 pb-5 border-b border-stone-100">
            <div class="h-28 w-28 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 overflow-hidden shadow-sm">
              <img 
                [src]="selectedProductForVariant()!.image" 
                [alt]="selectedProductForVariant()!.name"
                loading="lazy"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="text-center space-y-1">
              <h3 class="text-lg font-bold text-stone-800 leading-tight">{{ selectedProductForVariant()!.name }}</h3>
              <p class="text-2xl font-bold text-stone-900">S/ {{ selectedProductForVariant()!.price | number:'1.2-2' }}</p>
            </div>
          </div>

          <!-- Lista de variantes minimalista -->
          <div class="space-y-2">
            <p class="text-xs font-medium text-stone-500 uppercase tracking-wide">Variantes Disponibles</p>
            <div class="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
              @for (variant of selectedProductForVariant()!.variants; track variant.id) {
                <button
                  type="button"
                  (click)="selectVariant(variant)"
                  [disabled]="variant.stock === 0"
                  class="w-full group transition-all duration-200"
                  [ngClass]="variant.stock === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02]'"
                >
                  <div 
                    class="flex items-center justify-between p-3 rounded-xl border transition-all"
                    [ngClass]="selectedVariant()?.id === variant.id 
                      ? 'border-stone-900 bg-stone-900 shadow-md' 
                      : 'border-stone-200 bg-white hover:border-stone-300'"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors"
                        [ngClass]="selectedVariant()?.id === variant.id 
                          ? 'bg-white text-stone-900' 
                          : 'bg-stone-100 text-stone-700 group-hover:bg-stone-200'"
                      >
                        {{ variant.size }}
                      </div>
                      <span class="font-medium text-sm transition-colors"
                        [ngClass]="selectedVariant()?.id === variant.id 
                          ? 'text-white' 
                          : 'text-stone-700'"
                      >
                        {{ variant.color }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-medium transition-colors"
                        [ngClass]="selectedVariant()?.id === variant.id 
                          ? 'text-white/70' 
                          : 'text-stone-400'"
                      >
                        Stock
                      </span>
                      <span class="text-sm font-bold transition-colors"
                        [ngClass]="
                          selectedVariant()?.id === variant.id 
                            ? 'text-white' 
                            : variant.stock === 0 
                              ? 'text-red-500' 
                              : 'text-stone-900'
                        "
                      >
                        {{ variant.stock }}
                      </span>
                    </div>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Botón de confirmación minimalista -->
          <button
            type="button"
            (click)="confirmVariantSelection()"
            [disabled]="!selectedVariant() || selectedVariant()!.stock === 0"
            class="w-full py-3 rounded-xl font-medium text-sm transition-all shadow-sm"
            [ngClass]="selectedVariant() && selectedVariant()!.stock > 0
              ? 'bg-stone-900 text-white hover:bg-black hover:shadow-md active:scale-[0.98]'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'"
          >
            @if (selectedVariant()) {
              <span class="flex items-center justify-center gap-2">
                <span class="material-icons-outlined text-base">add_shopping_cart</span>
                <span>Agregar al Carrito</span>
              </span>
            } @else {
              Selecciona una variante
            }
          </button>
        </div>
      }
    </app-ui-animated-dialog>
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

    @keyframes slideInFromBottomFull {
      0% {
        transform: translateY(100%);
      }
      100% {
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes slideInFromBottomFull {
      0% {
        transform: translateY(100%);
      }
      100% {
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
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

    .slide-in-from-bottom-full {
      animation: slideInFromBottomFull 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .fade-in {
      animation: fadeIn 0.2s ease-out;
    }

    .slide-in-from-bottom-full {
      animation: slideInFromBottomFull 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .fade-in {
      animation: fadeIn 0.2s ease-out;
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
  private logger = inject(LoggerService);
  private destroyRef = inject(DestroyRef);

  // ViewChild para enfoque automático
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Signals
  cart = signal<CartItem[]>([]);
  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  showTicket = signal(false);
  showClientForm = signal(false);
  showToast = signal(false);
  toastMessage = signal('');
  toastIcon = signal('check_circle');
  showMobileCart = signal(false); // 📱 Control del bottom sheet móvil
  
  // 🎯 Tipo de venta (auto-detectado por día)
  saleType = signal<'feria-acobamba' | 'feria-paucara' | 'tienda'>('tienda');

  // 🔄 Estado de carga conectado al ProductService
  loading = computed(() => this.productService.isLoading());

  // Constructor optimizado para carga rápida
  constructor() {
    // Enfocar input de búsqueda de forma más eficiente (sin effect)
    // Solo una vez cuando el componente esté listo
    const timeoutId = setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 200);
    
    // 🧹 Cleanup automático con DestroyRef
    this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
    
    // 🎯 Auto-detectar tipo de venta basado en el día
    this.autoDetectSaleType();
  }
  
  // Auto-detectar tipo de venta por día de la semana
  autoDetectSaleType(): void {
    // ✅ Optimización: calculamos una sola vez
    const dayOfWeek = new Date().getDay();
    
    if (dayOfWeek === 4) {
      this.saleType.set('feria-acobamba');
      this.logger.log('🎯 Tipo de venta: Feria Acobamba (Jueves)');
    } else if (dayOfWeek === 0) {
      this.saleType.set('feria-paucara');
      this.logger.log('🎯 Tipo de venta: Feria Paucara (Domingo)');
    } else {
      this.saleType.set('tienda');
      this.logger.log('🎯 Tipo de venta: Tienda Paucara');
    }
  }

  // 🔥 ATAJOS DE TECLADO PROFESIONALES
  @HostListener('window:keydown.f2', ['$event'])
  onF2Key(event: Event) {
    event.preventDefault();
    this.searchInput?.nativeElement?.focus();
    this.searchInput?.nativeElement?.select();
  }

  @HostListener('window:keydown.enter', ['$event'])
  onEnterKey(event: Event) {
    const target = event.target as HTMLElement;
    // Solo procesar Enter si no estamos en un input/textarea
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      if (this.cart().length > 0 && !this.showTicket()) {
        event.preventDefault();
        this.checkout();
      }
    }
  }

  @HostListener('window:keydown.escape', ['$event'])
  onEscapeKey(event: Event) {
    event.preventDefault();
    if (this.variantSelectorOpen()) {
      this.variantSelectorOpen.set(false);
    } else if (this.showTicket()) {
      this.showTicket.set(false);
    } else {
      this.clearFilters();
    }
  }

  // Datos del ticket
  currentTicketNumber = 4031;
  clientName = 'Cliente';
  clientPhone = '';
  paymentMethod = '';
  amountPaid = 0;
  discount = 0; // Descuento aplicado
  currentSale: Sale | null = null; // Venta actual para el ticket

  // Selector de variantes
  variantSelectorOpen = signal(false);
  selectedProductForVariant = signal<Product | null>(null);
  selectedVariant = signal<ProductVariant | null>(null);

  // ✅ PRODUCTOS SINCRONIZADOS DESDE EL SERVICIO CENTRAL
  products = this.productService.products;

  // Computed
  categories = computed(() => {
    const cats = new Set(this.products().map(p => p.category));
    return Array.from(cats);
  });

  // 📊 ESTADÍSTICAS DIARIAS
  todaySales = computed(() => {
    const today = new Date().toDateString();
    return this.salesService.sales().filter(s => 
      new Date(s.date).toDateString() === today
    );
  });

  dailyRevenue = computed(() => {
    return this.todaySales().reduce((sum, s) => sum + s.total, 0);
  });

  dailyProductsSold = computed(() => {
    return this.todaySales().reduce((sum, s) => 
      sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
    , 0);
  });

  averageTicket = computed(() => {
    const sales = this.todaySales().length;
    return sales > 0 ? this.dailyRevenue() / sales : 0;
  });

  // 🎯 PRODUCTOS FRECUENTES (Top 6 más vendidos)
  topProducts = computed(() => {
    const productSales = new Map<string, number>();
    
    this.salesService.sales().forEach(sale => {
      sale.items.forEach(item => {
        const current = productSales.get(item.productId) || 0;
        productSales.set(item.productId, current + item.quantity);
      });
    });

    return this.products()
      .map(p => ({
        product: p,
        sold: productSales.get(p.id) || 0
      }))
      .filter(p => p.sold > 0 && p.product.stock > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6)
      .map(p => p.product);
  });

  // 🔄 ESTADO DE CONEXIÓN
  isOnline = computed(() => this.offlineService.isOnline());
  pendingSalesCount = computed(() => {
    const pending = (this.offlineService as any).pendingSales?.() || [];
    return Array.isArray(pending) ? pending.length : 0;
  });

  // Optimizado: Memoización eficiente de productos filtrados
  filteredProducts = computed(() => {
    let filtered = this.products();

    // Filtrar por categoría
    if (this.selectedCategory()) {
      filtered = filtered.filter(p => p.category === this.selectedCategory());
    }

    // Filtrar por búsqueda (nombre, categoría, marca, o código de barras)
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) || // Búsqueda por ID
        p.variants?.some(v => v.barcode?.toLowerCase().includes(query)) // Búsqueda por código de barras
      );
    }

    // 🚀 OPTIMIZACIÓN: Limitar a 50 productos en vista inicial para renderizado rápido
    // Si hay búsqueda o filtro, mostrar todos los resultados
    const hasFilters = this.searchQuery() || this.selectedCategory();
    return hasFilters ? filtered : filtered.slice(0, 50);
  });

  // 🔥 BÚSQUEDA INTELIGENTE CON CÓDIGO DE BARRAS
  onSearchChange(event: Event) {
    const query = this.searchQuery();
    
    // Si la búsqueda tiene formato de código de barras (números puros de 8+ dígitos)
    if (/^\d{8,}$/.test(query)) {
      // Buscar por código de barras exacto
      const productByBarcode = this.products().find(p => 
        p.variants?.some(v => v.barcode === query)
      );
      
      if (productByBarcode) {
        const variant = productByBarcode.variants?.find(v => v.barcode === query);
        if (variant) {
          // Agregar automáticamente al carrito
          this.addToCartWithVariant(productByBarcode, variant);
          this.searchQuery.set(''); // Limpiar búsqueda
          this.toastService.success(`${productByBarcode.name} - ${variant.size} ${variant.color} agregado`);
          return;
        }
      }
    }
  }

  // El precio del producto YA incluye IGV (18%)
  // Total = suma de (precio × cantidad) - este es el precio final con IGV incluido
  total = computed(() => {
    return this.cart().reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  });
  
  // Subtotal = precio sin IGV (base imponible)
  subtotal = computed(() => this.total() / 1.18);
  
  // IGV = 18% calculado sobre el subtotal
  tax = computed(() => this.subtotal() * 0.18);

  // Métodos del carrito
  addToCart(product: Product) {
    if (product.stock === 0) {
      this.toastService.error('Producto sin stock');
      return;
    }

    // Si el producto tiene variantes, abrir selector
    if (product.variants && product.variants.length > 0) {
      this.selectedProductForVariant.set(product);
      this.selectedVariant.set(product.variants[0]); // Pre-seleccionar la primera
      this.variantSelectorOpen.set(true);
      return;
    }

    // Si no tiene variantes, agregar directamente
    this.addToCartWithVariant(product, undefined);
  }

  addToCartWithVariant(product: Product, variant?: ProductVariant) {
    // Verificar stock de la variante específica si existe
    if (variant && variant.stock === 0) {
      this.toastService.error('Variante sin stock');
      return;
    }

    // Buscar si ya existe esta combinación exacta en el carrito
    const existingItem = this.cart().find(item => 
      item.product.id === product.id && 
      item.variant?.id === variant?.id
    );
    
    if (existingItem) {
      const maxStock = variant ? variant.stock : product.stock;
      if (existingItem.quantity >= maxStock) {
        this.toastService.warning('Stock máximo alcanzado');
        return;
      }
      this.updateQuantity(product.id, variant?.id, 1);
    } else {
      this.cart.update(cart => [...cart, { product, quantity: 1, variant }]);
      const variantLabel = variant ? ` (${variant.size} - ${variant.color})` : '';
      this.toastService.success(`Producto agregado${variantLabel}`);
    }

    // Cerrar el selector
    this.variantSelectorOpen.set(false);
  }

  selectVariant(variant: ProductVariant) {
    this.selectedVariant.set(variant);
  }

  confirmVariantSelection() {
    const product = this.selectedProductForVariant();
    const variant = this.selectedVariant();
    
    if (product && variant) {
      this.addToCartWithVariant(product, variant);
    }
  }

  updateQuantity(productId: string, variantId: string | undefined, change: number) {
    this.cart.update(cart => {
      return cart.map(item => {
        // Verificar si es el item correcto (producto + variante)
        const isMatch = item.product.id === productId && 
                       ((!variantId && !item.variant) || (item.variant?.id === variantId));
        
        if (!isMatch) return item;
        
        const newQuantity = item.quantity + change;
        
        if (newQuantity <= 0) {
          return item;
        }
        
        // Verificar stock según si tiene variante o no
        const maxStock = item.variant ? item.variant.stock : item.product.stock;
        if (newQuantity > maxStock) {
          this.toastService.warning('Stock insuficiente');
          return item;
        }
        
        return { ...item, quantity: newQuantity };
      });
    });
  }

  removeFromCart(productId: string, variantId?: string) {
    this.cart.update(cart => cart.filter(item => {
      // Si el producto no coincide, mantenerlo
      if (item.product.id !== productId) return true;
      
      // Si ambos tienen variante, deben coincidir para eliminar
      if (variantId && item.variant?.id) {
        return item.variant.id !== variantId;
      }
      
      // Si ambos NO tienen variante, eliminar
      if (!variantId && !item.variant) {
        return false;
      }
      
      // En cualquier otro caso, mantener
      return true;
    }));
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

  // 💳 PAGO RÁPIDO (un solo click)
  quickPayment(method: 'cash' | 'yape' | 'card') {
    if (this.cart().length === 0) return;
    
    this.paymentMethod = method === 'cash' ? 'Efectivo' : method === 'yape' ? 'Yape' : 'Tarjeta';
    this.checkout();
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
    
    // 🎯 Auto-detectar tipo de venta para la próxima
    this.autoDetectSaleType();
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
      size: item.variant?.size || item.product.sizes[0] || 'M',
      color: item.variant?.color || item.product.colors?.[0],
      unitPrice: item.product.price,
      subtotal: item.product.price * item.quantity,
      variantId: item.variant?.id // Incluir ID de variante si existe
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
      saleType: this.saleType(), // 🎯 Tipo de venta registrado
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
      if (sale) {
        this.toastService.success(`Venta ${sale.saleNumber} registrada correctamente`);
        this.logger.log('✅ Venta registrada (ONLINE):', sale);
      }
    } else {
      // 📴 MODO OFFLINE: Guardar en IndexedDB
      this.offlineService.saveSaleOffline(saleData);
      this.toastService.warning('Venta guardada offline. Se sincronizará cuando vuelva internet');
      this.logger.log('📴 Venta guardada (OFFLINE):', saleData);
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
    this.logger.log('Ticket impreso');
    this.toastService.info('Imprimiendo ticket...');
  }

  onTicketSent() {
    if (!this.clientPhone) {
      this.toastService.warning('Ingresa el teléfono del cliente');
      return;
    }
    this.logger.log('Ticket enviado por WhatsApp');
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

  // 🚀 FUNCIONES TRACKBY PARA OPTIMIZACIÓN DE PERFORMANCE
  trackByProductId(_index: number, product: Product): string {
    return product.id;
  }

  trackByCartItemId(_index: number, item: CartItem): string {
    return item.product.id + (item.variant?.size || '') + (item.variant?.color || '');
  }

  trackByCategory(_index: number, category: string): string {
    return category;
  }
}